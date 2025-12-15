// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useState } from 'react';
import { dayjs } from '@shared/_utils/dayjsInit';
import { EPeriodType, EPostOrigin, EProposalStatus } from '@/_shared/types';
import { useTranslations } from 'next-intl';
import { FAILED_PROPOSAL_STATUSES, PASSED_PROPOSAL_STATUSES } from '@/_shared/_constants/proposalResultStatuses';
import { getPeriodProgressLabel } from '@/app/_client-utils/getPeriodProgressLabel';
import { Minus, Plus } from 'lucide-react';
import { Separator } from '@/app/_shared-components/Separator';
import Image from 'next/image';
import InfoQueryIcon from '@assets/icons/info-query-icon.svg';
import { PeriodProgress } from './PeriodProgress';
import { TimelineSection } from './TimelineSection';
import classes from './ProposalPeriods.module.scss';
import { Tooltip, TooltipContent, TooltipTrigger } from '../../Tooltip';

function RenderPeriodProgress({
	confirmationPeriodEnded,
	proposalHasFailed,
	preparePeriodEnded,
	decisionPeriodEndsAt,
	confirmationPeriodEndsAt,
	preparePeriodEndsAt,
	trackName
}: {
	confirmationPeriodEnded: boolean;
	proposalHasFailed: boolean;
	preparePeriodEnded: boolean;
	decisionPeriodEndsAt?: Date;
	confirmationPeriodEndsAt?: Date;
	preparePeriodEndsAt?: Date;
	trackName: EPostOrigin;
}) {
	const t = useTranslations();
	if (confirmationPeriodEnded || proposalHasFailed) {
		return null;
	}

	if (preparePeriodEnded) {
		return (
			<div className='flex flex-col gap-y-6'>
				<PeriodProgress
					periodEndsAt={decisionPeriodEndsAt}
					trackName={trackName}
					periodType={EPeriodType.DECISION}
					periodName={t('PostDetails.decisionPeriod')}
				/>
				<PeriodProgress
					periodEndsAt={confirmationPeriodEndsAt}
					trackName={trackName}
					periodType={EPeriodType.CONFIRM}
					periodName={t('PostDetails.confirmationPeriod')}
				/>
			</div>
		);
	}

	return (
		<div>
			<PeriodProgress
				periodEndsAt={preparePeriodEndsAt}
				trackName={trackName}
				periodType={EPeriodType.PREPARE}
			/>
		</div>
	);
}

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
	const [isExpanded, setIsExpanded] = useState(false);

	const preparePeriodEnded = preparePeriodEndsAt ? dayjs(preparePeriodEndsAt).isBefore(dayjs()) : false;
	const decisionPeriodEnded = decisionPeriodEndsAt ? dayjs(decisionPeriodEndsAt).isBefore(dayjs()) : false;
	const confirmationPeriodEnded = confirmationPeriodEndsAt ? dayjs(confirmationPeriodEndsAt).isBefore(dayjs()) : false;
	const proposalHasFailed = FAILED_PROPOSAL_STATUSES.includes(status);
	const proposalHasPassed = PASSED_PROPOSAL_STATUSES.includes(status);

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
			return t('PostDetails.votingPeriod');
		}

		return t('PostDetails.preparePeriod');
	};

	const getStatusTooltip = () => {
		if (decisionPeriodEnded) {
			return t('PostDetails.Tooltips.enactmentPeriod');
		}

		if (preparePeriodEnded) {
			return t('PostDetails.Tooltips.votingPeriod');
		}

		return t('PostDetails.Tooltips.preparePeriod');
	};

	// Get the current period progress label (e.g., "4/10 days")
	const getCurrentPeriodLabel = () => {
		if (!preparePeriodEnded) {
			return getPeriodProgressLabel({ endAt: preparePeriodEndsAt, trackName, periodType: EPeriodType.PREPARE });
		}
		return '';
	};

	const currentPeriodLabel = getCurrentPeriodLabel();

	const toggleExpanded = () => {
		setIsExpanded(!isExpanded);
	};

	return (
		<div className={classes.proposalPeriodsWrapper}>
			<div className={classes.proposalPeriodsHeader}>
				<div className={classes.headerLeft}>
					<p className={classes.proposalPeriodsHeaderTitle}>{getStatusText()}</p>
					<div className={classes.progressIndicator}>
						<span className={classes.progressNumber}>{currentPeriodLabel}</span>
					</div>
					{!confirmationPeriodEnded && (
						<Tooltip>
							<TooltipTrigger asChild>
								<Image
									src={InfoQueryIcon}
									alt='info query icon'
									className='h-3.5 w-3.5'
									width={14}
									height={14}
								/>
							</TooltipTrigger>
							<TooltipContent className='bg-tooltip_background text-sm text-white'>{getStatusTooltip()}</TooltipContent>
						</Tooltip>
					)}
				</div>
				<div className={classes.headerRight}>
					<button
						type='button'
						className={classes.collapseButton}
						title={isExpanded ? 'Collapse timeline' : 'Expand timeline'}
						onClick={toggleExpanded}
					>
						{isExpanded ? (
							<Minus
								className={classes.collapseIcon}
								size={16}
							/>
						) : (
							<Plus
								className={classes.collapseIcon}
								size={16}
							/>
						)}
					</button>
				</div>
			</div>
			<RenderPeriodProgress
				confirmationPeriodEnded={confirmationPeriodEnded}
				proposalHasFailed={proposalHasFailed}
				preparePeriodEnded={preparePeriodEnded}
				decisionPeriodEndsAt={decisionPeriodEndsAt}
				confirmationPeriodEndsAt={confirmationPeriodEndsAt}
				preparePeriodEndsAt={preparePeriodEndsAt}
				trackName={trackName}
			/>
			{isExpanded && (
				<>
					<Separator
						orientation='horizontal'
						className='w-full bg-border_grey opacity-70'
					/>
					<TimelineSection
						confirmationPeriodEnded={confirmationPeriodEnded}
						proposalHasFailed={proposalHasFailed}
						preparePeriodEnded={preparePeriodEnded}
						decisionPeriodEnded={decisionPeriodEnded}
					/>
				</>
			)}
		</div>
	);
}

export default ProposalPeriods;
