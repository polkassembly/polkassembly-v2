// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ENetwork, EVoteDecision, IDVDelegateVote } from '@/_shared/types';
import { cn } from '@/lib/utils';
import { formatBnBalance } from '@/app/_client-utils/formatBnBalance';
import { formatUSDWithUnits } from '@/app/_client-utils/formatUSDWithUnits';
import { useTranslations } from 'next-intl';
import Address from '@/app/_shared-components/Profile/Address/Address';

const getVoteStyles = (decision: EVoteDecision | string, t: (key: string) => string) => {
	switch (decision) {
		case EVoteDecision.AYE:
			return {
				containerBg: 'bg-dv_voting_card_aye_bg_color',
				statusColor: 'text-dv_voting_dialog_aye_color',
				statusText: t('Aye')
			};
		case EVoteDecision.NAY:
			return {
				containerBg: 'bg-dv_voting_card_nay_bg_color',
				statusColor: 'text-dv_voting_dialog_nay_color',
				statusText: t('Nay')
			};
		case EVoteDecision.ABSTAIN:
			return {
				containerBg: 'bg-dv_voting_card_abstain_bg_color',
				statusColor: 'text-dv_voting_dialog_abstain_color',
				statusText: t('Abstain')
			};
		default:
			return {
				containerBg: 'bg-dv_voting_card_no_vote_bg_color',
				statusColor: 'text-text_primary',
				statusText: t('NoVote')
			};
	}
};

function VoteRow({ vote, network }: { vote: IDVDelegateVote; network: ENetwork }) {
	const t = useTranslations('DecentralizedVoices');
	const { decision } = vote;
	const { statusColor, statusText, containerBg } = getVoteStyles(decision || '', t);

	return (
		<div className={cn('grid grid-cols-1 items-center gap-3 rounded-lg p-3 md:grid-cols-3', containerBg)}>
			<div className='flex justify-start'>
				<Address
					address={vote.address}
					disableTooltip
					iconSize={24}
				/>
			</div>

			<div className={cn('flex items-center justify-end gap-2', statusColor)}>
				<span className='whitespace-nowrap text-sm font-medium'>{statusText}</span>
				<span className='whitespace-nowrap text-sm'>
					{vote.percentage?.toFixed(2) ?? 0} {t('PercentOfDV')}
				</span>
			</div>

			<div className={cn('flex justify-end', statusColor)}>
				<span className='whitespace-nowrap text-right text-sm font-medium'>
					{`(~${formatUSDWithUnits(formatBnBalance(vote.votingPower || '0', { withUnit: true, numberAfterComma: 2 }, network))})`}
				</span>
			</div>
		</div>
	);
}

export default VoteRow;
