// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { IAccessTokenPayload, IRefreshTokenPayload, IUserPreferences } from '@/_shared/types';
import { useEffect, useState } from 'react';
import { useAtomValue, useSetAtom } from 'jotai';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { useUser } from '@/hooks/useUser';
import { dayjs } from '@/_shared/_utils/dayjsInit';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { polkadotApiAtom } from '../_atoms/polkadotJsApi/polkadotJsApiAtom';
import { AuthClientService } from '../_client-services/auth_client_service';
import { ClientError } from '../_client-utils/clientError';
import { CookieClientService } from '../_client-services/cookie_client_service';
import { identityApiAtom } from '../_atoms/polkadotJsApi/identityApiAtom';
import { PolkadotApiService } from '../_client-services/polkadot_api_service';
import { IdentityService } from '../_client-services/identity_service';
import { WalletClientService } from '../_client-services/wallet_service';
import { walletAtom } from '../_atoms/wallet/walletAtom';

function Initializers({ userData, userPreferences }: { userData: IAccessTokenPayload | null; userPreferences: IUserPreferences }) {
	const network = getCurrentNetwork();

	const { user, setUser } = useUser();
	const { setUserPreferences } = useUserPreferences();

	const polkadotApi = useAtomValue(polkadotApiAtom);
	const identityApi = useAtomValue(identityApiAtom);

	const setPolkadotApiAtom = useSetAtom(polkadotApiAtom);
	const setIdentityApiAtom = useSetAtom(identityApiAtom);
	const setWalletServiceAtom = useSetAtom(walletAtom);

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

			const service = await WalletClientService.Init(network, polkadotApi, identityApi);
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
		setUserPreferences({
			...userPreferences,
			locale: userPreferences.locale,
			theme: userPreferences.theme,
			...(user?.loginAddress
				? {
						address: {
							address: user?.loginAddress
						}
					}
				: {}),
			wallet: user?.loginWallet
		});

		dayjs.locale(userPreferences.locale);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [user?.loginWallet, userPreferences.locale, userPreferences.theme]);

	// set user
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
