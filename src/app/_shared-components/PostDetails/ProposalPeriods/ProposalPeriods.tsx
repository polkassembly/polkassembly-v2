// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React from 'react';
import { dayjs } from '@shared/_utils/dayjsInit';
import { EPeriodType, EPostOrigin, EProposalStatus } from '@/_shared/types';
import { useTranslations } from 'next-intl';
import PeriodProgress from './PeriodProgress';
import classes from './ProposalPeriods.module.scss';

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
				<div className={classes.proposalPeriodsHeaderPeriods}>
					<p className={classes.proposalPeriodsHeaderPeriodsNumber}>{periodsEnded.length + 1 > 3 ? 3 : periodsEnded.length + 1}</p>
					<span className='pl-1 pr-2'>of 3</span>
				</div>
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
