// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

/* eslint-disable @typescript-eslint/no-explicit-any */
import { dayjs } from '@/_shared/_utils/dayjsInit';
import { IConversationHistory, IConversationMessage } from '@/_shared/types';
import { DEFAULT_LISTING_LIMIT } from '@/_shared/_constants/listingLimit';
import { FirestoreUtils } from './firestoreUtils';
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

	static async GetConversationMessages(conversationId: string): Promise<IConversationMessage[]> {
		const querySnapshot = await this.messagesCollectionRef(conversationId).orderBy('timestamp', 'asc').get();

		const messages: IConversationMessage[] = [];
		querySnapshot.forEach((doc) => {
			const data = doc.data();
			messages.push({
				...data,
				timestamp: data.timestamp.toMillis()
			} as IConversationMessage);
		});

		return messages;
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
				timestamp: dayjs(message.timestamp).toDate()
			});

			// Save message to conversation
			const messagesRef = this.messagesCollectionRef(conversationId);
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

				const updates: Record<string, unknown> = {
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

	private static getUpdatedTitle(currentTitle: string | undefined, message: IConversationMessage): string {
		if (currentTitle !== DEFAULT_CONVERSATION_TITLE || message.sender !== 'user') {
			return currentTitle || DEFAULT_CONVERSATION_TITLE;
		}

		const truncatedText = message.text.substring(0, 50);
		return message.text.length > 50 ? `${truncatedText}...` : truncatedText;
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
