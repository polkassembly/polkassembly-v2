// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { useAtom } from 'jotai';
import { useMemo } from 'react';
import { polkadotApiAtom } from '@/app/_atoms/polkadotJsApi/polkadotJsApiAtom';

export const usePolkadotApiService = () => {
	const [apiService] = useAtom(polkadotApiAtom);

	return useMemo(() => {
		return { apiService };
	}, [apiService]);
};
