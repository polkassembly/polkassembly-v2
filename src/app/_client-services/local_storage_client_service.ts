// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ValidatorService } from '@/_shared/_services/validator_service';
import { OutputData } from '@editorjs/editorjs';
import { deepParseJson } from 'deep-parse-json';

enum ELocalStorageKeys {
	DISCUSSION_POST_DATA = 'DPD',
	COMMENT_DATA = 'CDT',
	REPLY_DATA = 'RDT',
	EDIT_POST_DATA = 'EPD'
}

export class LocalStorageClientService {
	private static readonly localStorageKeysMap = {
		[ELocalStorageKeys.DISCUSSION_POST_DATA]: (): string => `${ELocalStorageKeys.DISCUSSION_POST_DATA}`,
		[ELocalStorageKeys.COMMENT_DATA]: (postId: string): string => `${ELocalStorageKeys.COMMENT_DATA}-${postId}`,
		[ELocalStorageKeys.REPLY_DATA]: (postId: string, parentCommentId: string): string => `${ELocalStorageKeys.REPLY_DATA}-${postId}-${parentCommentId}`,
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
	static setDiscussionPostData(data: OutputData) {
		this.setItem(this.localStorageKeysMap[ELocalStorageKeys.DISCUSSION_POST_DATA](), JSON.stringify(data));
	}

	static getDiscussionPostData() {
		const data = this.getItem(this.localStorageKeysMap[ELocalStorageKeys.DISCUSSION_POST_DATA]());
		const parsedData = data ? deepParseJson(data) : null;
		if (parsedData && ValidatorService.isValidBlockContent(parsedData)) {
			return parsedData as OutputData;
		}
		return null;
	}

	static deleteDiscussionPostData() {
		this.removeItem(this.localStorageKeysMap[ELocalStorageKeys.DISCUSSION_POST_DATA]());
	}

	// Comment Data
	static setCommentData(postId: string, data: OutputData) {
		this.setItem(this.localStorageKeysMap[ELocalStorageKeys.COMMENT_DATA](postId), JSON.stringify(data));
	}

	static getCommentData(postId: string) {
		const data = this.getItem(this.localStorageKeysMap[ELocalStorageKeys.COMMENT_DATA](postId));
		const parsedData = data ? deepParseJson(data) : null;
		if (parsedData && ValidatorService.isValidBlockContent(parsedData)) {
			return parsedData as OutputData;
		}
		return null;
	}

	static deleteCommentData(postId: string) {
		this.removeItem(this.localStorageKeysMap[ELocalStorageKeys.COMMENT_DATA](postId));
	}

	// Reply Data
	static setReplyData(postId: string, parentCommentId: string, data: OutputData) {
		this.setItem(this.localStorageKeysMap[ELocalStorageKeys.REPLY_DATA](postId, parentCommentId), JSON.stringify(data));
	}

	static getReplyData(postId: string, parentCommentId: string) {
		const data = this.getItem(this.localStorageKeysMap[ELocalStorageKeys.REPLY_DATA](postId, parentCommentId));
		const parsedData = data ? deepParseJson(data) : null;
		if (parsedData && ValidatorService.isValidBlockContent(parsedData)) {
			return parsedData as OutputData;
		}
		return null;
	}

	static deleteReplyData(postId: string, parentCommentId: string) {
		this.removeItem(this.localStorageKeysMap[ELocalStorageKeys.REPLY_DATA](postId, parentCommentId));
	}

	// Edit Post Data
	static setEditPostData(postId: string, data: OutputData) {
		this.setItem(this.localStorageKeysMap[ELocalStorageKeys.EDIT_POST_DATA](postId), JSON.stringify(data));
	}

	static getEditPostData(postId: string) {
		const data = this.getItem(this.localStorageKeysMap[ELocalStorageKeys.EDIT_POST_DATA](postId));
		const parsedData = data ? deepParseJson(data) : null;
		if (parsedData && ValidatorService.isValidBlockContent(parsedData)) {
			return parsedData as OutputData;
		}
		return null;
	}

	static deleteEditPostData(postId: string) {
		this.removeItem(this.localStorageKeysMap[ELocalStorageKeys.EDIT_POST_DATA](postId));
	}
}
