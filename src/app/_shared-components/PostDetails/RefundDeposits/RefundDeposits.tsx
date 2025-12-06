// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useMemo, useState } from 'react';
import { usePolkadotApiService } from '@/hooks/usePolkadotApiService';
import { ENotificationStatus, EPostOrigin } from '@/_shared/types';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { NETWORKS_DETAILS } from '@/_shared/_constants/networks';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { useToast } from '@/hooks/useToast';
import { formatBnBalance } from '@/app/_client-utils/formatBnBalance';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import CrystalIcon from '@assets/icons/crystalIcon.png';
import { useQuery } from '@tanstack/react-query';
import { usePolkadotVault } from '@/hooks/usePolkadotVault';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../Dialog/Dialog';
import { Button } from '../../Button';
import AddressRelationsPicker from '../../AddressRelationsPicker/AddressRelationsPicker';
import { Separator } from '../../Separator';
import SwitchWalletOrAddress from '../../SwitchWalletOrAddress/SwitchWalletOrAddress';

function RefundDeposits({ postId, track }: { postId: number; track: EPostOrigin }) {
	const { apiService } = usePolkadotApiService();
	const { userPreferences } = useUserPreferences();
	const network = getCurrentNetwork();
	const { toast } = useToast();
	const t = useTranslations();
	const { setVaultQrState } = usePolkadotVault();

	const [openRefundModal, setOpenRefundModal] = useState(false);

	const [loading, setLoading] = useState(false);

	const decisionDeposit = NETWORKS_DETAILS[`${network}`].trackDetails[`${track}`]?.decisionDeposit;

	const { submissionDeposit } = NETWORKS_DETAILS[`${network}`];

	const fetchReferendumInfo = async () => {
		if (!apiService) return null;

		return apiService.getReferendaInfo({ postId });
	};

	const { data: referendaInfo, refetch: refetchReferendaInfo } = useQuery({
		queryKey: ['referendaInfo', postId],
		queryFn: fetchReferendumInfo,
		enabled: !!apiService && !!postId
	});

	const canRefundDecisionDeposit = useMemo(() => {
		return !!referendaInfo?.canRefundDecisionDeposit;
	}, [referendaInfo]);

	const canRefundSubmissionDeposit = useMemo(() => {
		return !!referendaInfo?.canRefundSubmissionDeposit;
	}, [referendaInfo]);

	const handleSubmit = () => {
		if (!apiService || !userPreferences.selectedAccount?.address || (!canRefundDecisionDeposit && !canRefundSubmissionDeposit) || !userPreferences.wallet) return;
		setLoading(true);
		apiService.refundDeposits({
			postId,
			address: userPreferences.selectedAccount.address,
			wallet: userPreferences.wallet,
			setVaultQrState,
			canRefundDecisionDeposit,
			canRefundSubmissionDeposit,
			onSuccess: () => {
				toast({
					title: 'Refund Processed Successfully',
					status: ENotificationStatus.SUCCESS
				});
				setLoading(false);
				setOpenRefundModal(false);
				refetchReferendaInfo();
			},
			onFailed: () => {
				toast({
					title: 'Failed to refund deposits',
					description: 'Please try again',
					status: ENotificationStatus.ERROR
				});
				setLoading(false);
			}
		});
	};

	if (!canRefundDecisionDeposit && !canRefundSubmissionDeposit) return null;

	return (
		<div className='relative rounded-xl bg-[linear-gradient(97deg,_#04D9BB_0.24%,_#06D7BB_0.25%,_#6E49C9_107.39%)] px-4 pb-1 pt-6'>
			<div className='flex items-center gap-x-2'>
				<Image
					src={CrystalIcon}
					alt='refund-deposits'
					width={60}
					height={60}
					className='h-[60px] w-[60px]'
				/>
				<div className='flex flex-col gap-y-2 text-white'>
					<p className='text-base font-semibold'>{t('PostDetails.RefundDeposits.refundDeposits')}</p>
					<div className='flex flex-wrap gap-x-1 text-xs'>{t('PostDetails.RefundDeposits.description')}</div>
				</div>
			</div>

			<Dialog
				open={openRefundModal}
				onOpenChange={setOpenRefundModal}
			>
				<DialogTrigger>
					<div className='absolute right-0 top-0 h-[45px] w-[90px] cursor-pointer rounded-bl-3xl bg-page_background before:absolute before:-bottom-6 before:right-0 before:aspect-square before:w-6 before:rounded-tr-xl before:shadow-[6px_-6px_0_4px] before:shadow-page_background before:content-[""] after:absolute after:-left-6 after:top-0 after:aspect-square after:w-6 after:rounded-tr-xl after:shadow-[6px_-6px_0_4px_black] after:shadow-page_background after:outline-none after:content-[""]'>
						<div className='absolute bottom-2 left-2 right-0 top-0 z-10 flex items-center justify-center'>
							<Button className='w-full rounded-full shadow-md'>{t('PostDetails.RefundDeposits.refund')}</Button>
						</div>
					</div>
				</DialogTrigger>
				<DialogContent className='max-w-xl p-6'>
					<DialogHeader>
						<DialogTitle className='flex items-center gap-x-2 text-xl font-semibold text-text_primary'>{t('PostDetails.RefundDeposits.refundDeposits')}</DialogTitle>
					</DialogHeader>
					<div className='flex flex-col gap-y-6'>
						<SwitchWalletOrAddress
							small
							customAddressSelector={<AddressRelationsPicker withBalance />}
						/>
						{decisionDeposit && canRefundDecisionDeposit && (
							<div className='flex items-center gap-x-2'>
								<p className='text-sm text-wallet_btn_text'>{t('PostDetails.RefundDeposits.decisionDeposit')}:</p>
								<p className='text-sm font-semibold text-text_primary'>{formatBnBalance(decisionDeposit, { numberAfterComma: 2, withUnit: true }, network)}</p>
							</div>
						)}
						{submissionDeposit && canRefundSubmissionDeposit && (
							<div className='flex items-center gap-x-2'>
								<p className='text-sm text-wallet_btn_text'>{t('PostDetails.RefundDeposits.submissionDeposit')}:</p>
								<p className='text-sm font-semibold text-text_primary'>{formatBnBalance(submissionDeposit, { numberAfterComma: 2, withUnit: true }, network)}</p>
							</div>
						)}
						<Separator />
						<div className='flex justify-end'>
							<Button
								disabled={!apiService || !userPreferences.selectedAccount?.address || (!canRefundDecisionDeposit && !canRefundSubmissionDeposit)}
								onClick={handleSubmit}
								isLoading={loading}
							>
								{t('PostDetails.RefundDeposits.refund')}
							</Button>
						</div>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
}

export default RefundDeposits;
