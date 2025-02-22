// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { useEffect, useState } from 'react';
import { useIdentityService } from '@/hooks/useIdentityService';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@ui/Form';
import { useForm } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { ValidatorService } from '@/_shared/_services/validator_service';
import { NETWORKS_DETAILS } from '@/_shared/_constants/networks';
import WalletButtons from '../WalletsUI/WalletButtons/WalletButtons';
import AddressDropdown from '../AddressDropdown/AddressDropdown';
import { Separator } from '../Separator';
import { Button } from '../Button';
import { Input } from '../Input';
import SetIdentityFees from './SetIdentityFees/SetIdentityFees';

interface ISetIdentityFormFields {
	displayName: string;
	legalName?: string;
	email: string;
	twitter?: string;
	matrix?: string;
}

enum ESetIdentityStep {
	GAS_FEE,
	SET_IDENTITY_FORM,
	SOCIAL_VERIFICATION
}

function SetIdentity() {
	const t = useTranslations();
	const { userPreferences } = useUserPreferences();

	const network = getCurrentNetwork();

	const formData = useForm<ISetIdentityFormFields>();

	const [loading, setLoading] = useState(false);
	const [identityLoading, setIdentityLoading] = useState(false);

	const { identityService } = useIdentityService();

	const [step, setStep] = useState<ESetIdentityStep>(ESetIdentityStep.GAS_FEE);

	useEffect(() => {
		const getTxFee = async () => {
			if (!identityService || !network || !userPreferences.address?.address) return;

			setIdentityLoading(true);
			const identityInfo = await identityService.getOnChainIdentity(userPreferences.address.address);

			formData.setValue('displayName', identityInfo.display);
			formData.setValue('legalName', identityInfo.legal);
			formData.setValue('email', identityInfo.email);
			formData.setValue('twitter', identityInfo.twitter);
			formData.setValue('matrix', identityInfo.matrix);

			setIdentityLoading(false);
		};
		getTxFee();
	}, [formData, identityService, network, userPreferences.address?.address]);

	const handleSetIdentity = async (values: ISetIdentityFormFields) => {
		if (!userPreferences.wallet || !userPreferences.address?.address || !values.displayName || !identityService) return;

		const { displayName, legalName, email, twitter, matrix } = values;
		setLoading(true);

		await identityService.setOnChainIdentity({
			address: userPreferences.address.address,
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

	return step === ESetIdentityStep.GAS_FEE ? (
		<SetIdentityFees
			txFee={NETWORKS_DETAILS[`${network}`].peopleChainDetails.identityMinDeposit}
			onNext={() => setStep(ESetIdentityStep.SET_IDENTITY_FORM)}
		/>
	) : (
		<Form {...formData}>
			<form onSubmit={formData.handleSubmit(handleSetIdentity)}>
				<div className='flex flex-col gap-y-4'>
					<WalletButtons small />
					<AddressDropdown
						withBalance
						disabled={identityLoading}
					/>
					<Separator />
					<FormField
						control={formData.control}
						name='displayName'
						key='displayName'
						disabled={loading || identityLoading}
						rules={{
							required: true,
							validate: (value) => {
								if (value.length === 0) return 'Invalid Display Name';
								return true;
							}
						}}
						render={({ field }) => (
							<FormItem>
								<FormLabel>{t('SetIdentity.displayName')}*</FormLabel>
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
						rules={{
							validate: (value) => {
								if (!ValidatorService.isValidEmail(value)) return 'Invalid Email';
								return true;
							}
						}}
						render={({ field }) => (
							<FormItem>
								<FormLabel>{t('SetIdentity.email')}*</FormLabel>
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
