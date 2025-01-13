// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React from 'react';
import { FaAngleRight } from 'react-icons/fa';
import { useTranslations } from 'next-intl';
import ActivityFeedActiveProposalStyles from './ActivityFeedActiveProposal.module.scss';

function ActivityFeedActiveProposal() {
	const t = useTranslations();
	return (
		<div className={ActivityFeedActiveProposalStyles.activeProposalContainer}>
			<div className={ActivityFeedActiveProposalStyles.activeProposalTitle}>
				<span className={`${ActivityFeedActiveProposalStyles.activeProposalTitleText} dark:text-white`}>
					{t('ActivityFeed.VotedProposals')} <FaAngleRight />
				</span>
				<span className={`${ActivityFeedActiveProposalStyles.activeProposalTitleDate} dark:bg-active_proposal_bg`}>{t('ActivityFeed.Last15Days')}</span>
			</div>
			<div className='text-sm'>
				<span className={ActivityFeedActiveProposalStyles.activeProposalTitleDate}>
					<span className='text-xl font-semibold text-navbar_border'>09</span> out of <span className='text-sm font-semibold'>12</span> {t('ActivityFeed.ActiveProposals')}
				</span>
			</div>
		</div>
	);
}

export default ActivityFeedActiveProposal;
