// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Input } from '@ui/Input';
import { Button } from '@ui/Button';
import React, { useState } from 'react';
import { ESignupSteps, EWallet, NotificationType } from '@/_shared/types';
import { useRouter, useSearchParams } from 'next/navigation';
import { AuthClientService } from '@/app/_client-services/auth_client_service';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@ui/Form';
import { useForm } from 'react-hook-form';
import { PasswordInput } from '@ui/PasswordInput/PasswordInput';
import WalletButtons from '@ui/WalletsUI/WalletButtons/WalletButtons';
import { ValidatorService } from '@/_shared/_services/validator_service';
import ErrorMessage from '@/app/_shared-components/ErrorMessage';
import { CookieClientService } from '@/app/_client-services/cookie_client_service';
import { useUser } from '@/hooks/useUser';
import { useTranslations } from 'next-intl';
import { useToast } from '@/hooks/useToast';
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
	const t = useTranslations();

	const { setUser } = useUser();

	const { toast } = useToast();

	const router = useRouter();

	const [loading, setLoading] = useState<boolean>(false);

	const [errorMessage, setErrorMessage] = useState<string>('');

	const formData = useForm<IFormFields>();

	const searchParams = useSearchParams();
	const nextUrl = searchParams.get('nextUrl');

	const handleSignup = async (values: IFormFields) => {
		try {
			const { email, password, username, finalPassword } = values;

			if (step === ESignupSteps.USERNAME && email && username) {
				setLoading(true);
				const { data, error } = await AuthClientService.checkForUsernameAndEmail({
					username,
					email
				});

				if (error) {
					setErrorMessage(error.message);
					setLoading(false);
					return;
				}

				if (data && !data.usernameExists && !data.emailExists) {
					setErrorMessage('');
					setStep(ESignupSteps.PASSWORD);
					setLoading(false);
					return;
				}
				setLoading(false);
				return;
			}

			if (email && username && password && password === finalPassword) {
				setLoading(true);

				const { data, error } = await AuthClientService.web2Signup({
					email,
					username,
					password: finalPassword
				});

				if (error || !data) {
					setErrorMessage(error?.message || t('Profile.signupFailed'));
					setLoading(false);
					return;
				}

				const accessTokenPayload = CookieClientService.getAccessTokenPayload();

				if (!accessTokenPayload) {
					setErrorMessage(t('Profile.noAccessTokenFound'));
					setLoading(false);
					return;
				}

				setUser(accessTokenPayload);
				setErrorMessage('');

				if (nextUrl) {
					const url = nextUrl.startsWith('/') ? nextUrl.slice(1) : nextUrl;
					router.replace(`/${url}`);
				} else {
					router.back();
				}
			}
		} catch {
			toast({
				status: NotificationType.ERROR,
				title: t('Profile.signupFailed')
			});
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
				<div className='my-4 flex justify-center text-xs text-text_grey'>{t('Profile.orLoginWith')}</div>
				<WalletButtons
					small
					onWalletChange={onWalletChange}
					hidePreference
				/>
				<p className={classes.switchToLogin}>
					{t('Profile.alreadyHaveAnAccount')}
					<Button
						onClick={switchToLogin}
						variant='ghost'
						className='p-0 text-text_pink'
					>
						{t('Profile.login')}
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
							{t('AddressDropdown.goBack')}
						</Button>
					)}
					<Button
						type='submit'
						isLoading={loading}
						size='lg'
						className={classes.signupButton}
					>
						{step === ESignupSteps.PASSWORD ? t('Profile.signUp') : t('Profile.next')}
					</Button>
				</div>
			</form>
		</Form>
	);
}

export default Web2Signup;
