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
	enactmentPeriodEndsAt,
	status,
	trackName
}: {
	confirmationPeriodEndsAt?: Date;
	decisionPeriodEndsAt?: Date;
	preparePeriodEndsAt?: Date;
	enactmentPeriodEndsAt?: Date | null;
	status: EProposalStatus;
	trackName: EPostOrigin;
}) {
	const t = useTranslations();
	const now = dayjs();

	const periodEnds = {
		prepare: preparePeriodEndsAt ? dayjs(preparePeriodEndsAt).isBefore(now) : false,
		decision: decisionPeriodEndsAt ? dayjs(decisionPeriodEndsAt).isBefore(now) : false,
		confirmation: confirmationPeriodEndsAt ? dayjs(confirmationPeriodEndsAt).isBefore(now) : false,
		enactment: enactmentPeriodEndsAt ? dayjs(enactmentPeriodEndsAt).isBefore(now, 'day') : false
	};

	const isProposalFailed = [EProposalStatus.Rejected, EProposalStatus.TimedOut, EProposalStatus.Cancelled, EProposalStatus.Killed, EProposalStatus.ExecutionFailed].includes(
		status
	);

	const proposalFailureMessages: { [key in EProposalStatus]?: string } = {
		[EProposalStatus.Cancelled]: 'PostDetails.proposalCancelledInfo',
		[EProposalStatus.Killed]: 'PostDetails.proposalKilledInfo',
		[EProposalStatus.TimedOut]: 'PostDetails.proposalTimedOutInfo',
		[EProposalStatus.Rejected]: 'PostDetails.proposalRejectedInfo',
		[EProposalStatus.ExecutionFailed]: 'PostDetails.proposalExecutionFailedInfo'
	};

	const getProposalFailureMessage = () => t(proposalFailureMessages[status] || 'PostDetails.proposalApprovalThresholdFailedInfo');

	const renderFailureMessage = () => {
		const failureMessages: { [key in EProposalStatus]?: string } = {
			[EProposalStatus.Killed]: t('PostDetails.proposalKiller'),
			[EProposalStatus.TimedOut]: t('PostDetails.proposalTimedOut')
		};
		return failureMessages[status] || t('PostDetails.proposalFailed');
	};

	if (isProposalFailed) {
		return (
			<div className={classes.proposalPeriodsWrapper}>
				<div className='flex items-center justify-between'>
					<div className={classes.proposalPeriodsHeaderTitle}>{renderFailureMessage()}</div>
					<div className={classes.proposalPeriodsHeaderPeriods}>
						<p className={classes.proposalPeriodsHeaderPeriodsNumber}>
							{Math.min(3, [periodEnds.prepare, periodEnds.decision, periodEnds.confirmation].filter(Boolean).length + 1)}
						</p>
						<span className='pl-1 pr-2'>of 3</span>
					</div>
				</div>
				<span className='mt-0 pt-0 text-sm text-basic_text'>{getProposalFailureMessage()}</span>
			</div>
		);
	}

	return (
		<div className={classes.proposalPeriodsWrapper}>
			<div className={classes.proposalPeriodsHeader}>
				<p className={classes.proposalPeriodsHeaderTitle}>
					{periodEnds.confirmation
						? status === EProposalStatus.Passed || status === EProposalStatus.Executed
							? t('PostDetails.proposalPassed')
							: t('PostDetails.proposalFailed')
						: periodEnds.decision
							? t('PostDetails.confirmationPeriod')
							: periodEnds.prepare
								? t('PostDetails.votingStarted')
								: t('PostDetails.preparePeriod')}
				</p>
				<div className={classes.proposalPeriodsHeaderPeriods}>
					<p className={classes.proposalPeriodsHeaderPeriodsNumber}>{Math.min(3, [periodEnds.prepare, periodEnds.decision, periodEnds.confirmation].filter(Boolean).length + 1)}</p>
					<span className='pl-1 pr-2'>of 3</span>
				</div>
			</div>

			{/* Proposal Periods */}
			<div>
				{periodEnds.confirmation ? null : periodEnds.prepare ? (
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
					<PeriodProgress
						periodEndsAt={preparePeriodEndsAt}
						periodName={t('PostDetails.preparePeriod')}
						trackName={trackName}
						periodType={EPeriodType.PREPARE}
					/>
				)}

				{/* Enactment Period */}
				{enactmentPeriodEndsAt && !periodEnds.enactment && (
					<PeriodProgress
						periodEndsAt={enactmentPeriodEndsAt}
						periodName={t('PostDetails.minEnactmentPeriod')}
						trackName={trackName}
						periodType={EPeriodType.ENACTMENT}
					/>
				)}
			</div>
		</div>
	);
}

export default ProposalPeriods;
