// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/hooks/useUser';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import Web2Signup from './Web2Signup/Web2Signup';
import Web2Login from './Web2Login/Web2Login';
import Web3Login from './Web3Login/Web3Login';
import classes from './Login.module.scss';
import HeaderLabel from './HeaderLabel';
import TwoFactorAuth from './TwoFactorAuth/TwoFactorAuth';

function Login({ isModal }: { isModal?: boolean }) {
	const router = useRouter();

	const { user } = useUser();

	useEffect(() => {
		if (user) {
			router.replace('/');
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [router]);

	const [isWeb3Login, setIsWeb3Login] = useState<boolean>(true);

	const [isWeb2Signup, setIsWeb2Signup] = useState<boolean>(false);

	const [isTFAEnabled, setIsTFAEnabled] = useState<boolean>(false);
	const [tfaToken, setTfaToken] = useState<string>('');

	const { userPreferences } = useUserPreferences();

	const switchToWeb2Login = () => {
		setIsWeb3Login(false);
		setIsWeb2Signup(false);
	};

	const switchToWeb2Signup = () => {
		setIsWeb2Signup(true);
		setIsWeb3Login(false);
	};

	const switchToWeb3Login = () => {
		setIsWeb2Signup(false);
		setIsWeb3Login(true);
	};

	const onTfaEnabled = (token: string) => {
		setIsTFAEnabled(true);
		setTfaToken(token);
	};

	return (
		<div className='login-container'>
			{!isModal && (
				<div className={classes.header}>
					<HeaderLabel />
				</div>
			)}
			<div className={!isModal ? 'px-4 py-4 sm:px-12' : ''}>
				{isTFAEnabled && userPreferences.selectedAccount && userPreferences.wallet ? (
					<TwoFactorAuth
						tfaToken={tfaToken}
						loginAddress={userPreferences.selectedAccount.address}
						loginWallet={userPreferences.wallet}
						goBack={() => {
							setTfaToken('');
							setIsTFAEnabled(false);
						}}
					/>
				) : isWeb2Signup ? (
					<Web2Signup
						onWalletChange={() => {
							switchToWeb3Login();
						}}
						switchToLogin={switchToWeb2Login}
					/>
				) : isWeb3Login ? (
					<Web3Login
						switchToWeb2={switchToWeb2Login}
						onTfaEnabled={onTfaEnabled}
					/>
				) : (
					<Web2Login
						onWalletChange={() => {
							switchToWeb3Login();
						}}
						switchToSignup={switchToWeb2Signup}
						onTfaEnabled={onTfaEnabled}
					/>
				)}
			</div>
		</div>
	);
}

export default Login;
