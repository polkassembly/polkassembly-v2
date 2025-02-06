// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { useState } from 'react';
import { EWallet } from '@/_shared/types';
import { InjectedAccount } from '@polkadot/extension-inject/types';
import { useIdentityService } from '@/hooks/useIdentityService';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@ui/Form';
import { useForm } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import WalletButtons from '../WalletsUI/WalletButtons/WalletButtons';
import AddressDropdown from '../AddressDropdown/AddressDropdown';
import { Separator } from '../Separator';
import { Button } from '../Button';
import { Input } from '../Input';

interface ISetIdentityFormFields {
	displayName: string;
	legalName?: string;
	email: string;
	twitter?: string;
	matrix?: string;
}

function SetIdentity() {
	const t = useTranslations();
	const { userPreferences } = useUserPreferences();
	const [selectedWallet, setSelectedWallet] = useState<EWallet | null>(userPreferences.wallet || null);
	const [selectedAccount, setSelectedAccount] = useState<InjectedAccount | null>(userPreferences.address || null);

	const formData = useForm<ISetIdentityFormFields>();

	const [loading, setLoading] = useState(false);

	const { identityService } = useIdentityService();

	const handleSetIdentity = async (values: ISetIdentityFormFields) => {
		if (!selectedWallet || !selectedAccount || !values.displayName || !values.email || !identityService) return;

		const { displayName, legalName, email, twitter, matrix } = values;
		setLoading(true);

		await identityService.setOnChainIdentity({
			address: selectedAccount.address,
			displayName,
			email,
			legalName,
			twitter,
			matrix,
			onSuccess: () => {
				setLoading(false);
			},
			onFailed: () => {
				setLoading(false);
			}
		});
	};

	return (
		<Form {...formData}>
			<form onSubmit={formData.handleSubmit(handleSetIdentity)}>
				<div className='flex flex-col gap-y-4'>
					<WalletButtons
						small
						onWalletChange={(wallet) => setSelectedWallet(wallet)}
					/>
					<AddressDropdown
						withBalance
						onChange={(account) => setSelectedAccount(account)}
					/>
					<Separator />
					<FormField
						control={formData.control}
						name='displayName'
						key='displayName'
						disabled={loading}
						defaultValue=''
						rules={{
							required: true,
							validate: (value) => {
								if (!value) return 'Display name is required';
								return true;
							}
						}}
						render={({ field }) => (
							<FormItem>
								<FormLabel>{t('SetIdentity.displayName')}</FormLabel>
								<FormControl>
									<Input
										placeholder={t('SetIdentity.displayName')}
										{...field}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={formData.control}
						name='legalName'
						key='legalName'
						disabled={loading}
						defaultValue=''
						render={({ field }) => (
							<FormItem>
								<FormLabel>{t('SetIdentity.legalName')}</FormLabel>
								<FormControl>
									<Input
										placeholder={t('SetIdentity.legalName')}
										{...field}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={formData.control}
						name='email'
						key='email'
						disabled={loading}
						defaultValue=''
						render={({ field }) => (
							<FormItem>
								<FormLabel>{t('SetIdentity.email')}</FormLabel>
								<FormControl>
									<Input
										placeholder={t('SetIdentity.email')}
										{...field}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={formData.control}
						name='twitter'
						key='twitter'
						disabled={loading}
						defaultValue=''
						render={({ field }) => (
							<FormItem>
								<FormLabel>{t('SetIdentity.twitter')}</FormLabel>
								<FormControl>
									<Input
										placeholder={t('SetIdentity.twitter')}
										{...field}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={formData.control}
						name='matrix'
						key='matrix'
						disabled={loading}
						defaultValue=''
						render={({ field }) => (
							<FormItem>
								<FormLabel>{t('SetIdentity.matrix')}</FormLabel>
								<FormControl>
									<Input
										placeholder={t('SetIdentity.matrix')}
										{...field}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<div className='flex justify-end'>
						<Button
							isLoading={loading}
							type='submit'
						>
							{t('SetIdentity.setIdentity')}
						</Button>
					</div>
				</div>
			</form>
		</Form>
	);
}

export default SetIdentity;
