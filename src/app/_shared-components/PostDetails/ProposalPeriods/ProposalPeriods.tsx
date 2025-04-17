// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React from 'react';
import { dayjs } from '@shared/_utils/dayjsInit';
import { EPeriodType, EPostOrigin, EProposalStatus } from '@/_shared/types';
import { useTranslations } from 'next-intl';
import PeriodProgress from './PeriodProgress';
import classes from './ProposalPeriods.module.scss';
import PeriodDetailModal from './PeriodDetailModal/PeriodDetailModal';

const MAX_PERIODS = 3;

function ProposalPeriods({
	confirmationPeriodEndsAt,
	decisionPeriodEndsAt,
	preparePeriodEndsAt,
	status,
	trackName
}: {
	confirmationPeriodEndsAt?: Date;
	decisionPeriodEndsAt?: Date;
	preparePeriodEndsAt?: Date;
	status: EProposalStatus;
	trackName: EPostOrigin;
}) {
	const t = useTranslations();
	const preparePeriodEnded = preparePeriodEndsAt ? dayjs(preparePeriodEndsAt).isBefore(dayjs()) : false;
	const decisionPeriodEnded = decisionPeriodEndsAt ? dayjs(decisionPeriodEndsAt).isBefore(dayjs()) : false;
	const confirmationPeriodEnded = confirmationPeriodEndsAt ? dayjs(confirmationPeriodEndsAt).isBefore(dayjs()) : false;

	const periodsEnded = [preparePeriodEnded, decisionPeriodEnded, confirmationPeriodEnded].filter((period) => period);

	const periodsToShow = Math.min((periodsEnded?.length || 0) + 1, MAX_PERIODS);

	return (
		<div className={classes.proposalPeriodsWrapper}>
			<div className={classes.proposalPeriodsHeader}>
				<p className={classes.proposalPeriodsHeaderTitle}>
					{confirmationPeriodEnded
						? status === EProposalStatus.Passed || EProposalStatus.Executed
							? t('PostDetails.proposalPassed')
							: t('PostDetails.proposalFailed')
						: decisionPeriodEnded
							? t('PostDetails.confirmationPeriod')
							: preparePeriodEnded
								? t('PostDetails.votingStarted')
								: t('PostDetails.preparePeriod')}
				</p>

				<PeriodDetailModal>
					<button
						className={classes.proposalPeriodsHeaderPeriods}
						aria-label='Open proposal periods details'
						type='button'
						tabIndex={0}
						style={{ cursor: 'pointer', background: 'none', border: 'none' }}
					>
						<p className={classes.proposalPeriodsHeaderPeriodsNumber}>{periodsToShow}</p>
						<span className='pl-1 pr-2'>of {MAX_PERIODS}</span>
					</button>
				</PeriodDetailModal>
			</div>
			{confirmationPeriodEnded ? null : preparePeriodEnded ? (
				<div className='flex flex-col gap-y-6'>
					<PeriodProgress
						periodEndsAt={decisionPeriodEndsAt}
						periodName={t('PostDetails.decisionPeriod')}
						trackName={trackName}
						periodType={EPeriodType.DECISION}
					/>
					<PeriodProgress
						periodEndsAt={confirmationPeriodEndsAt}
						periodName={t('PostDetails.confirmationPeriod')}
						trackName={trackName}
						periodType={EPeriodType.CONFIRM}
					/>
				</div>
			) : (
				<div>
					<PeriodProgress
						periodEndsAt={preparePeriodEndsAt}
						periodName={t('PostDetails.preparePeriod')}
						trackName={trackName}
						periodType={EPeriodType.PREPARE}
					/>
				</div>
			)}
		</div>
	);
}

export default ProposalPeriods;
