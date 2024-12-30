// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { IAccessTokenPayload, IRefreshTokenPayload, IUserPreferences } from '@/_shared/types';
import { useEffect, useState } from 'react';
import { useAtomValue, useSetAtom } from 'jotai';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { userPreferencesAtom } from '../_atoms/user/userPreferencesAtom';
import { polkadotApiAtom } from '../_atoms/polkadotJsApi/polkadotJsApiAtom';
import { AuthClientService } from '../_client-services/auth_client_service';
import { ClientError } from '../_client-utils/clientError';
import { CookieClientService } from '../_client-services/cookie_client_service';
import { identityApiAtom } from '../_atoms/polkadotJsApi/identityApiAtom';
import { PolkadotApiService } from '../_client-services/polkadot_api_service';
import { IdentityService } from '../_client-services/identity_service';
import { WalletClientService } from '../_client-services/wallet_service';
import { walletAtom } from '../_atoms/wallet/walletAtom';
import { userAtom } from '../_atoms/user/userAtom';

function Initializers({ userData, userPreferences }: { userData: IAccessTokenPayload | null; userPreferences: IUserPreferences }) {
	const network = getCurrentNetwork();

	const user = useAtomValue(userAtom);
	const polkadotApi = useAtomValue(polkadotApiAtom);
	const identityApi = useAtomValue(identityApiAtom);

	const setUserPreferencesAtom = useSetAtom(userPreferencesAtom);
	const setPolkadotApi = useSetAtom(polkadotApiAtom);
	const setIdentityApi = useSetAtom(identityApiAtom);
	const setWalletService = useSetAtom(walletAtom);
	const setUser = useSetAtom(userAtom);

	const currentRefreshTokenPayload = CookieClientService.getRefreshTokenPayload();

	const [refreshTokenData, setRefreshTokenData] = useState<IRefreshTokenPayload | null>(currentRefreshTokenPayload);

	const refreshAccessToken = async () => {
		const { data, error } = await AuthClientService.refreshAccessToken();

		if (error && !data) {
			throw new ClientError(error.message);
		}

		const newUserPayload = CookieClientService.getAccessTokenPayload();
		const newRefreshTokenPayload = CookieClientService.getRefreshTokenPayload();

		if (newUserPayload) {
			setUser(newUserPayload);
		}
		if (newRefreshTokenPayload) {
			setRefreshTokenData(newRefreshTokenPayload);
		}
	};

	const restablishConnections = () => {
		if (document.visibilityState === 'hidden') return;

		polkadotApi?.reconnect();
		identityApi?.reconnect();

		if (user?.exp && Date.now() > user.exp * 1000) {
			if (refreshTokenData?.exp && Date.now() < refreshTokenData.exp * 1000) {
				refreshAccessToken();
				return;
			}

			AuthClientService.logout(() => setUser(null));
		}
	};

	useEffect(() => {
		document.addEventListener('visibilitychange', restablishConnections);

		return () => {
			document.removeEventListener('visibilitychange', restablishConnections);
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [user]);

	useEffect(() => {
		let polkadotApiIntervalId: ReturnType<typeof setInterval>;

		// init polkadot api
		(async () => {
			if (!polkadotApi) {
				const newApi = await PolkadotApiService.Init(network);
				setPolkadotApi(newApi);

				polkadotApiIntervalId = setInterval(async () => {
					try {
						await newApi.keepAlive();
					} catch {
						await newApi.switchToNewRpcEndpoint();
					}
				}, 6000);
			}
		})();

		let identityApiIntervalId: ReturnType<typeof setInterval>;

		// init identity api
		(async () => {
			if (!identityApi) {
				const newApi = await IdentityService.Init(network);
				setIdentityApi(newApi);

				identityApiIntervalId = setInterval(async () => {
					try {
						await newApi.keepAlive();
					} catch {
						await newApi.switchToNewRpcEndpoint();
					}
				}, 6000);
			}
		})();

		// init wallet service
		(async () => {
			if (polkadotApi) {
				const service = await WalletClientService.Init(network, polkadotApi);
				setWalletService(service);
			}
		})();

		setUserPreferencesAtom({
			locale: userPreferences.locale,
			theme: userPreferences.theme,
			// address: user?.defaultAddress, TODO: fix this @aadarsh012
			wallet: user?.loginWallet
		});

		return () => {
			if (polkadotApiIntervalId) {
				clearInterval(polkadotApiIntervalId);
			}
			if (polkadotApi) {
				polkadotApi.disconnect().then(() => setPolkadotApi(null));
			}
			if (identityApiIntervalId) {
				clearInterval(identityApiIntervalId);
			}
			if (identityApi) {
				identityApi.disconnect().then(() => setIdentityApi(null));
			}
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [identityApi, network, polkadotApi, user?.loginWallet, userPreferences.locale, userPreferences.theme]);

	useEffect(() => {
		if (!userData) {
			return;
		}

		setUser(userData);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [userData]);
	return null;
}

export default Initializers;
