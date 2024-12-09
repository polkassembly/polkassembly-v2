// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { EWallet, IAuthResponse } from '@/_shared/types';
import { nextApiClientFetch } from '@/app/_client-utils/nextApiClientFetch';
import { Button } from '@/app/_shared-components/Button';
import WalletButtons from '@ui/WalletsUI/WalletButtons/WalletButtons';
import { InjectedAccount } from '@polkadot/extension-inject/types';
import { Input } from '@ui/Input';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@ui/Form';
import { PasswordInput } from '@ui/PasswordInput/PasswordInput';
import { AuthClientService } from '@/app/_client-services/auth_service';
import { useSetAtom } from 'jotai';
import { userAtom } from '@/app/_atoms/user/userAtom';
import classes from './Web2Login.module.scss';
import SwitchToWeb2Signup from '../SwitchToWeb2Signup/SwitchToWeb2Signup';

const formSchema = z.object({
	emailOrUsername: z.string(),
	password: z.string()
});

function Web2Login({
	account,
	accounts,
	switchToSignup,
	onWalletChange,
	onAccountChange
}: {
	account: InjectedAccount | null;
	accounts: InjectedAccount[];
	switchToSignup: () => void;
	onWalletChange: (wallet: EWallet) => void;
	onAccountChange: (a: InjectedAccount) => void;
}) {
	const [loading, setLoading] = useState<boolean>(false);

	const router = useRouter();

	const setUserAtom = useSetAtom(userAtom);

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema)
	});

	const handleLogin = async (values: z.infer<typeof formSchema>) => {
		const { emailOrUsername, password } = values;

		if (emailOrUsername && password) {
			setLoading(true);
			const data = await nextApiClientFetch<IAuthResponse>('/auth/actions/web2Login', {
				emailOrUsername,
				password
			});
			if (!data?.accessToken) {
				console.log('Login failed. Please try again later.');
				setLoading(false);
				return;
			}

			const decodedData = AuthClientService.decodeAccessToken(data.accessToken);

			if (decodedData) {
				setUserAtom(decodedData);
			}
			router.back();
			setLoading(false);
		}
	};

	return (
		<div>
			<div>
				{/* shadcn form */}
				<Form {...form}>
					<form onSubmit={form.handleSubmit(handleLogin)}>
						<div className={classes.header}>
							<div>
								<FormField
									control={form.control}
									name='emailOrUsername'
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
			{/* <div className='my-2 flex w-full justify-center'>
				<Button
					isLoading={loading}
					onClick={handleLogin}
				>
					Login
				</Button>
			</div> */}
			<div className='my-4 flex justify-center text-xs text-border_grey'>Or Login with</div>
			<WalletButtons
				small
				accounts={accounts}
				selectedAddress={account?.address || ''}
				onAddressChange={onAccountChange}
				onWalletChange={onWalletChange}
			/>
			<SwitchToWeb2Signup switchToSignup={switchToSignup} />
		</div>
	);
}

export default Web2Login;
