// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { ECookieNames, EWallet } from '@/_shared/types';
import { Button } from '@/app/_shared-components/Button';
import WalletButtons from '@ui/WalletsUI/WalletButtons/WalletButtons';
import { Input } from '@ui/Input';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@ui/Form';
import { PasswordInput } from '@ui/PasswordInput/PasswordInput';
import { AuthClientService } from '@/app/_client-services/auth_service';
import { useSetAtom } from 'jotai';
import { userAtom } from '@/app/_atoms/user/userAtom';
import ErrorMessage from '@ui/ErrorMessage';
import { CookieClientService } from '@/app/_client-services/cookie_client_service';
import classes from './Web2Login.module.scss';
import SwitchToWeb2Signup from '../SwitchToWeb2Signup/SwitchToWeb2Signup';

interface IFormFields {
	emailOrUsername: string;
	password: string;
}

function Web2Login({
	switchToSignup,
	onWalletChange,
	onTfaEnabled
}: {
	switchToSignup: () => void;
	onWalletChange: (wallet: EWallet | null) => void;
	onTfaEnabled: (token: string) => void;
}) {
	const [loading, setLoading] = useState<boolean>(false);

	const router = useRouter();

	const setUserAtom = useSetAtom(userAtom);

	const form = useForm<IFormFields>();

	const [errorMessage, setErrorMessage] = useState<string>('');

	const handleLogin = async (values: IFormFields) => {
		const { emailOrUsername, password } = values;

		if (emailOrUsername && password) {
			setLoading(true);

			const { data, error } = await AuthClientService.web2Login({
				emailOrUsername,
				password
			});

			if (error) {
				setErrorMessage(error.message || '');
				setLoading(false);
				return;
			}

			if (data) {
				if (data.isTFAEnabled && data.tfaToken) {
					onTfaEnabled(data.tfaToken);
					setLoading(false);
					return;
				}

				const accessToken = CookieClientService.getCookieInClient(ECookieNames.ACCESS_TOKEN);

				if (!accessToken) {
					setErrorMessage('No Access token found.');
					setLoading(false);
					return;
				}

				const decodedData = AuthClientService.decodeAccessToken(accessToken);

				if (decodedData) {
					setErrorMessage('');
					setUserAtom(decodedData);
				}
				router.back();
			}
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
			{errorMessage && <ErrorMessage errorMessage={errorMessage} />}
			<div className='my-4 flex justify-center text-xs text-border_grey'>Or Login with</div>
			<WalletButtons
				small
				onWalletChange={onWalletChange}
			/>
			<SwitchToWeb2Signup
				className='mt-4 justify-center'
				switchToSignup={switchToSignup}
			/>
		</div>
	);
}

export default Web2Login;
