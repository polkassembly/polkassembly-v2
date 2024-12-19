// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Input } from '@ui/Input';
import { Button } from '@ui/Button';
import React, { useState } from 'react';
import { ECookieNames, ESignupSteps, EWallet } from '@/_shared/types';
import { useRouter } from 'next/navigation';
import { AuthClientService } from '@/app/_client-services/auth_service';
import { useSetAtom } from 'jotai';
import { userAtom } from '@/app/_atoms/user/userAtom';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@ui/Form';
import { useForm } from 'react-hook-form';
import { PasswordInput } from '@ui/PasswordInput/PasswordInput';
import WalletButtons from '@ui/WalletsUI/WalletButtons/WalletButtons';
import { ValidatorService } from '@/_shared/_services/validator_service';
import ErrorMessage from '@/app/_shared-components/ErrorMessage';
import { CookieClientService } from '@/app/_client-services/cookie_client_service';
import SignupStepHeader from './SignupStepHeader';
import classes from './Web2Signup.module.scss';

interface IFormFields {
	email: string;
	username: string;
	password: string;
	finalPassword: string;
}

function Web2Signup({ switchToLogin, onWalletChange }: { switchToLogin: () => void; onWalletChange: (wallet: EWallet | null) => void }) {
	const [step, setStep] = useState<ESignupSteps>(ESignupSteps.USERNAME);

	const setUserAtom = useSetAtom(userAtom);

	const router = useRouter();

	const [loading, setLoading] = useState<boolean>(false);

	const [errorMessage, setErrorMessage] = useState<string>('');

	const formData = useForm<IFormFields>();

	const handleSignup = async (values: IFormFields) => {
		const { email, password, username, finalPassword } = values;

		if (step === ESignupSteps.USERNAME && email && username) {
			const { data, error } = await AuthClientService.checkForUsernameAndEmail({
				username,
				email
			});

			if (error) {
				setErrorMessage(error.message);
				return;
			}

			if (data && !data.usernameExists && !data.emailExists) {
				setErrorMessage('');
				setStep(ESignupSteps.PASSWORD);
				return;
			}
			return;
		}

		if (email && username && password && password === finalPassword) {
			setLoading(true);

			const { data, error } = await AuthClientService.web2Signup({
				email,
				username,
				password: finalPassword
			});

			if (error) {
				setErrorMessage(error.message || '');
				setLoading(false);
				return;
			}

			if (data) {
				const accessToken = CookieClientService.getCookieInClient(ECookieNames.ACCESS_TOKEN);

				if (!accessToken) {
					setErrorMessage('No Access token found.');
					setLoading(false);
					return;
				}

				const decodedData = CookieClientService.decodeAccessToken(accessToken);

				if (decodedData) {
					setUserAtom(decodedData);
					setErrorMessage('');
				}

				router.back();
			}
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
								rules={{
									validate: (value) => {
										if (!ValidatorService.isValidUsername(value)) return 'Invalid username';
										return true;
									},
									required: true
								}}
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
								rules={{
									validate: (value) => {
										if (!ValidatorService.isValidEmail(value)) return 'Invalid Email';
										return true;
									},
									required: true
								}}
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
								rules={{
									validate: (value) => {
										if (!ValidatorService.isValidPassword(value)) return 'Invalid Password';
										return true;
									},
									required: true
								}}
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
				{errorMessage && <ErrorMessage errorMessage={errorMessage} />}
				<div className='my-4 flex justify-center text-xs text-border_grey'>Or Login with</div>
				<WalletButtons
					small
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
