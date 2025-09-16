// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { useTranslations } from 'next-intl';
import { TimelineIcon } from './TimelineIcon';
import classes from './ProposalPeriods.module.scss';

interface TimelineSectionProps {
	confirmationPeriodEnded: boolean;
	preparePeriodEnded: boolean;
	decisionPeriodEnded: boolean;
	proposalHasFailed: boolean;
}

export function TimelineSection({ confirmationPeriodEnded, preparePeriodEnded, decisionPeriodEnded, proposalHasFailed }: TimelineSectionProps) {
	const t = useTranslations();

	// Determine which sub-period is active when in voting period
	const isDecisionPeriodActive = preparePeriodEnded && !decisionPeriodEnded;
	const isConfirmationPeriodActive = decisionPeriodEnded && !confirmationPeriodEnded;

	// Determine timeline states
	const isPreparePeriodActive = !preparePeriodEnded;
	const isPreparePeriodCompleted = preparePeriodEnded;
	const isVotingPeriodActive = preparePeriodEnded && !decisionPeriodEnded && !proposalHasFailed;
	const isVotingPeriodCompleted = decisionPeriodEnded || proposalHasFailed;
	const isEnactmentPeriodActive = decisionPeriodEnded && !confirmationPeriodEnded;
	const isEnactmentPeriodCompleted = confirmationPeriodEnded;

	return (
		<div className={classes.timelineSection}>
			<div className={classes.timelineConnectorWrapper}>
				<div className={classes.timelineConnector} />
			</div>
			{/* Prepare Period */}
			<div className={classes.timelineItem}>
				<div className={`${classes.timelineIcon} ${isPreparePeriodActive || isPreparePeriodCompleted ? classes.active : ''}`}>
					<TimelineIcon
						isActive={isPreparePeriodActive}
						isCompleted={isPreparePeriodCompleted}
					/>
				</div>
				<div className={classes.timelineContent}>
					<div className={`${classes.timelineTitle} ${isPreparePeriodActive || isPreparePeriodCompleted ? classes.active : classes.inactive}`}>
						{t('PostDetails.preparePeriod')}
					</div>
					{isPreparePeriodActive && <div className={classes.timelineStatus}>Active</div>}
				</div>
			</div>

			{/* Voting Period */}
			<div className={classes.timelineItem}>
				<div className={`${classes.timelineIcon} ${isVotingPeriodActive || isVotingPeriodCompleted ? classes.active : ''}`}>
					<TimelineIcon
						isActive={isVotingPeriodActive}
						isCompleted={isVotingPeriodCompleted}
					/>
				</div>
				<div className={classes.timelineContent}>
					<div className={`${classes.timelineTitle} ${isVotingPeriodActive || isVotingPeriodCompleted ? classes.active : classes.inactive}`}>{t('PostDetails.votingPeriod')}</div>
					<div className={classes.timelineSubtext}>
						{(isDecisionPeriodActive || isConfirmationPeriodActive) && !proposalHasFailed ? (
							<span className={classes.activeSubtext}>Active</span>
						) : (
							<>
								<span>{t('PostDetails.decisionPeriod')}</span>
								<span className={classes.timelineDot}>•</span>
								<span>{t('PostDetails.confirmationPeriod')}</span>
							</>
						)}
					</div>
				</div>
			</div>

			{/* Enactment Period - Always show, but as inactive for failed proposals */}
			<div className={classes.timelineItem}>
				<div className={`${classes.timelineIcon} ${(isEnactmentPeriodActive || isEnactmentPeriodCompleted) && !proposalHasFailed ? classes.active : ''}`}>
					<TimelineIcon
						isActive={isEnactmentPeriodActive && !proposalHasFailed}
						isCompleted={isEnactmentPeriodCompleted && !proposalHasFailed}
					/>
				</div>
				<div className={classes.timelineContent}>
					<div className={`${classes.timelineTitle} ${(isEnactmentPeriodActive || isEnactmentPeriodCompleted) && !proposalHasFailed ? classes.active : classes.inactive}`}>
						{t('PostDetails.enactmentPeriod')}
					</div>
					<div className={classes.enactmentDescription}>{t('PostDetails.enactmentDescription')}</div>
				</div>
			</div>
		</div>
	);
}
