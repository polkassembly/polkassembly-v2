// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { EWallet } from '@/_shared/types';
import React, { useState } from 'react';
import { WalletIcon } from '@ui/WalletsUI/WalletsIcon';
import { Button } from '@ui/Button';
import { useUser } from '@/hooks/useUser';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@ui/Form';
import { Input } from '@ui/Input';
import { WalletClientService } from '@/app/_client-services/wallet_service';
import ErrorMessage from '@/app/_shared-components/ErrorMessage';
import { CookieClientService } from '@/app/_client-services/cookie_client_service';
import { AuthClientService } from '@/app/_client-services/auth_client_service';
import { useTranslations } from 'next-intl';
import { ValidatorService } from '@/_shared/_services/validator_service';
import classes from './TwoFactorAuth.module.scss';

interface IFormFields {
	authCode: string;
}

function TwoFactorAuth({ tfaToken, loginAddress, loginWallet, goBack }: { tfaToken: string; loginAddress: string; loginWallet: EWallet; goBack: () => void }) {
	const [loading, setLoading] = useState<boolean>(false);
	const t = useTranslations();
	const { setUser } = useUser();
	const router = useRouter();

	const formData = useForm<IFormFields>();

	const [errorMessage, setErrorMessage] = useState<string>('');

	const handleLogin = async (values: IFormFields) => {
		const { authCode } = values;

		if (!authCode || !tfaToken || !loginAddress || !loginWallet) return;

		setLoading(true);
		const { data, error } = await AuthClientService.tfaLogin({
			authCode,
			loginAddress,
			loginWallet,
			tfaToken
		});

		if (error) {
			setErrorMessage(error.message);
			setLoading(false);
			return;
		}

		if (data) {
			const accessTokenPayload = CookieClientService.getAccessTokenPayload();

			if (!accessTokenPayload) {
				// TODO: show notification
				setLoading(false);
				return;
			}

			setUser(accessTokenPayload);

			router.back();
		}
		setLoading(false);
	};

	return (
		<div className='flex flex-col gap-y-4'>
			<p className={classes.addressHeader}>
				<WalletIcon wallet={loginWallet} />
				<span className={classes.walletName}>{WalletClientService.getWalletNameLabel(loginWallet)}</span>
			</p>
			<p>
				<span className={classes.walletName}>{t('Profile.twoFactorAuth')}</span>
			</p>
			<p className='text-xs text-text_primary sm:text-sm'>{t('Profile.twoFactorAuthDescription')}</p>
			<Form {...formData}>
				<form onSubmit={formData.handleSubmit(handleLogin)}>
					<div>
						<FormField
							control={formData.control}
							name='authCode'
							key='authCode'
							disabled={loading}
							rules={{
								required: true,
								validate: (value) => {
									if (value.length !== 6 || !ValidatorService.isValidNumber(value)) return 'Please provide a valid authentication code.';
									return true;
								}
							}}
							render={({ field }) => (
								<FormItem>
									<FormLabel>{t('Profile.authCode')}</FormLabel>
									<FormControl>
										<Input
											placeholder='######'
											type='text'
											{...field}
										/>
									</FormControl>

									<FormMessage />
								</FormItem>
							)}
						/>
					</div>
					{errorMessage && <ErrorMessage errorMessage={errorMessage} />}
					<div className='mt-4 flex justify-center'>
						<Button
							size='lg'
							className='px-12'
							type='submit'
							isLoading={loading}
						>
							{t('Profile.login')}
						</Button>
					</div>
				</form>
			</Form>
			<div className='mt-4 flex justify-center'>
				<Button
					variant='secondary'
					onClick={goBack}
					type='button'
				>
					{t('AddressDropdown.goBack')}
				</Button>
			</div>
		</div>
	);
}

export default TwoFactorAuth;
