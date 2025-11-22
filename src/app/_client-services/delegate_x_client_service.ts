// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { IDelegateXAccount, IErrorResponse } from '@/_shared/types';
import { NextApiClientService } from './next_api_client_service';

export class DelegateXClientService extends NextApiClientService {
	static async createDelegateXAccount({
		strategyId,
		contactLink,
		signatureLink,
		includeComment
	}: {
		strategyId: string;
		contactLink: string;
		signatureLink: string;
		includeComment: boolean;
	}): Promise<{ data: { success: boolean; delegateXAccount: IDelegateXAccount } | null; error: IErrorResponse | null }> {
		return NextApiClientService.createDelegateXAccount({ strategyId, contactLink, signatureLink, includeComment });
	}
}
