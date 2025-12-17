// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Ban, Check, Minus, X } from 'lucide-react';
import { ENetwork, EVoteDecision, IDVDelegateVote } from '@/_shared/types';
import Address from '@/app/_shared-components/Profile/Address/Address';
import { cn } from '@/lib/utils';
import { formatBnBalance } from '@/app/_client-utils/formatBnBalance';
import { formatUSDWithUnits } from '@/app/_client-utils/formatUSDWithUnits';
import { useTranslations } from 'next-intl';

const getVoteStyles = (decision: EVoteDecision | string, t: (key: string) => string) => {
	switch (decision) {
		case EVoteDecision.AYE:
			return {
				containerBg: 'bg-dv_voting_card_aye_bg_color',
				icon: <Check size={12} />,
				iconBg: 'bg-dv_voting_dialog_aye_color text-white',
				statusColor: 'text-dv_voting_dialog_aye_color',
				statusText: t('Aye')
			};
		case EVoteDecision.NAY:
			return {
				containerBg: 'bg-dv_voting_card_nay_bg_color',
				icon: <X size={12} />,
				iconBg: 'bg-dv_voting_dialog_nay_color text-white',
				statusColor: 'text-dv_voting_dialog_nay_color',
				statusText: t('Nay')
			};
		case EVoteDecision.ABSTAIN:
			return {
				containerBg: 'bg-dv_voting_card_abstain_bg_color',
				icon: <Ban size={12} />,
				iconBg: 'bg-dv_voting_dialog_abstain_color text-white',
				statusColor: 'text-dv_voting_dialog_abstain_color',
				statusText: t('Abstain')
			};
		default:
			return {
				containerBg: 'bg-dv_voting_card_no_vote_bg_color',
				icon: <Minus size={12} />,
				iconBg: 'bg-dv_voting_card_no_vote_bg_color text-text_secondary',
				statusColor: 'text-text_primary',
				statusText: t('NoVote')
			};
	}
};

function VoteRow({ vote, network }: { vote: IDVDelegateVote; network: ENetwork }) {
	const t = useTranslations('DecentralizedVoices');
	const { decision } = vote;
	const { statusColor, statusText, iconBg, containerBg, icon } = getVoteStyles(decision || '', t);

	return (
		<div className={cn('flex flex-col items-center justify-between rounded-lg p-3 md:flex-row', containerBg)}>
			<Address
				address={vote.address}
				disableTooltip
				iconSize={24}
				textClassName='font-semibold md:max-w-full max-w-20 text-text_primary'
			/>
			<div className='flex items-center gap-8'>
				<div className='flex items-center gap-2'>
					<span className={cn('text-sm font-medium', statusColor)}>{statusText}</span>
					<span className='text-text_secondary text-sm'>
						{vote.percentage?.toFixed(2) ?? 0} {t('PercentOfDV')}
					</span>
					<div className={cn('flex h-5 w-5 items-center justify-center rounded-full', iconBg)}>{icon}</div>
				</div>
				<span className={cn('min-w-[80px] text-right text-sm font-medium', decision ? 'text-text_secondary' : 'text-success')}>
					{`(~${formatUSDWithUnits(formatBnBalance(vote.votingPower || '0', { withUnit: true, numberAfterComma: 2 }, network))})`}
				</span>
			</div>
		</div>
	);
}

export default VoteRow;
