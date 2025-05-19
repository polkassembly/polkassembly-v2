// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React from 'react';
import { dayjs } from '@shared/_utils/dayjsInit';
import { EPeriodType, EPostOrigin, EProposalStatus } from '@/_shared/types';
import { useTranslations } from 'next-intl';
import PeriodProgress from './PeriodProgress';
import classes from './ProposalPeriods.module.scss';

const TOTAL_PERIODS = 3;

const FAILED_STATUSES = [EProposalStatus.Rejected, EProposalStatus.TimedOut, EProposalStatus.Killed, EProposalStatus.ExecutionFailed, EProposalStatus.Cancelled];

const PASSED_STATUSES = [EProposalStatus.Passed, EProposalStatus.Executed];

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
	const proposalHasFailed = FAILED_STATUSES.includes(status);
	const proposalHasPassed = PASSED_STATUSES.includes(status);

	const periodsEnded = [preparePeriodEnded, decisionPeriodEnded, confirmationPeriodEnded].filter((period) => period);

	const getStatusText = () => {
		if (proposalHasFailed) {
			return t('PostDetails.proposalFailed');
		}

		if (confirmationPeriodEnded) {
			return proposalHasPassed ? t('PostDetails.proposalPassed') : t('PostDetails.proposalFailed');
		}

		if (decisionPeriodEnded) {
			return t('PostDetails.confirmationPeriod');
		}

		if (preparePeriodEnded) {
			return t('PostDetails.votingStarted');
		}

		return t('PostDetails.preparePeriod');
	};

	const renderPeriodProgress = () => {
		if (confirmationPeriodEnded || proposalHasFailed) {
			return null;
		}

		if (preparePeriodEnded) {
			return (
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
			);
		}

		return (
			<div>
				<PeriodProgress
					periodEndsAt={preparePeriodEndsAt}
					periodName={t('PostDetails.preparePeriod')}
					trackName={trackName}
					periodType={EPeriodType.PREPARE}
				/>
			</div>
		);
	};

	return (
		<div className={classes.proposalPeriodsWrapper}>
			<div className={classes.proposalPeriodsHeader}>
				<p className={classes.proposalPeriodsHeaderTitle}>{getStatusText()}</p>
				<div className={classes.proposalPeriodsHeaderPeriods}>
					<p className={classes.proposalPeriodsHeaderPeriodsNumber}>{Math.min(periodsEnded.length + 1, TOTAL_PERIODS)}</p>
					<span className='pl-1 pr-2'>of {TOTAL_PERIODS}</span>
				</div>
			</div>
			{renderPeriodProgress()}
		</div>
	);
}

export default ProposalPeriods;
