// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { IAccessTokenPayload, IRefreshTokenPayload, IUserPreferences, EAccountType, IAddressRelations } from '@/_shared/types';
import { useCallback, useEffect, useState, useRef } from 'react';
import { useAtomValue, useSetAtom } from 'jotai';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { useUser } from '@/hooks/useUser';
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
import { assethubApiAtom } from '../_atoms/polkadotJsApi/assethubApiAtom';
import { AssethubApiService } from '../_client-services/assethub_api_service';
import { NextApiClientService } from '../_client-services/next_api_client_service';

function Initializers({ userData, userPreferences }: { userData: IAccessTokenPayload | null; userPreferences: IUserPreferences }) {
	const network = getCurrentNetwork();

	const { user, setUser, setUserAddressRelations } = useUser();
	const { setUserPreferences } = useUserPreferences();

	const polkadotApi = useAtomValue(polkadotApiAtom);
	const identityApi = useAtomValue(identityApiAtom);
	const assethubApi = useAtomValue(assethubApiAtom);

	const setPolkadotApiAtom = useSetAtom(polkadotApiAtom);
	const setIdentityApiAtom = useSetAtom(identityApiAtom);
	const setAssethubApiAtom = useSetAtom(assethubApiAtom);

	const setWalletServiceAtom = useSetAtom(walletAtom);

	const currentRefreshTokenPayload = CookieClientService.getRefreshTokenPayload();

	const [refreshTokenData, setRefreshTokenData] = useState<IRefreshTokenPayload | null>(currentRefreshTokenPayload);
	const debounceTimeoutRef = useRef<number | null>(null);

	const refreshAccessToken = useCallback(async () => {
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
	}, [setUser]);

	const restablishConnections = useCallback(() => {
		if (document.visibilityState === 'hidden') return;

		polkadotApi?.reconnect();
		identityApi?.reconnect();
		assethubApi?.reconnect();

		if (user?.exp && Date.now() > user.exp * 1000) {
			if (refreshTokenData?.exp && Date.now() < refreshTokenData.exp * 1000) {
				refreshAccessToken();
				return;
			}

			AuthClientService.logout(() => setUser(null));
		}
	}, [assethubApi, identityApi, polkadotApi, refreshAccessToken, refreshTokenData, user, setUser]);

	// Throttled with a 1 second delay
	const throttledRestablishConnections = useCallback(() => {
		let timeoutId: number;
		return () => {
			if (timeoutId) window.clearTimeout(timeoutId);
			timeoutId = window.setTimeout(() => {
				restablishConnections();
			}, 1000);
		};
	}, [restablishConnections])();

	// restablish connections
	useEffect(() => {
		document.addEventListener('visibilitychange', throttledRestablishConnections);

		// Capture ref value inside effect body
		const timeoutId = debounceTimeoutRef.current;

		return () => {
			document.removeEventListener('visibilitychange', throttledRestablishConnections);
			// Clean up using captured value
			if (timeoutId !== null) {
				window.clearTimeout(timeoutId);
			}
		};
	}, [throttledRestablishConnections]);

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

	// init assethub api
	useEffect(() => {
		let assethubApiIntervalId: ReturnType<typeof setInterval>;

		(async () => {
			if (assethubApi) return;

			const newApi = await AssethubApiService.Init(network);
			setAssethubApiAtom(newApi);

			assethubApiIntervalId = setInterval(async () => {
				try {
					await newApi.keepAlive();
				} catch {
					await newApi.reconnect();
				}
			}, 6000);
		})();

		return () => {
			if (assethubApiIntervalId) {
				clearInterval(assethubApiIntervalId);
			}
			assethubApi?.disconnect().then(() => setAssethubApiAtom(null));
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [assethubApi, network]);

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

			const service = await WalletClientService.Init(network, polkadotApi, identityApi || undefined);
			setWalletServiceAtom(service);
		})();

		return () => {
			if (polkadotApiIntervalId) {
				clearInterval(polkadotApiIntervalId);
			}
			polkadotApi?.disconnect().then(() => setPolkadotApiAtom(null));
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [network, polkadotApi, identityApi]);

	// set user preferences
	useEffect(() => {
		const locale = CookieClientService.getLocaleCookie();
		const theme = CookieClientService.getThemeCookie();
		const accessTokenPayload = CookieClientService.getAccessTokenPayload();

		setUserPreferences({
			...userPreferences,
			locale: locale || userPreferences.locale,
			theme: theme || userPreferences.theme,
			...(accessTokenPayload?.loginAddress
				? {
						address: {
							address: accessTokenPayload.loginAddress,
							accountType: EAccountType.REGULAR,
							name: '',
							type: undefined,
							wallet: accessTokenPayload?.loginWallet
						}
					}
				: {}),
			wallet: accessTokenPayload?.loginWallet
		});

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	// set user
	useEffect(() => {
		if (!userData) {
			return;
		}

		setUser(userData);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [userData]);

	// set address relations
	useEffect(() => {
		const fetchAddressRelations = async () => {
			const userAddresses = userData?.addresses;
			if (!userAddresses?.length) return;

			const addressRelations: IAddressRelations[] = [];

			// eslint-disable-next-line no-restricted-syntax
			for (const address of userAddresses) {
				// eslint-disable-next-line no-continue
				if (!address) continue;

				// eslint-disable-next-line no-await-in-loop
				const { data, error } = await NextApiClientService.fetchAddressRelations(address);
				if (!error && data) {
					addressRelations.push(data);
				}
			}

			setUserAddressRelations(addressRelations);
		};

		fetchAddressRelations();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [userData]);

	return null;
}

export default Initializers;
