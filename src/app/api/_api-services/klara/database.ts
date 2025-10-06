// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

/* eslint-disable @typescript-eslint/no-explicit-any */
import { dayjs } from '@/_shared/_utils/dayjsInit';
import { IConversationHistory, IConversationMessage } from '@/_shared/types';
import { FirestoreUtils } from './firestoreUtils';

// Helper function to clean undefined values from objects
function cleanUndefinedValues(obj: any): any {
	return Object.entries(obj).reduce((cleaned: any, [key, value]) => {
		return value !== undefined
			? {
					...cleaned,
					[key]: value && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date) ? cleanUndefinedValues(value) : value
				}
			: cleaned;
	}, {});
}

export class KlaraDatabaseService extends FirestoreUtils {
	// Read methods
	static async GetUserConversations(userId: string): Promise<IConversationHistory[]> {
		const querySnapshot = await this.conversationsCollectionRef().where('userId', '==', userId).where('messageCount', '>', 0).orderBy('lastActivity', 'desc').get();
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
		try {
			const conversationData = {
				title: title || 'New Conversation',
				createdAt: dayjs().toDate(),
				lastActivity: dayjs().toDate(),
				messageCount: 0,
				lastMessage: '',
				userId
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

	static async DeleteConversation(userId: string, conversationId: string): Promise<void> {
		// Delete conversation metadata
		await this.conversationsCollectionRef().doc(conversationId).delete();

		// Delete all messages in the conversation
		const messagesSnapshot = await this.messagesCollectionRef(conversationId).get();

		const deletePromises = messagesSnapshot.docs.map((doc) => doc.ref.delete());
		await Promise.all(deletePromises);

		console.log(`Deleted conversation ${conversationId} for user: ${userId}`);
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

			// Update conversation metadata
			const conversationDoc = await this.conversationsCollectionRef().doc(conversationId).get();

			if (conversationDoc.exists) {
				const currentData = conversationDoc.data();
				const updateData = cleanUndefinedValues({
					...currentData,
					lastActivity: dayjs().toDate(),
					lastMessage: message.text.substring(0, 100),
					messageCount: (currentData?.messageCount || 0) + 1,
					title:
						currentData?.title === 'New Conversation' && message.sender === 'user' ? message.text.substring(0, 50) + (message.text.length > 50 ? '...' : '') : currentData?.title
				});

				await conversationDoc.ref.set(updateData, { merge: true });
			}
		} catch (error) {
			console.error('Error saving message to conversation:', error);
			throw error;
		}
	}
}

// Export legacy functions for backward compatibility
export const createConversation = KlaraDatabaseService.CreateConversation.bind(KlaraDatabaseService);
export const getUserConversations = KlaraDatabaseService.GetUserConversations.bind(KlaraDatabaseService);
export const updateConversation = KlaraDatabaseService.UpdateConversation.bind(KlaraDatabaseService);
export const deleteConversation = KlaraDatabaseService.DeleteConversation.bind(KlaraDatabaseService);
export const saveMessageToConversation = KlaraDatabaseService.SaveMessageToConversation.bind(KlaraDatabaseService);
export const getConversationMessages = KlaraDatabaseService.GetConversationMessages.bind(KlaraDatabaseService);
