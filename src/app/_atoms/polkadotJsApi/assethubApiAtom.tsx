// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { AssethubApiService } from '@/app/_client-services/assethub_api_service';
import { atom } from 'jotai';

export const assethubApiAtom = atom<AssethubApiService | null>(null);
