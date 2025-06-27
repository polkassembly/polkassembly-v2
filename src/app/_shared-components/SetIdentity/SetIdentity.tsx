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
import { BN, BN_ZERO } from '@polkadot/util';
import { useToast } from '@/hooks/useToast';
import { ENotificationStatus, IOnChainIdentity } from '@/_shared/types';
import Link from 'next/link';
import { useUser } from '@/hooks/useUser';
import Image from 'next/image';
import EmailIcon from '@assets/icons/email-icon-dark.svg';
import TwitterIcon from '@assets/icons/twitter-icon-dark.svg';
import RiotIcon from '@assets/icons/riot-icon.svg';
import { NETWORKS_DETAILS } from '@/_shared/_constants/networks';
import { useQuery } from '@tanstack/react-query';
import { FIVE_MIN_IN_MILLI } from '@/app/api/_api-constants/timeConstants';
import { Separator } from '../Separator';
import { Button } from '../Button';
import { Input } from '../Input';
import SetIdentityFees from './SetIdentityFees/SetIdentityFees';
import SocialVerifications from './SocialVerifications/SocialVerifications';
import IdentitySuccessScreen from './IdentitySuccessScreen/IdentitySuccessScreen';
import SwitchWalletOrAddress from '../SwitchWalletOrAddress/SwitchWalletOrAddress';
import IdentityFeeCollaps from './IdentityFeeCollaps/IdentityFeeCollaps';

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
	IDENTITY_SUCCESS,
	SOCIAL_VERIFICATION
}

