// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { EWeb3LoginScreens } from '@/_shared/types';
import React, { useState } from 'react';
import { WEB3_AUTH_SIGN_MESSAGE } from '@/_shared/_constants/signMessage';
import { getSubstrateAddress } from '@/_shared/_utils/getSubstrateAddress';
import { Button } from '@/app/_shared-components/Button';
import { useRouter } from 'next/navigation';
import WalletButtons from '@ui/WalletsUI/WalletButtons/WalletButtons';
import { userAtom } from '@/app/_atoms/user/userAtom';
import { useSetAtom } from 'jotai';
import { AuthClientService } from '@/app/_client-services/auth_service';
import ErrorMessage from '@/app/_shared-components/ErrorMessage';
import { CookieClientService } from '@/app/_client-services/cookie_client_service';
import { useWalletService } from '@/app/_atoms/wallet/walletAtom';
import AddressDropdown from '@/app/_shared-components/AddressDropdown/AddressDropdown';
import FetchAccountsConfirmation from '@/app/_shared-components/FetchAccountsConfirmation/FetchAccountsConfirmation';
import { useUserPreferences } from '@/app/_atoms/user/userPreferencesAtom';
import classes from './Web3Login.module.scss';
import SwitchToWeb2Signup from '../SwitchToWeb2Signup/SwitchToWeb2Signup';

function Web3Login({
	switchToWeb2,
	switchToSignup,
	onWalletChange,
	onTfaEnabled
}: {
	switchToWeb2: () => void;
	switchToSignup: () => void;
	onWalletChange: () => void;
	onTfaEnabled: (token: string) => void;
}) {
	const router = useRouter();

	const [web3Screen, setWeb3Screen] = useState<EWeb3LoginScreens>(EWeb3LoginScreens.SELECT_WALLET);

	const [userPreferences] = useUserPreferences();

	const setUserAtom = useSetAtom(userAtom);

	const [loading, setLoading] = useState(false);

	const [errorMessage, setErrorMessage] = useState<string>('');

	const walletService = useWalletService();

	const onChangeWeb3LoginScreen = (screen: EWeb3LoginScreens) => {
		setWeb3Screen(screen);
	};

	const handleLogin = async () => {
		try {
			if (!userPreferences.wallet || !userPreferences?.address?.address || !walletService) return;
			const { address } = userPreferences.address;

			setLoading(true);

			const signature = await walletService.signMessage({
				data: WEB3_AUTH_SIGN_MESSAGE,
				address,
				selectedWallet: userPreferences.wallet
			});

			if (!signature) {
				setLoading(false);
				return;
			}

			const { data, error } = await AuthClientService.web3LoginOrSignup({
				address: getSubstrateAddress(address) || address,
				signature,
				wallet: userPreferences.wallet
			});

			if (error) {
				setErrorMessage(error.message);
				setLoading(false);
				return;
			}

			if (data) {
				if (data.isTFAEnabled && data.tfaToken) {
					onTfaEnabled(data.tfaToken);
					return;
				}

				const accessTokenPayload = CookieClientService.getAccessTokenPayload();

				if (!accessTokenPayload) {
					setLoading(false);
					return;
				}

				setUserAtom(accessTokenPayload);
				router.back();
			}
			setLoading(false);
		} catch (error) {
			console.log('error', error);
			setLoading(false);
		}
	};

	return (
		<div className='w-full'>
			{web3Screen === EWeb3LoginScreens.SELECT_ADDRESS && userPreferences.wallet ? (
				<AddressDropdown />
			) : web3Screen === EWeb3LoginScreens.FETCH_CONFIRMATION && userPreferences.wallet ? (
				<FetchAccountsConfirmation
					goBack={() => onChangeWeb3LoginScreen(EWeb3LoginScreens.SELECT_WALLET)}
					switchToSignup={switchToSignup}
					onConfirm={() => onChangeWeb3LoginScreen(EWeb3LoginScreens.SELECT_ADDRESS)}
				/>
			) : (
				<WalletButtons
					onWalletChange={() => {
						onWalletChange();
						onChangeWeb3LoginScreen(EWeb3LoginScreens.FETCH_CONFIRMATION);
					}}
				/>
			)}

			{errorMessage && <ErrorMessage errorMessage={errorMessage} />}
			<div>
				{userPreferences?.address?.address && web3Screen === EWeb3LoginScreens.SELECT_ADDRESS && (
					<div className={classes.footer}>
						<Button
							isLoading={loading}
							onClick={handleLogin}
							size='lg'
							className={classes.loginButton}
						>
							Login
						</Button>
					</div>
				)}
				{web3Screen === EWeb3LoginScreens.SELECT_WALLET && (
					<div className={classes.switchToWeb2}>
						Or
						<Button
							variant='ghost'
							className='px-0 text-text_pink'
							onClick={switchToWeb2}
						>
							Login with Username
						</Button>
					</div>
				)}
				{web3Screen === EWeb3LoginScreens.SELECT_ADDRESS && (
					<SwitchToWeb2Signup
						className='mt-4 justify-center'
						switchToSignup={() => {
							switchToWeb2();
							switchToSignup();
						}}
					/>
				)}
			</div>
		</div>
	);
}

export default Web3Login;
