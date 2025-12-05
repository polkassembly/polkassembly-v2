// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { useAtom } from 'jotai';
import { useMemo } from 'react';
import { polkadotApiAtom, polkadotJSApiAtom } from '@/app/_atoms/polkadotJsApi/polkadotJsApiAtom';
import { ENetwork } from '@/_shared/types';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';

export const usePolkadotApiService = () => {
	const [papiService] = useAtom(polkadotApiAtom);
	const [jsApiService] = useAtom(polkadotJSApiAtom);

	const network = getCurrentNetwork();

	return useMemo(() => {
		return { apiService: network === ENetwork.POLKADOT ? papiService : jsApiService };
	}, [jsApiService, papiService, network]);
};
