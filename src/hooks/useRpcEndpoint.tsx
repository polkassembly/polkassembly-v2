// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { useAtom } from 'jotai';
import { identityApiAtom } from '@/app/_atoms/polkadotJsApi/identityApiAtom';
import { userPreferencesAtom } from '@/app/_atoms/user/userPreferencesAtom';
import { IUserPreferences } from '@/_shared/types';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { NETWORKS_DETAILS } from '@shared/_constants/networks';

export function useRpcEndpoint() {
	const network = getCurrentNetwork();
	const [api] = useAtom(identityApiAtom);
	const [userPreferences, setUserPreferences] = useAtom(userPreferencesAtom);

	const handleRpcSwitch = async (index: number) => {
		if (api) {
			await api?.switchToNewRpcEndpoint(index);
			setUserPreferences((prev: IUserPreferences) => ({ ...prev, rpcIndex: index }));
		}
	};

	const rpcEndpoints = NETWORKS_DETAILS[network]?.rpcEndpoints || [];

	return {
		network,
		rpcEndpoints,
		userPreferences,
		handleRpcSwitch
	};
}
