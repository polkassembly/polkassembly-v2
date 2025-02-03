// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { OutputData } from '@editorjs/editorjs';

export class LocalStorageClientService {
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

	static setBlockEditorContent(id: string, content: OutputData) {
		this.setItem(`blockEditorContent-${id}`, JSON.stringify(content));
	}

	static getBlockEditorContent(id: string) {
		return this.getItem(`blockEditorContent-${id}`);
	}

	static removeBlockEditorContent(id: string) {
		this.removeItem(`blockEditorContent-${id}`);
	}
}
