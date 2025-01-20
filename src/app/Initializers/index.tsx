// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { IPublicUser, IRefreshTokenPayload, IUserClientData, IUserPreferences } from '@/_shared/types';
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
import { NextApiClientService } from '../_client-services/next_api_client_service';

function Initializers({ userData, userPreferences }: { userData: IUserClientData | null; userPreferences: IUserPreferences }) {
	const network = getCurrentNetwork();

	const user = useAtomValue(userAtom);
	const polkadotApi = useAtomValue(polkadotApiAtom);
	const identityApi = useAtomValue(identityApiAtom);

	const setUserPreferencesAtom = useSetAtom(userPreferencesAtom);
	const setPolkadotApiAtom = useSetAtom(polkadotApiAtom);
	const setIdentityApiAtom = useSetAtom(identityApiAtom);
	const setWalletServiceAtom = useSetAtom(walletAtom);
	const setUserAtom = useSetAtom(userAtom);

	const currentRefreshTokenPayload = CookieClientService.getRefreshTokenPayload();

	const [refreshTokenData, setRefreshTokenData] = useState<IRefreshTokenPayload | null>(currentRefreshTokenPayload);
	const [userClientData, setUserClientData] = useState<IPublicUser | null>(null);

	const refreshAccessToken = async () => {
		const { data, error } = await AuthClientService.refreshAccessToken();

		if (error && !data) {
			throw new ClientError(error.message);
		}

		const newUserPayload = CookieClientService.getAccessTokenPayload();
		const newRefreshTokenPayload = CookieClientService.getRefreshTokenPayload();

		if (newUserPayload) {
			setUserAtom({ ...newUserPayload, rank: userClientData?.rank || 0, profileScore: userClientData?.profileScore || 0 });
		}
		if (newRefreshTokenPayload) {
			setRefreshTokenData(newRefreshTokenPayload);
		}
	};

	const fetchUserClientData = async () => {
		try {
			if (!userData?.id) {
				console.warn('No user ID available to fetch user data');
				return;
			}
			const userClientResponse = await NextApiClientService.getUserByIdApi(String(userData.id));
			if (userClientResponse?.data) {
				setUserClientData(userClientResponse.data);
			} else {
				console.error('Failed to fetch user data: No data returned');
			}
		} catch (error) {
			console.error('Error fetching user data:', error);
			// Prevent the error from breaking the app, but still set null data
			setUserClientData(null);
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

			AuthClientService.logout(() => setUserAtom(null));
		}
	};

	useEffect(() => {
		document.addEventListener('visibilitychange', restablishConnections);

		return () => {
			document.removeEventListener('visibilitychange', restablishConnections);
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [user]);

	// init identity api
	useEffect(() => {
		let identityApiIntervalId: ReturnType<typeof setInterval>;

		(async () => {
			if (identityApi) return;

			const newApi = await IdentityService.Init(network);
			setIdentityApiAtom(newApi);

			identityApiIntervalId = setInterval(async () => {
				try {
					await newApi.keepAlive();
				} catch {
					await newApi.switchToNewRpcEndpoint();
				}
			}, 6000);
		})();

		return () => {
			if (identityApiIntervalId) {
				clearInterval(identityApiIntervalId);
			}
			identityApi?.disconnect().then(() => setIdentityApiAtom(null));
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [identityApi, network]);

	// init polkadot api and wallet service
	useEffect(() => {
		let polkadotApiIntervalId: ReturnType<typeof setInterval>;

		(async () => {
			if (polkadotApi) return;

			const newApi = await PolkadotApiService.Init(network);
			setPolkadotApiAtom(newApi);

			polkadotApiIntervalId = setInterval(async () => {
				try {
					await newApi.keepAlive();
				} catch {
					await newApi.switchToNewRpcEndpoint();
				}
			}, 6000);
		})();

		// init wallet service
		(async () => {
			if (!polkadotApi) return;

			const service = await WalletClientService.Init(network, polkadotApi);
			setWalletServiceAtom(service);
		})();

		return () => {
			if (polkadotApiIntervalId) {
				clearInterval(polkadotApiIntervalId);
			}
			polkadotApi?.disconnect().then(() => setPolkadotApiAtom(null));
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [network, polkadotApi]);

	// set user preferences
	useEffect(() => {
		setUserPreferencesAtom({
			locale: userPreferences.locale,
			theme: userPreferences.theme,
			// address: user?.defaultAddress, TODO: fix this @aadarsh012
			wallet: user?.loginWallet
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [user?.loginWallet, userPreferences.locale, userPreferences.theme]);

	useEffect(() => {
		if (!userData) {
			return;
		}
		fetchUserClientData();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [userData]);

	// set user
	useEffect(() => {
		if (!userData || !userClientData) {
			return;
		}

		setUserAtom({
			...userData,
			profileScore: userClientData?.profileScore || 0,
			rank: userClientData?.rank || 0
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [userClientData]);

	return null;
}

export default Initializers;
