// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useState } from 'react';
import { usePolkadotApiService } from '@/hooks/usePolkadotApiService';
import { ENotificationStatus, EPostOrigin, EProposalStatus } from '@/_shared/types';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { NETWORKS_DETAILS } from '@/_shared/_constants/networks';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { useToast } from '@/hooks/useToast';
import { formatBnBalance } from '@/app/_client-utils/formatBnBalance';
import { useTranslations } from 'next-intl';
import { BN, BN_ZERO } from '@polkadot/util';
import Image from 'next/image';
import CrystalIcon from '@assets/icons/crystalIcon.png';
import Link from 'next/link';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../Dialog/Dialog';
import { Button } from '../../Button';
import AddressRelationsPicker from '../../AddressRelationsPicker/AddressRelationsPicker';
import { Separator } from '../../Separator';
import Balance from '../../Balance';
import WalletButtons from '../../WalletsUI/WalletButtons/WalletButtons';

function PlaceDecisionDeposit({ postId, track, status, onSuccess }: { postId: number; track: EPostOrigin; status: EProposalStatus; onSuccess: () => void }) {
	const { apiService } = usePolkadotApiService();
	const { userPreferences } = useUserPreferences();
	const network = getCurrentNetwork();
	const { toast } = useToast();
	const t = useTranslations('');

	const [openDepositModal, setOpenDepositModal] = useState(false);

	const [loading, setLoading] = useState(false);

	const [userBalance, setUserBalance] = useState<BN>(BN_ZERO);

	const decisionDeposit = NETWORKS_DETAILS[`${network}`].trackDetails[`${track}`]?.decisionDeposit;

	const handleSubmit = () => {
		if (!apiService || !userPreferences.selectedAccount?.address || status !== EProposalStatus.Submitted || !decisionDeposit || userBalance.lt(decisionDeposit)) return;
		setLoading(true);
		apiService.submitDecisionDeposit({
			postId,
			address: userPreferences.selectedAccount.address,
			onSuccess: () => {
				toast({
					title: 'Decision deposit submitted',
					status: ENotificationStatus.SUCCESS
				});
				onSuccess();
				setLoading(false);
				setOpenDepositModal(false);
			},
			onFailed: () => {
				toast({
					title: 'Failed to submit decision deposit',
					description: 'Please try again',
					status: ENotificationStatus.ERROR
				});
				setLoading(false);
			}
		});
	};

	return (
		<div className='relative rounded-xl bg-[linear-gradient(97deg,_#04D9BB_0.24%,_#06D7BB_0.25%,_#6E49C9_107.39%)] px-4 pb-1 pt-6'>
			<div className='flex items-center gap-x-2'>
				<Image
					src={CrystalIcon}
					alt='decision-deposit'
					width={60}
					height={60}
					className='h-[60px] w-[60px]'
				/>
				<div className='flex flex-col gap-y-2 text-white'>
					<p className='text-base font-semibold'>{t('PostDetails.DecisionDeposit.decisionDeposit')}</p>
					<div className='flex flex-wrap gap-x-1 text-xs'>
						{t('PostDetails.DecisionDeposit.description')}
						<Link
							href='https://wiki.polkadot.network/learn/learn-guides-treasury/#place-a-decision-deposit-for-the-treasury-track-referendum'
							target='_blank'
							className='text-text_pink'
						>
							{t('PostDetails.DecisionDeposit.details')}
						</Link>
					</div>
				</div>
			</div>

			<Dialog
				open={openDepositModal}
				onOpenChange={setOpenDepositModal}
			>
				<DialogTrigger>
					<div className='absolute right-0 top-0 h-[45px] w-[90px] cursor-pointer rounded-bl-3xl bg-page_background before:absolute before:-bottom-6 before:right-0 before:aspect-square before:w-6 before:rounded-tr-xl before:shadow-[6px_-6px_0_4px] before:shadow-page_background before:content-[""] after:absolute after:-left-6 after:top-0 after:aspect-square after:w-6 after:rounded-tr-xl after:shadow-[6px_-6px_0_4px_black] after:shadow-page_background after:outline-none after:content-[""]'>
						<div className='absolute bottom-2 left-2 right-0 top-0 z-10 flex items-center justify-center'>
							<Button className='w-full rounded-full shadow-md'>{t('PostDetails.DecisionDeposit.add')}</Button>
						</div>
					</div>
				</DialogTrigger>
				<DialogContent className='max-w-xl p-6'>
					<DialogHeader>
						<DialogTitle className='flex items-center gap-x-2 text-xl font-semibold text-text_primary'>{t('PostDetails.DecisionDeposit.payDecisionDeposit')}</DialogTitle>
					</DialogHeader>
					<div className='flex flex-col gap-y-6'>
						<WalletButtons small />
						<div className='flex flex-col gap-y-2'>
							<div className='flex items-center justify-between gap-x-2'>
								<p className='text-xs text-wallet_btn_text sm:text-sm'>{t('AddressDropdown.chooseLinkedAccount')}</p>
								<Balance
									onChange={(balance) => setUserBalance(new BN(balance))}
									address={userPreferences?.selectedAccount?.address || ''}
								/>
							</div>
							<AddressRelationsPicker />
						</div>
						{decisionDeposit && (
							<div className='flex items-center gap-x-2'>
								<p className='text-sm text-wallet_btn_text'>{t('PostDetails.DecisionDeposit.decisionDeposit')}:</p>
								<p className='text-sm font-semibold text-text_primary'>{formatBnBalance(decisionDeposit, { numberAfterComma: 2, withUnit: true }, network)}</p>
							</div>
						)}
						<Separator />
						<div className='flex justify-end'>
							<Button
								disabled={!apiService || !userPreferences.selectedAccount?.address || status !== EProposalStatus.Submitted || !decisionDeposit || userBalance.lt(decisionDeposit)}
								onClick={handleSubmit}
								isLoading={loading}
							>
								{t('PostDetails.DecisionDeposit.continue')}
							</Button>
						</div>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
}

export default PlaceDecisionDeposit;
