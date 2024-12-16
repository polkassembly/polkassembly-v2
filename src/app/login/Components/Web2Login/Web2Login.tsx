// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { EAuthCookieNames, EWallet, IAuthResponse } from '@/_shared/types';
import { nextApiClientFetch } from '@/app/_client-utils/nextApiClientFetch';
import { Button } from '@/app/_shared-components/Button';
import WalletButtons from '@ui/WalletsUI/WalletButtons/WalletButtons';
import { InjectedAccount } from '@polkadot/extension-inject/types';
import { Input } from '@ui/Input';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@ui/Form';
import { PasswordInput } from '@ui/PasswordInput/PasswordInput';
import { AuthClientService } from '@/app/_client-services/auth_service';
import { useSetAtom } from 'jotai';
import { userAtom } from '@/app/_atoms/user/userAtom';
import { getCookie } from 'cookies-next/client';
import { apiError } from '@/app/_client-utils/apiError';
import ErrorMessage from '@ui/ErrorMessage';
import classes from './Web2Login.module.scss';
import SwitchToWeb2Signup from '../SwitchToWeb2Signup/SwitchToWeb2Signup';

interface IFormFields {
	emailOrUsername: string;
	password: string;
}

function Web2Login({
	account,
	accounts,
	switchToSignup,
	onWalletChange,
	onAccountChange,
	getAccounts,
	onTfaEnabled
}: {
	account: InjectedAccount | null;
	accounts: InjectedAccount[];
	switchToSignup: () => void;
	onWalletChange: (wallet: EWallet | null) => void;
	onAccountChange: (a: InjectedAccount) => void;
	getAccounts: (wallet: EWallet) => void;
	onTfaEnabled: (token: string) => void;
}) {
	const [loading, setLoading] = useState<boolean>(false);

	const router = useRouter();

	const setUserAtom = useSetAtom(userAtom);

	const form = useForm<IFormFields>();

	const [error, setError] = useState<string>('');

	const handleLogin = async (values: IFormFields) => {
		const { emailOrUsername, password } = values;

		if (emailOrUsername && password) {
			setLoading(true);
			const data = await nextApiClientFetch<IAuthResponse>('/auth/actions/web2Login', {
				emailOrUsername,
				password
			});
			if (!data) {
				console.log('Login failed. Please try again later.');
				setLoading(false);
				return;
			}

			if (data.status && apiError(data.status)) {
				setError(data.message || '');
				setLoading(false);
				return;
			}

			if (data.isTFAEnabled && data.tfaToken) {
				onTfaEnabled(data.tfaToken);
				setLoading(false);
				return;
			}

			const accessToken = getCookie(EAuthCookieNames.ACCESS_TOKEN);

			if (!accessToken) {
				console.log('No Access token found.');
				setError('Login Failed');
				setLoading(false);
				return;
			}

			const decodedData = AuthClientService.decodeAccessToken(accessToken);

			if (decodedData) {
				setError('');
				setUserAtom(decodedData);
			}
			router.back();
			setLoading(false);
		}
	};

	return (
		<div>
			<div>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(handleLogin)}>
						<div className={classes.header}>
							<div>
								<FormField
									control={form.control}
									name='emailOrUsername'
									key='emailOrUsername'
									disabled={loading}
									rules={{ required: true }}
									render={({ field }) => (
										<FormItem>
											<FormLabel>Enter Username or Email</FormLabel>
											<FormControl>
												<Input
													placeholder='Type here'
													type='text'
													{...field}
												/>
											</FormControl>

											<FormMessage />
										</FormItem>
									)}
								/>
							</div>

							<div>
								<FormField
									control={form.control}
									name='password'
									key='password'
									rules={{ required: true }}
									disabled={loading}
									render={({ field }) => (
										<FormItem>
											<FormLabel>Enter Password</FormLabel>
											<FormControl>
												<PasswordInput
													placeholder='Type here'
													{...field}
												/>
											</FormControl>

											<FormMessage />
										</FormItem>
									)}
								/>
							</div>
						</div>
						<div className={classes.footer}>
							<Button
								isLoading={loading}
								type='submit'
								className={classes.loginButton}
								size='lg'
							>
								Login
							</Button>
						</div>
					</form>
				</Form>
			</div>
			{error && <ErrorMessage errorMessage={error} />}
			<div className='my-4 flex justify-center text-xs text-border_grey'>Or Login with</div>
			<WalletButtons
				small
				accounts={accounts}
				selectedAddress={account?.address || ''}
				onAddressChange={onAccountChange}
				onWalletChange={onWalletChange}
				switchToSignup={switchToSignup}
				getAccounts={getAccounts}
			/>
			<SwitchToWeb2Signup
				className='mt-4 justify-center'
				switchToSignup={switchToSignup}
			/>
		</div>
	);
}

export default Web2Login;
