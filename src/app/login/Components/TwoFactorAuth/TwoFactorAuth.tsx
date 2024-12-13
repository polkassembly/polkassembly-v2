// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { EAuthCookieNames, EWallet } from '@/_shared/types';
import React, { useState } from 'react';
import { WalletIcon } from '@ui/WalletsUI/WalletsIcon';
import { Button } from '@ui/Button';
import { nextApiClientFetch } from '@/app/_client-utils/nextApiClientFetch';
import { AuthClientService } from '@/app/_client-services/auth_service';
import { getCookie } from 'cookies-next/client';
import { useSetAtom } from 'jotai';
import { userAtom } from '@/app/_atoms/user/userAtom';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@ui/Form';
import { Input } from '@ui/Input';
import { getWalletLabel } from '@/app/_client-utils/getWalletLabel';
import classes from './TwoFactorAuth.module.scss';

interface IFormFields {
	authCode: string;
}

function TwoFactorAuth({ tfaToken, loginAddress, loginWallet, goBack }: { tfaToken: string; loginAddress: string; loginWallet: EWallet; goBack: () => void }) {
	const [loading, setLoading] = useState<boolean>(false);

	const setUserAtom = useSetAtom(userAtom);
	const router = useRouter();

	const formData = useForm<IFormFields>();

	const handleLogin = async (values: IFormFields) => {
		const { authCode } = values;

		if (!authCode || !tfaToken || !loginAddress || !loginWallet) return;

		setLoading(true);
		const data = await nextApiClientFetch<{ message: string }>('/auth/actions/tfa/login', {
			authCode,
			loginAddress,
			loginWallet,
			tfaToken
		});

		if (!data) {
			console.log('Login failed. Please try again later.');
			setLoading(false);
			return;
		}

		const accessToken = getCookie(EAuthCookieNames.ACCESS_TOKEN);

		if (!accessToken) {
			console.log('No Access token found.');
			setLoading(false);
			return;
		}

		const decodedData = AuthClientService.decodeAccessToken(accessToken);

		if (decodedData) {
			setUserAtom(decodedData);
		}
		router.back();
		setLoading(false);
	};

	return (
		<div className='flex flex-col gap-y-4'>
			<p className={classes.addressHeader}>
				<WalletIcon wallet={loginWallet} />
				<span className={classes.walletName}>{getWalletLabel(loginWallet)}</span>
			</p>
			<p>
				<span className={classes.walletName}>Two Factor Authentication</span>
			</p>
			<p className='text-xs text-text_primary sm:text-sm'>
				Please open the two-step verification app or extension and input the authentication code for your Polkassembly account.
			</p>
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
									if (value.length !== 6 || Number.isNaN(Number(value))) return 'Please provide a valid authentication code.';
									return true;
								}
							}}
							render={({ field }) => (
								<FormItem>
									<FormLabel>Authentication Code</FormLabel>
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
					<div className='mt-4 flex justify-center'>
						<Button
							size='lg'
							className='px-12'
							type='submit'
							isLoading={loading}
						>
							Login
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
					Go Back
				</Button>
			</div>
		</div>
	);
}

export default TwoFactorAuth;
