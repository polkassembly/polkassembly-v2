// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Input } from '@ui/Input';
import { Button } from '@ui/Button';
import React, { useState } from 'react';
import { request } from '@/app/_client-utils/request';
import { ENetwork, EWallet, IAuthResponse } from '@/_shared/types';
import { useRouter } from 'next/navigation';
import { AuthClientService } from '@/app/_client-services/auth_service';
import { useSetAtom } from 'jotai';
import { userAtom } from '@/app/_atoms/user/userAtom';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@ui/Form';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { PasswordInput } from '@/app/_shared-components/PasswordInput';
import WalletButtons from '@ui/WalletsUI/WalletButtons/WalletButtons';
import { InjectedAccount } from '@polkadot/extension-inject/types';
import classes from './Web2Signup.module.scss';

enum ESignupSteps {
	USERNAME = 'Create Username',
	PASSWORD = 'Set Password'
}

const formSchema = z.object({
	email: z.string(),
	username: z.string(),
	password: z.string(),
	finalPassword: z.string()
});

function Web2Signup({
	switchToLogin,
	address,
	accounts,
	onWalletChange,
	onAccountChange
}: {
	switchToLogin: () => void;
	address: string;
	accounts: InjectedAccount[];
	onWalletChange: (wallet: EWallet) => void;
	onAccountChange: (a: string) => void;
}) {
	const [step, setStep] = useState<ESignupSteps>(ESignupSteps.USERNAME);

	const setUserAtom = useSetAtom(userAtom);

	const router = useRouter();

	const [loading, setLoading] = useState<boolean>(false);

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema)
	});

	const handleSignup = async (values: z.infer<typeof formSchema>) => {
		console.log('values', values);
		const { email, password, username, finalPassword } = values;

		if (email && username && password && password === finalPassword) {
			setLoading(true);
			const data = await request<IAuthResponse>(
				'/auth/actions/web2Signup',
				{
					'x-network': ENetwork.POLKADOT
				},
				{
					body: JSON.stringify({
						email,
						username,
						password: finalPassword
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
		<Form {...form}>
			<div className={classes.header}>
				<Button
					variant='ghost'
					onClick={() => setStep(ESignupSteps.USERNAME)}
				>
					01 {ESignupSteps.USERNAME}
				</Button>
				<Button variant='ghost'>02 {ESignupSteps.PASSWORD}</Button>
			</div>
			<form onSubmit={form.handleSubmit(handleSignup)}>
				{step === ESignupSteps.USERNAME ? (
					<div className={classes.formFields}>
						<div>
							<FormField
								control={form.control}
								name='username'
								render={({ field }) => (
									<FormItem>
										<FormLabel>Enter Username</FormLabel>
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
								name='email'
								render={({ field }) => (
									<FormItem>
										<FormLabel>Enter Email</FormLabel>
										<FormControl>
											<Input
												placeholder='Type here'
												type='email'
												{...field}
											/>
										</FormControl>

										<FormMessage />
									</FormItem>
								)}
							/>
						</div>
					</div>
				) : (
					<div className={classes.formFields}>
						<div>
							<FormField
								control={form.control}
								name='password'
								render={({ field }) => (
									<FormItem>
										<FormLabel>Set Password</FormLabel>
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

						<div>
							<FormField
								control={form.control}
								name='finalPassword'
								render={({ field }) => (
									<FormItem>
										<FormLabel>Re-enter Password</FormLabel>
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
				)}
				<div className='my-4 flex justify-center text-xs text-border_grey'>Or Login with</div>
				<WalletButtons
					small
					accounts={accounts}
					selectedAddress={address}
					onAddressChange={onAccountChange}
					onWalletChange={onWalletChange}
				/>
				<p className={classes.switchToLogin}>
					Already have an Account?
					<Button
						onClick={switchToLogin}
						variant='ghost'
						className='p-0 text-text_pink'
					>
						Login
					</Button>
				</p>
				<div className={classes.footer}>
					{step === ESignupSteps.PASSWORD ? (
						<Button
							type='submit'
							isLoading={loading}
						>
							Sign Up
						</Button>
					) : (
						<Button onClick={() => setStep(ESignupSteps.PASSWORD)}>Next</Button>
					)}
				</div>
			</form>
		</Form>
	);
}

export default Web2Signup;
