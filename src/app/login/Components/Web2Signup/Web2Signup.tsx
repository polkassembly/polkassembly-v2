// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Input } from '@ui/Input';
import { Button } from '@ui/Button';
import React, { useState } from 'react';
import { nextApiClientFetch } from '@/app/_client-utils/nextApiClientFetch';
import { ESignupSteps, EWallet, IAuthResponse } from '@/_shared/types';
import { useRouter } from 'next/navigation';
import { AuthClientService } from '@/app/_client-services/auth_service';
import { useSetAtom } from 'jotai';
import { userAtom } from '@/app/_atoms/user/userAtom';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@ui/Form';
import { useForm } from 'react-hook-form';
import { PasswordInput } from '@ui/PasswordInput/PasswordInput';
import WalletButtons from '@ui/WalletsUI/WalletButtons/WalletButtons';
import { InjectedAccount } from '@polkadot/extension-inject/types';
import { emailRules, passwordRules, usernameRules } from '@/app/_client-utils/formValidations';
import classes from './Web2Signup.module.scss';
import SignupStepHeader from './SignupStepHeader';

interface IFormFields {
	email: string;
	username: string;
	password: string;
	finalPassword: string;
}

function Web2Signup({
	switchToLogin,
	account,
	accounts,
	onWalletChange,
	onAccountChange
}: {
	switchToLogin: () => void;
	account: InjectedAccount | null;
	accounts: InjectedAccount[];
	onWalletChange: (wallet: EWallet) => void;
	onAccountChange: (a: InjectedAccount) => void;
}) {
	const [step, setStep] = useState<ESignupSteps>(ESignupSteps.USERNAME);

	const setUserAtom = useSetAtom(userAtom);

	const router = useRouter();

	const [loading, setLoading] = useState<boolean>(false);

	const formData = useForm<IFormFields>();

	const handleSignup = async (values: IFormFields) => {
		const { email, password, username, finalPassword } = values;

		if (step === ESignupSteps.USERNAME && email && username) {
			setStep(ESignupSteps.PASSWORD);
			return;
		}

		if (email && username && password && password === finalPassword) {
			setLoading(true);
			const data = await nextApiClientFetch<IAuthResponse>('/auth/actions/web2Signup', {
				email,
				username,
				password: finalPassword
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
		<Form {...formData}>
			<SignupStepHeader
				step={step}
				setStep={setStep}
			/>

			<form onSubmit={formData.handleSubmit(handleSignup)}>
				{step === ESignupSteps.USERNAME ? (
					<div className={classes.formFields}>
						<div>
							<FormField
								control={formData.control}
								name='username'
								key='username'
								rules={usernameRules}
								disabled={loading}
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
								control={formData.control}
								name='email'
								key='email'
								rules={emailRules}
								disabled={loading}
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
								control={formData.control}
								name='password'
								key='password'
								rules={passwordRules}
								disabled={loading}
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
								control={formData.control}
								name='finalPassword'
								key='finalPassword'
								rules={{
									required: true,
									validate: (value, allFields) => {
										if (value !== allFields.password) return "Password don't match";
										return true;
									}
								}}
								disabled={loading}
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
					selectedAddress={account?.address || ''}
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
					{step === ESignupSteps.PASSWORD && (
						<Button
							onClick={() => setStep(ESignupSteps.USERNAME)}
							disabled={loading}
							size='lg'
							variant='secondary'
							className={classes.signupButton}
							type='button'
						>
							Go Back
						</Button>
					)}
					<Button
						type='submit'
						isLoading={loading}
						size='lg'
						className={classes.signupButton}
					>
						{step === ESignupSteps.PASSWORD ? 'Sign Up' : 'Next'}
					</Button>
				</div>
			</form>
		</Form>
	);
}

export default Web2Signup;
