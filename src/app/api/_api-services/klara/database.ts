// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

/* eslint-disable @typescript-eslint/no-explicit-any */
import { dayjs } from '@/_shared/_utils/dayjsInit';
import { IConversationHistory, IConversationMessage } from '@/_shared/types';
import { DEFAULT_LISTING_LIMIT } from '@/_shared/_constants/listingLimit';
import { FirestoreUtils } from '../offchain_db_service/firestore_service/firestoreUtils';
// Helper function to clean undefined values from objects
function cleanUndefinedValues(obj: any): any {
	return Object.entries(obj).reduce((cleaned: any, [key, value]) => {
		if (value === undefined) {
			return cleaned;
		}
		return {
			...cleaned,
			[key]: value && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date) ? cleanUndefinedValues(value) : value
		};
	}, {});
}

const DEFAULT_CONVERSATION_TITLE = 'New Conversation';

export class KlaraDatabaseService extends FirestoreUtils {
	// Read methods
	static async GetUserConversations(userId: string, limit: number = DEFAULT_LISTING_LIMIT): Promise<IConversationHistory[]> {
		const querySnapshot = await this.conversationsCollectionRef().where('userId', '==', userId).where('messageCount', '>', 0).orderBy('lastActivity', 'desc').limit(limit).get();
		const conversations: IConversationHistory[] = [];

		querySnapshot.forEach((doc) => {
			const data = doc.data();
			conversations.push({
				id: doc.id, // Use Firebase document ID
				title: data.title,
				lastMessage: data.lastMessage || 'No messages yet',
				lastActivity: data.lastActivity.toMillis(),
				messageCount: data.messageCount || 0
			});
		});

		return conversations;
	}

	/**
	 * Get conversation messages with optional limit.
	 * If limit is provided, fetches only the most recent messages (more efficient for large conversations).
	 * @param conversationId - The conversation ID
	 * @param limit - Optional limit for number of message pairs (user+ai). Fetches limit * 2 messages.
	 * @returns Array of conversation messages in chronological order
	 */
	static async GetConversationMessages(conversationId: string, limit?: number): Promise<IConversationMessage[]> {
		let query = this.messagesCollectionRef().where('conversationId', '==', conversationId).orderBy('timestamp', 'desc'); // Order desc to get latest first

		// If limit provided, fetch only what we need (limit * 2 for user+ai pairs)
		if (limit && limit > 0) {
			query = query.limit(limit * 2);
		}

		const querySnapshot = await query.get();

		const messages: IConversationMessage[] = [];
		querySnapshot.forEach((doc) => {
			const data = doc.data();
			messages.push({
				...data,
				timestamp: data.timestamp.toMillis()
			} as IConversationMessage);
		});

		// Reverse to get chronological order (oldest first)
		// Then sort by timestamp and sender to ensure user messages always come before AI messages with same timestamp
		const reversed = [...messages].reverse();
		return reversed.sort((a, b) => {
			if (a.timestamp !== b.timestamp) {
				return a.timestamp - b.timestamp;
			}
			// If timestamps are equal, ensure user messages come before AI messages
			if (a.sender === 'user' && b.sender === 'ai') return -1;
			if (a.sender === 'ai' && b.sender === 'user') return 1;
			return 0;
		});
	}

	static async CreateConversation(userId: string, title?: string): Promise<string> {
		if (!userId?.trim()) {
			throw new Error('userId is required');
		}

		try {
			const conversationData = {
				title: title || DEFAULT_CONVERSATION_TITLE,
				createdAt: dayjs().toDate(),
				lastActivity: dayjs().toDate(),
				messageCount: 0,
				lastMessage: '',
				userId: userId.toString()
			};

			// Let Firebase auto-generate the ID
			const docRef = await this.conversationsCollectionRef().add(conversationData);
			const conversationId = docRef.id;

			console.log(`Created conversation ${conversationId} for user: ${userId}`);
			return conversationId;
		} catch (error) {
			console.error('Error creating conversation:', error);
			throw error;
		}
	}

	static async UpdateConversation(conversationId: string, updates: IConversationHistory): Promise<void> {
		const cleanUpdates = cleanUndefinedValues({
			...updates,
			lastActivity: dayjs().toDate()
		});

		await this.conversationsCollectionRef().doc(conversationId).set(cleanUpdates, { merge: true });
	}

	static async SaveMessageToConversation(conversationId: string, message: IConversationMessage): Promise<void> {
		try {
			// Clean the message object to remove undefined values before saving
			const cleanMessage = cleanUndefinedValues({
				...message,
				conversationId,
				timestamp: dayjs(message.timestamp).toDate()
			});

			// Save message to conversation
			const messagesRef = this.messagesCollectionRef();
			await messagesRef.add(cleanMessage);

			// Update conversation metadata efficiently
			const conversationRef = this.conversationsCollectionRef().doc(conversationId);

			await this.firestoreDb.runTransaction(async (tx) => {
				const snap = await tx.get(conversationRef);
				if (!snap.exists) return;

				const data = snap.data() || {};
				const currentTitle = data.title as string | undefined;
				// messageCount is incremented atomically below

				// Only compute a title if it's the first user message and title is default
				let newTitle: string | undefined;
				if ((currentTitle ?? DEFAULT_CONVERSATION_TITLE) === DEFAULT_CONVERSATION_TITLE && message.sender === 'user') {
					const truncatedText = message.text.substring(0, 50);
					newTitle = message.text.length > 50 ? `${truncatedText}...` : truncatedText;
				}

				const updates: Record<string, any> = {
					lastActivity: this.serverTimestamp(),
					lastMessage: message.text.substring(0, 100),
					messageCount: this.increment(1)
				};
				if (newTitle) updates.title = newTitle;

				tx.update(conversationRef, updates);
			});
		} catch (error) {
			console.error('Error saving message to conversation:', error);
			throw error;
		}
	}

