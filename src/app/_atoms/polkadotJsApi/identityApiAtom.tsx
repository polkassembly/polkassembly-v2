// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { atom } from 'jotai';
import { IOnChainIdentity } from '@shared/types';
import { IdentityService } from '../../_client-services/identity_service';

interface IIdentityCache {
	[address: string]: {
		identity: IOnChainIdentity;
		timestamp: number;
	};
}

export const identityApiAtom = atom<IdentityService | null>(null);
export const identityCacheAtom = atom<IIdentityCache>({});
