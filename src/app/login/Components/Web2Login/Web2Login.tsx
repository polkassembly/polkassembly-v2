// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { EWallet, ENotificationStatus } from '@/_shared/types';
import { Button } from '@/app/_shared-components/Button';
import WalletButtons from '@ui/WalletsUI/WalletButtons/WalletButtons';
import { Input } from '@ui/Input';
import { useSearchParams } from 'next/navigation';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@ui/Form';
import { PasswordInput } from '@ui/PasswordInput/PasswordInput';
import { AuthClientService } from '@/app/_client-services/auth_client_service';
import ErrorMessage from '@ui/ErrorMessage';
import { CookieClientService } from '@/app/_client-services/cookie_client_service';
import { useUser } from '@/hooks/useUser';
import { useTranslations } from 'next-intl';
import { useToast } from '@/hooks/useToast';
import { useRouter } from 'nextjs-toploader/app';
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
	const t = useTranslations();

	const searchParams = useSearchParams();
	const nextUrl = searchParams.get('nextUrl');

	const { setUser } = useUser();

	const router = useRouter();

	const form = useForm<IFormFields>();

	const [errorMessage, setErrorMessage] = useState<string>('');

	const { toast } = useToast();

	const handleLogin = async (values: IFormFields) => {
		const { emailOrUsername, password } = values;

		if (!emailOrUsername || !password) {
			toast({
				status: ENotificationStatus.ERROR,
				title: t('Profile.enterCredentials')
			});
			return;
		}

		try {
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

				const accessTokenPayload = CookieClientService.getAccessTokenPayload();

				if (!accessTokenPayload) {
					setErrorMessage(t('Profile.noAccessTokenFound'));
					setLoading(false);
					return;
				}

				setErrorMessage('');
				setUser(accessTokenPayload);

				if (nextUrl) {
					const url = nextUrl.startsWith('/') ? nextUrl.slice(1) : nextUrl;
					router.replace(`/${url}`);
				} else {
					router.back();
				}
			}
		} catch {
			toast({
				status: ENotificationStatus.ERROR,
				title: t('Profile.loginFailed')
			});
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
											<FormLabel>{t('Profile.enterUsernameOrEmail')}</FormLabel>
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
											<FormLabel>{t('Profile.enterPassword')}</FormLabel>
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
								{t('Profile.login')}
							</Button>
						</div>
					</form>
				</Form>
			</div>
			{errorMessage && <ErrorMessage errorMessage={errorMessage} />}
			<div className='my-4 flex justify-center text-xs text-text_grey'>{t('Profile.orLoginWith')}</div>
			<WalletButtons
				small
				onWalletChange={onWalletChange}
				hidePreference
				disabled={loading}
			/>
			<SwitchToWeb2Signup
				className='mt-4 justify-center'
				switchToSignup={switchToSignup}
				disabled={loading}
			/>
		</div>
	);
}

export default Web2Login;
