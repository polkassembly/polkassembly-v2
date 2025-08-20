// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@ui/Form';
import { ValidatorService } from '@/_shared/_services/validator_service';
import { BN, BN_ZERO } from '@polkadot/util';
import EmailIcon from '@assets/icons/email-icon-dark.svg';
import TwitterIcon from '@assets/icons/twitter-icon-dark.svg';
import RiotIcon from '@assets/icons/riot-icon.svg';
import { AlertCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useUser } from '@/hooks/useUser';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { useToast } from '@/hooks/useToast';
import { useIdentityService } from '@/hooks/useIdentityService';
import Image from 'next/image';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { FIVE_MIN_IN_MILLI } from '@/app/api/_api-constants/timeConstants';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { ENotificationStatus, EReactQueryKeys } from '@/_shared/types';
import { Alert, AlertDescription } from '../../Alert';
import AddressRelationsPicker from '../../AddressRelationsPicker/AddressRelationsPicker';
import IdentityFeeCollaps from '../IdentityFeeCollaps/IdentityFeeCollaps';
import { Input } from '../../Input';
import { Button } from '../../Button';
import { Separator } from '../../Separator';
import SwitchWalletOrAddress from '../../SwitchWalletOrAddress/SwitchWalletOrAddress';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from '../../Dialog/Dialog';
import ClearIdentity from '../ClearIdentity/ClearIdentity';

interface ISetIdentityFormFields {
	displayName: string;
	legalName?: string;
	email: string;
	twitter?: string;
	matrix?: string;
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

function SetIdentityForm({ registrarFee, onTeleport, onSuccess }: { registrarFee: BN; onTeleport: () => void; onSuccess: (values: ISetIdentityFormFields) => void }) {
	const t = useTranslations();
	const { user } = useUser();
	const { userPreferences } = useUserPreferences();
	const { toast } = useToast();

	const queryClient = useQueryClient();

	const network = getCurrentNetwork();

	const { identityService } = useIdentityService();

	const formData = useForm<ISetIdentityFormFields>();

	const [loading, setLoading] = useState(false);

	const [openClearIdentityModal, setOpenClearIdentityModal] = useState(false);

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

	const fetchIdentityInfo = async () => {
		if (!identityService || !network || !userPreferences.selectedAccount?.address) return null;

		const identityInfo = await identityService.getOnChainIdentity(userPreferences.selectedAccount.address);

		formData.setValue('displayName', identityInfo.display);
		formData.setValue('legalName', identityInfo.legal);
		formData.setValue('email', identityInfo.email);
		formData.setValue('twitter', identityInfo.twitter);
		formData.setValue('matrix', identityInfo.matrix);

		return identityInfo;
	};

	const { data: identityInfo, isFetching: fetchingIdentityInfo } = useQuery({
		queryKey: [EReactQueryKeys.IDENTITY_INFO, user?.id, userPreferences.selectedAccount?.address],
		queryFn: () => fetchIdentityInfo(),
		enabled: !!user?.id && !!userPreferences.selectedAccount?.address && !!identityService,
		placeholderData: (previousData) => previousData,
		retry: false,
		refetchOnMount: false,
		refetchOnWindowFocus: false
	});

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
				onSuccess({
					displayName: formData.getValues('displayName'),
					legalName: formData.getValues('legalName'),
					email: formData.getValues('email'),
					twitter: formData.getValues('twitter'),
					matrix: formData.getValues('matrix')
				});
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

	return (
		<Form {...formData}>
			<form
				className='flex flex-1 flex-col overflow-y-hidden'
				onSubmit={formData.handleSubmit(handleSetIdentity)}
			>
				<div className='flex flex-1 flex-col gap-y-4 overflow-y-auto'>
					<Alert
						variant='info'
						className='flex items-center gap-x-3'
					>
						<AlertCircle className='h-4 w-4' />
						<AlertDescription className='flex w-full items-center justify-between'>
							<h2 className='text-sm font-medium'>{t('SetIdentity.TeleportFundsToPeopleChain')}</h2>
							<Button
								onClick={onTeleport}
								size='sm'
								className='h-6'
							>
								{t('SetIdentity.Teleport')}
							</Button>
						</AlertDescription>
					</Alert>

					<SwitchWalletOrAddress
						small
						customAddressSelector={
							<AddressRelationsPicker
								withBalance
								showPeopleChainBalance
							/>
						}
						disabled={fetchingIdentityInfo}
					/>

					{/* Display Name */}
					<FormField
						control={formData.control}
						name='displayName'
						key='displayName'
						disabled={loading || fetchingIdentityInfo}
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
								if (value?.length === 0) return 'Invalid Legal Name';
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

					<p className='font-semibold text-wallet_btn_text'>{t('SetIdentity.socials')}</p>

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
				<div className='flex items-center justify-end gap-x-2'>
					{identityInfo && identityInfo.display && (
						<Dialog
							open={openClearIdentityModal}
							onOpenChange={setOpenClearIdentityModal}
						>
							<DialogTrigger>
								<Button
									disabled={loading || fetchingIdentityInfo}
									variant='secondary'
									type='button'
								>
									{t('SetIdentity.clearIdentity')}
								</Button>
							</DialogTrigger>
							<DialogContent className='max-w-md p-3 sm:p-6'>
								<DialogHeader>
									<DialogTitle>{t('SetIdentity.clearIdentity')}</DialogTitle>
								</DialogHeader>
								<ClearIdentity
									onSuccess={() => {
										setOpenClearIdentityModal(false);
										queryClient.invalidateQueries({ queryKey: [EReactQueryKeys.IDENTITY_INFO, user?.id, userPreferences.selectedAccount?.address] });
									}}
								/>
							</DialogContent>
						</Dialog>
					)}
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

export default SetIdentityForm;