	/**
	 * Batch save multiple messages to a conversation atomically.
	 * More efficient than calling SaveMessageToConversation multiple times.
	 * Creates conversation if it doesn't exist.
	 */
	static async SaveMessagesToConversation(conversationId: string, messages: IConversationMessage[], userId: string): Promise<void> {
		if (!messages || messages.length === 0) {
			return;
		}

		try {
			const messagesRef = this.messagesCollectionRef();
			const conversationRef = this.conversationsCollectionRef().doc(conversationId);

			await this.firestoreDb.runTransaction(async (tx) => {
				const snap = await tx.get(conversationRef);

				// Persist messages atomically with the metadata update
				messages.forEach((message) => {
					const cleanMessage = cleanUndefinedValues({
						...message,
						conversationId,
						timestamp: dayjs(message.timestamp).toDate()
					});
					const messageRef = messagesRef.doc();
					tx.set(messageRef, cleanMessage);
				});
				const { exists } = snap;
				const data = snap.data() || {};

				if (!exists) {
					// Create conversation if it doesn't exist
					const firstUserMessage = messages.find((m) => m.sender === 'user');
					const title = firstUserMessage
						? firstUserMessage.text.length > 50
							? `${firstUserMessage.text.substring(0, 50)}...`
							: firstUserMessage.text
						: DEFAULT_CONVERSATION_TITLE;

					const conversationData = {
						title,
						createdAt: dayjs().toDate(),
						lastActivity: dayjs().toDate(),
						messageCount: messages.length,
						lastMessage: messages[messages.length - 1]?.text?.substring(0, 100) || '',
						userId: userId.toString()
					};
					tx.set(conversationRef, conversationData);
				} else {
					// Update existing conversation
					const currentTitle = data.title as string | undefined;
					const firstUserMessage = messages.find((m) => m.sender === 'user');

					let newTitle: string | undefined;
					if (firstUserMessage && (currentTitle ?? DEFAULT_CONVERSATION_TITLE) === DEFAULT_CONVERSATION_TITLE) {
						const truncatedText = firstUserMessage.text.substring(0, 50);
						newTitle = firstUserMessage.text.length > 50 ? `${truncatedText}...` : truncatedText;
					}

					const updates: Record<string, any> = {
						lastActivity: this.serverTimestamp(),
						lastMessage: messages[messages.length - 1]?.text?.substring(0, 100) || '',
						messageCount: this.increment(messages.length)
					};
					if (newTitle) updates.title = newTitle;

					tx.update(conversationRef, updates);
				}
			});
		} catch (error) {
			console.error('Error saving messages to conversation:', error);
			throw error;
		}
	}

	static async verifyConversationOwnership(conversationId: string, userId: string): Promise<boolean> {
		if (!conversationId?.trim() || !userId?.trim()) {
			throw new Error('conversationId and userId are required');
		}

		try {
			const conversationDoc = await this.conversationsCollectionRef().doc(conversationId).get();

			if (!conversationDoc.exists) {
				return false;
			}

			const data = conversationDoc.data();
			return data?.userId === userId.toString();
		} catch (error) {
			console.error('Error verifying conversation ownership:', error);
			return false;
		}
	}

	/**
	 * Combined method to verify ownership and get messages in parallel.
	 * More efficient than calling both methods separately.
	 * @param conversationId - The conversation ID
	 * @param userId - The user ID to verify ownership
	 * @param messageLimit - Optional limit for messages
	 * @returns Object with ownership status and messages
	 */
	static async GetConversationWithMessages(conversationId: string, userId: string, messageLimit?: number): Promise<{ owns: boolean; messages: IConversationMessage[] }> {
		if (!conversationId?.trim() || !userId?.trim()) {
			throw new Error('conversationId and userId are required');
		}

		try {
			// Fetch conversation doc and messages in parallel
			const [conversationDoc, messages] = await Promise.all([
				this.conversationsCollectionRef().doc(conversationId).get(),
				this.GetConversationMessages(conversationId, messageLimit)
			]);

			const owns = conversationDoc.exists && conversationDoc.data()?.userId === userId.toString();

			return {
				owns,
				messages: owns ? messages : []
			};
		} catch (error) {
			console.error('Error getting conversation with messages:', error);
			throw error;
		}
	}

	static async GetStats(): Promise<{ totalUsers: number; totalConversations: number }> {
		try {
			// Get total conversations
			const conversationsSnapshot = await this.conversationsCollectionRef().count().get();
			const totalConversations = conversationsSnapshot.data().count;

			// Get total unique users
			const usersSnapshot = await this.conversationsCollectionRef().select('userId').get();
			const uniqueUsers = new Set(usersSnapshot.docs.map((doc) => doc.data().userId));
			const totalUsers = uniqueUsers.size;

			return { totalUsers, totalConversations };
		} catch (error) {
			console.error('Error getting Klara stats:', error);
			throw error;
		}
	}
}
