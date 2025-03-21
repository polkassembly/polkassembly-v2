// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

enum ELocalStorageKeys {
	DISCUSSION_POST_DATA = 'DPD',
	COMMENT_DATA = 'CDT',
	REPLY_DATA = 'RDT',
	EDIT_POST_DATA = 'EPD'
}

export class LocalStorageClientService {
	private static readonly localStorageKeysMap = {
		[ELocalStorageKeys.DISCUSSION_POST_DATA]: (): string => `${ELocalStorageKeys.DISCUSSION_POST_DATA}`,
		[ELocalStorageKeys.COMMENT_DATA]: (postId: string, parentCommentId?: string): string => `${ELocalStorageKeys.COMMENT_DATA}-${postId}-${parentCommentId || ''}`,
		[ELocalStorageKeys.EDIT_POST_DATA]: (postId: string): string => `${ELocalStorageKeys.EDIT_POST_DATA}-${postId}`
	} as const;

	private static setItem(key: string, value: string) {
		localStorage.setItem(key, value);
	}

	private static getItem(key: string) {
		return localStorage.getItem(key);
	}

	private static removeItem(key: string) {
		localStorage.removeItem(key);
	}

	private static clear() {
		localStorage.clear();
	}

	// Discussion Post Data
	static setDiscussionPostData({ data }: { data: string }) {
		this.setItem(this.localStorageKeysMap[ELocalStorageKeys.DISCUSSION_POST_DATA](), data);
	}

	static getDiscussionPostData() {
		return this.getItem(this.localStorageKeysMap[ELocalStorageKeys.DISCUSSION_POST_DATA]()) || null;
	}

	static deleteDiscussionPostData() {
		this.removeItem(this.localStorageKeysMap[ELocalStorageKeys.DISCUSSION_POST_DATA]());
	}

	// Comment Data
	static setCommentData({ postId, parentCommentId, data }: { postId: string; parentCommentId?: string; data: string }) {
		this.setItem(this.localStorageKeysMap[ELocalStorageKeys.COMMENT_DATA](postId, parentCommentId), data);
	}

	static getCommentData({ postId, parentCommentId }: { postId: string; parentCommentId?: string }) {
		return this.getItem(this.localStorageKeysMap[ELocalStorageKeys.COMMENT_DATA](postId, parentCommentId)) || null;
	}

	static deleteCommentData({ postId, parentCommentId }: { postId: string; parentCommentId?: string }) {
		this.removeItem(this.localStorageKeysMap[ELocalStorageKeys.COMMENT_DATA](postId, parentCommentId));
	}

	// Edit Post Data
	static setEditPostData({ postId, data }: { postId: string; data: string }) {
		this.setItem(this.localStorageKeysMap[ELocalStorageKeys.EDIT_POST_DATA](postId), data);
	}

	static getEditPostData({ postId }: { postId: string }) {
		return this.getItem(this.localStorageKeysMap[ELocalStorageKeys.EDIT_POST_DATA](postId)) || null;
	}

	static deleteEditPostData({ postId }: { postId: string }) {
		this.removeItem(this.localStorageKeysMap[ELocalStorageKeys.EDIT_POST_DATA](postId));
	}

	// logout
	static logout() {
		this.clear();
	}
}