function SocialIcon({ icon }: { icon: string }) {
	return (
		<div className='flex h-10 w-10 items-center justify-center rounded-full bg-border_grey/40'>
			<Image
				src={icon}
				alt='social icon'
				width={24}
				height={24}
			/>
		</div>
	);
}
function SetIdentity() {
	const t = useTranslations();
	const { user } = useUser();
	const { userPreferences } = useUserPreferences();
	const { toast } = useToast();

	const network = getCurrentNetwork();

	const formData = useForm<ISetIdentityFormFields>();

	const [loading, setLoading] = useState(false);
	const [identityLoading, setIdentityLoading] = useState(false);

	const { identityService } = useIdentityService();

	const [step, setStep] = useState<ESetIdentityStep>(ESetIdentityStep.GAS_FEE);

	const [identityValues, setIdentityValues] = useState<IOnChainIdentity>();

	const fetchRegistrarFees = async () => {
		if (!identityService) return null;

		const registrars = await identityService.getRegistrars();
		const { polkassemblyRegistrarIndex } = NETWORKS_DETAILS[`${network}`].peopleChainDetails;
		if (!polkassemblyRegistrarIndex) return null;

		return new BN(registrars?.[`${polkassemblyRegistrarIndex}`]?.fee);
	};

	const { data: registrarFee } = useQuery({
		queryKey: ['registrarFee', user?.id, userPreferences.selectedAccount?.address],
		queryFn: () => fetchRegistrarFees(),
		placeholderData: (previousData) => previousData,
		staleTime: FIVE_MIN_IN_MILLI,
		retry: false,
		refetchOnMount: false,
		refetchOnWindowFocus: false
	});

	const fetchGasFee = async () => {
		if (!identityService) return null;

		const gasFee = await identityService.getGasFee({
			address: userPreferences.selectedAccount?.address || '',
			registrarFee: registrarFee || BN_ZERO,
			displayName: formData.getValues('displayName'),
			email: formData.getValues('email'),
			legalName: formData.getValues('legalName'),
			twitter: formData.getValues('twitter'),
			matrix: formData.getValues('matrix')
		});

		return gasFee ? new BN(gasFee) : BN_ZERO;
	};
	const { data: gasFee } = useQuery({
		queryKey: ['gasFee', user?.id, userPreferences.selectedAccount?.address, formData.getValues('displayName'), formData.getValues('email')],
		queryFn: () => fetchGasFee(),
		placeholderData: (previousData) => previousData,
		staleTime: FIVE_MIN_IN_MILLI,
		retry: false
	});

	useEffect(() => {
		const setDefaultIdentityValues = async () => {
			if (!identityService || !network || !userPreferences.selectedAccount?.address) return;

			setIdentityLoading(true);
			const identityInfo = await identityService.getOnChainIdentity(userPreferences.selectedAccount.address);

			setIdentityValues(identityInfo);
			formData.setValue('displayName', identityInfo.display);
			formData.setValue('legalName', identityInfo.legal);
			formData.setValue('email', identityInfo.email);
			formData.setValue('twitter', identityInfo.twitter);
			formData.setValue('matrix', identityInfo.matrix);

			setIdentityLoading(false);
		};
		setDefaultIdentityValues();
	}, [formData, identityService, network, userPreferences.selectedAccount?.address]);

	const handleSetIdentity = async (values: ISetIdentityFormFields) => {
		if (!userPreferences.wallet || !userPreferences.selectedAccount?.address || !identityService) return;

		const { displayName, legalName, email, twitter, matrix } = values;
		setLoading(true);

		await identityService.setOnChainIdentity({
			address: userPreferences.selectedAccount.address,
			displayName,
			email,
			legalName,
			twitter,
			matrix,
			registrarFee: registrarFee || BN_ZERO,
			onSuccess: () => {
				setLoading(false);
				toast({
					status: ENotificationStatus.SUCCESS,
					title: t('SetIdentity.success'),
					description: t('SetIdentity.successDescription')
				});
				setStep(ESetIdentityStep.IDENTITY_SUCCESS);
			},
			onFailed: (errorMessageFallback?: string) => {
				setLoading(false);
				toast({
					status: ENotificationStatus.ERROR,
					title: t('SetIdentity.failed'),
					description: errorMessageFallback || t('SetIdentity.failedDescription')
				});
			}
		});
	};

	if (!user) {
		return (
			<p className='flex items-center gap-x-1 text-center text-sm text-text_primary'>
				{t('SetIdentity.please')}
				<Link
					href='/login'
					className='text-text_pink'
				>
					{t('SetIdentity.login')}
				</Link>{' '}
				{t('SetIdentity.toSet')}
			</p>
		);
	}

	return step === ESetIdentityStep.GAS_FEE ? (
		<SetIdentityFees
			onNext={() => setStep(ESetIdentityStep.SET_IDENTITY_FORM)}
			onRequestJudgement={() => setStep(ESetIdentityStep.SOCIAL_VERIFICATION)}
			disabledRequestJudgement={!identityValues?.display || !identityValues?.email || !identityValues?.hash}
			registrarFee={registrarFee || BN_ZERO}
		/>
	) : step === ESetIdentityStep.IDENTITY_SUCCESS && userPreferences.selectedAccount?.address ? (
		<IdentitySuccessScreen
			address={userPreferences.selectedAccount.address}
			email={formData.getValues('email')}
			displayName={formData.getValues('displayName')}
			legalName={formData.getValues('legalName')}
			twitter={formData.getValues('twitter')}
			matrix={formData.getValues('matrix')}
			onNext={() => setStep(ESetIdentityStep.SOCIAL_VERIFICATION)}
		/>
	) : step === ESetIdentityStep.SOCIAL_VERIFICATION ? (
		<SocialVerifications />
	) : (
		<Form {...formData}>
			<form
				className='flex flex-1 flex-col overflow-y-hidden'
				onSubmit={formData.handleSubmit(handleSetIdentity)}
			>
				<div className='flex flex-1 flex-col gap-y-4 overflow-y-auto'>
					<SwitchWalletOrAddress
						small
						withBalance
						disabled={identityLoading}
						showPeopleChainBalance
					/>

					{/* Display Name */}
					<FormField
						control={formData.control}
						name='displayName'
						key='displayName'
						disabled={loading || identityLoading}
						rules={{
							required: true,
							validate: (value) => {
								if (value?.length === 0) return 'Invalid Display Name';
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

					{/* Legal Name */}
					<FormField
						control={formData.control}
						name='legalName'
						key='legalName'
						disabled={loading}
						rules={{
							required: true,
							validate: (value) => {
								if (value?.length === 0) return 'Invalid Display Name';
								return true;
							}
						}}
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

					<Separator />

					<p className='font-semibold text-wallet_btn_text'>Socials</p>

					{/* Email */}
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
							<FormItem className='flex items-center gap-x-2'>
								<div className='flex w-28 items-center gap-x-2'>
									<SocialIcon icon={EmailIcon} />
									<FormLabel>{t('SetIdentity.email')}</FormLabel>
								</div>
								<div className='flex-1'>
									<FormControl>
										<Input
											placeholder={t('SetIdentity.emailPlaceholder')}
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</div>
							</FormItem>
						)}
					/>

					{/* Twitter */}
					<FormField
						control={formData.control}
						name='twitter'
						key='twitter'
						disabled={loading}
						rules={{
							validate: (value) => {
								if (value && !ValidatorService.isValidTwitterHandle(value)) return 'Invalid Twitter Handle';
								return true;
							}
						}}
						render={({ field }) => (
							<FormItem className='flex items-center gap-x-2'>
								<div className='flex w-28 items-center gap-x-2'>
									<SocialIcon icon={TwitterIcon} />
									<FormLabel>{t('SetIdentity.twitter')}</FormLabel>
								</div>
								<div className='flex-1'>
									<FormControl>
										<Input
											placeholder={t('SetIdentity.twitterPlaceholder')}
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</div>
							</FormItem>
						)}
					/>

					{/* Matrix */}
					<FormField
						control={formData.control}
						name='matrix'
						key='matrix'
						rules={{
							validate: (value) => {
								if (value && !ValidatorService.isValidMatrixHandle(value)) return 'Invalid Matrix Handle';
								return true;
							}
						}}
						disabled={loading}
						render={({ field }) => (
							<FormItem className='flex items-center gap-x-2'>
								<div className='flex w-28 items-center gap-x-2'>
									<SocialIcon icon={RiotIcon} />
									<FormLabel>{t('SetIdentity.riot')}</FormLabel>
								</div>
								<div className='flex-1'>
									<FormControl>
										<Input
											placeholder={t('SetIdentity.riotPlaceholder')}
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</div>
							</FormItem>
						)}
					/>
				</div>
				<IdentityFeeCollaps
					className='mt-4'
					registrarFee={registrarFee || BN_ZERO}
					gasFee={gasFee || BN_ZERO}
				/>
				<Separator className='my-4' />
				<div className='flex justify-end'>
					<Button
						isLoading={loading}
						type='submit'
					>
						{t('SetIdentity.setIdentity')}
					</Button>
				</div>
			</form>
		</Form>
	);
}

export default SetIdentity;
