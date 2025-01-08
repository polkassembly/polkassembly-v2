// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React from 'react';
import { dayjs } from '@shared/_utils/dayjsInit';
import { EProposalStatus } from '@/_shared/types';
import PeriodProgress from './PeriodProgress';
import classes from './ProposalPeriods.module.scss';

function ProposalPeriods({
	confirmationPeriodEndsAt,
	decisionPeriodEndsAt,
	preparePeriodEndsAt,
	status
}: {
	confirmationPeriodEndsAt?: Date;
	decisionPeriodEndsAt?: Date;
	preparePeriodEndsAt?: Date;
	status?: EProposalStatus;
}) {
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
							? 'Proposal Passed'
							: 'Proposal Failed'
						: decisionPeriodEnded
							? 'Confirmation Period'
							: preparePeriodEnded
								? 'Voting has Started'
								: 'Prepare Period'}
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
						periodName='Decision Period'
					/>
					<PeriodProgress
						periodEndsAt={confirmationPeriodEndsAt}
						periodName='Confirmation Period'
					/>
				</div>
			) : (
				<div>
					<PeriodProgress
						periodEndsAt={preparePeriodEndsAt}
						periodName='Prepare Period'
					/>
				</div>
			)}
		</div>
	);
}

export default ProposalPeriods;
