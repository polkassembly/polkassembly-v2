// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { atom } from 'jotai';
import { EChatState, IConversationMessage } from '@/_shared/types';

export interface KlaraChatState {
	chatState: EChatState;
	activeChatId: string | null;
	// Temporary conversation state (not yet persisted to DB)
	temporaryConversationId: string | null;
	// Local messages that haven't been saved to DB yet
	localMessages: IConversationMessage[];
}

export const chatStateAtom = atom<KlaraChatState>({
	chatState: EChatState.CLOSED,
	activeChatId: null,
	temporaryConversationId: null,
	localMessages: []
});

export const failedImageUrlsAtom = atom<Set<string>>(new Set<string>());
