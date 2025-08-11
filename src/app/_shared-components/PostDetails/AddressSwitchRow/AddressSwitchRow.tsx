// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import React from 'react';
import { useUser } from '@/hooks/useUser';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { useTranslations } from 'next-intl';
import { Button } from '@ui/Button';
import { RefreshCcwIcon } from 'lucide-react';
import { EProposalType, EPostOrigin } from '@/_shared/types';
import classes from '../PostDetails.module.scss';
import Address from '../../Profile/Address/Address';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../Dialog/Dialog';
import SwitchWalletOrAddress from '../../SwitchWalletOrAddress/SwitchWalletOrAddress';
import VoteReferendumButton from '../VoteReferendumButton';

interface AddressSwitchRowProps {
	index: string;
	proposalType: EProposalType;
	showUserVoteCard?: boolean;
	track?: EPostOrigin;
}

function AddressSwitchRow({ index, proposalType, showUserVoteCard = false, track }: AddressSwitchRowProps) {
	const { user } = useUser();
	const { userPreferences } = useUserPreferences();
	const t = useTranslations();

	const selectedAddress = userPreferences?.selectedAccount?.address || user?.addresses?.[0] || '';

	// Don't show the component if user is not logged in
	if (!user) {
		return null;
	}

	return (
		<div className={classes.addressSwitchRow}>
			<div className='flex w-full items-center justify-between gap-x-4'>
				<span className='flex flex-col items-start gap-y-2 text-sm text-basic_text'>
					{t('PostDetails.showingVotesFor')}
					<Address
						address={selectedAddress}
						truncateCharLen={5}
						disableTooltip
					/>
				</span>
				<Dialog>
					<DialogTrigger asChild>
						<Button
							variant='secondary'
							size='sm'
							className='flex items-center gap-x-2 text-bg_pink'
						>
							{t('PostDetails.switchWallet')}
							<RefreshCcwIcon className='h-4 w-4' />
						</Button>
					</DialogTrigger>
					<DialogContent className='p-4 sm:max-w-md sm:p-6'>
						<DialogHeader>
							<DialogTitle>{t('PostDetails.switchWallet')}</DialogTitle>
						</DialogHeader>
						<div className='flex flex-col gap-y-4 py-4'>
							<SwitchWalletOrAddress small />
						</div>
					</DialogContent>
				</Dialog>
			</div>

			{/* Show VoteReferendumButton for both voted and non-voted states */}
			<div className='mt-4'>
				<VoteReferendumButton
					index={index}
					track={track}
					proposalType={proposalType}
					showUserVoteCard={showUserVoteCard}
					size='lg'
					address={selectedAddress}
				/>
			</div>
		</div>
	);
}

export default AddressSwitchRow;
