// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { ENetwork, EWallet, IAuthResponse } from '@/_shared/types';
import { request } from '@/app/_client-utils/request';
import { Button } from '@/app/_shared-components/Button';
import WalletButtons from '@ui/WalletsUI/WalletButtons/WalletButtons';
import { InjectedAccount } from '@polkadot/extension-inject/types';
import { Input } from '@ui/Input';
// import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@ui/Form';
import { PasswordInput } from '@/app/_shared-components/PasswordInput';
import { AuthClientService } from '@/app/_client-services/auth_service';
import { useSetAtom } from 'jotai';
import { userAtom } from '@/app/_atoms/user/userAtom';
import classes from './Web2Login.module.scss';

const formSchema = z.object({
	emailOrUsername: z.string(),
	password: z.string()
});

function Web2Login({
	address,
	accounts,
	switchToSignup,
	onWalletChange,
	onAccountChange
}: {
	address: string;
	accounts: InjectedAccount[];
	switchToSignup: () => void;
	onWalletChange: (wallet: EWallet) => void;
	onAccountChange: (a: string) => void;
}) {
	const [loading, setLoading] = useState<boolean>(false);

	const router = useRouter();

	const setUserAtom = useSetAtom(userAtom);

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema)
	});

	const handleLogin = async (values: z.infer<typeof formSchema>) => {
		console.log(values);

		const { emailOrUsername, password } = values;

		if (emailOrUsername && password) {
			setLoading(true);
			const data = await request<IAuthResponse>(
				'/auth/actions/web2Login',
				{
					'x-network': ENetwork.POLKADOT
				},
				{
					body: JSON.stringify({
						emailOrUsername,
						password
					}),
					method: 'POST'
				}
			);
			if (!data) {
				console.log('Login failed. Please try again later.');
				setLoading(false);
				return;
			}

			if (data?.accessToken) {
				console.log('login data', data);
				const decodedData = AuthClientService.handleTokenChange(data.accessToken);

				if (decodedData) {
					setUserAtom({
						address: decodedData.defaultAddress,
						userId: String(decodedData.id),
						username: decodedData.username,
						wallet: decodedData.loginWallet
					});
				}
				router.back();
			}
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
				selectedAddress={address}
				onAddressChange={onAccountChange}
				onWalletChange={onWalletChange}
			/>
			<p className={classes.switchToSignup}>
				Don&apos;t have an account?{' '}
				<Button
					onClick={switchToSignup}
					variant='ghost'
					className='p-0 text-text_pink'
				>
					Sign Up
				</Button>
			</p>
		</div>
	);
}

export default Web2Login;
