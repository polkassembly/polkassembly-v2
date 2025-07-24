// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

/* eslint-disable no-underscore-dangle */
import { IBeneficiary, IProposalArguments } from '@/_shared/types';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { useCallback, useState, useMemo, memo } from 'react';
import { ChevronRightIcon } from 'lucide-react';
import { Skeleton } from '../../Skeleton';
import classes from './Call.module.scss';
import BeneficiaryPayoutsList from '../BeneficiariesDetails/BeneficiaryPayoutsList';
import { Dialog, DialogContent, DialogTrigger } from '../../Dialog/Dialog';
import ArgumentsTableJSONView from '../OnchainInfo/ArgumentsTableJSONView';
import { Button } from '../../Button';

const MAX_CALLS_TO_SHOW = 4;

// Extract call details with better type safety
const extractCallDetails = (args?: IProposalArguments): Array<{ section: string; method: string }> => {
	if (!args?.args?.calls || !Array.isArray(args.args.calls)) return [];

	return args.args.calls.reduce<Array<{ section: string; method: string }>>((acc, call) => {
		if (call?.value?.__kind && call?.__kind) {
			acc.push({ section: call.__kind, method: call.value.__kind });
		}
		return acc;
	}, []);
};

// Separate component for proposal hash display
const ProposalHashDisplay = memo(({ proposalHash }: { proposalHash?: string }) => {
	const t = useTranslations();

	if (!proposalHash) {
		return <Skeleton className='my-2 h-7 w-full' />;
	}

	return (
		<div className={classes.infoRow}>
			<p className={classes.infoRowLabel}>{t('PostDetails.OnchainInfo.proposalHash')}</p>
			<p className={cn(classes.infoRowValue, 'break-words')}>{proposalHash}</p>
		</div>
	);
});

ProposalHashDisplay.displayName = 'ProposalHashDisplay';

// Separate component for calls display
const CallsDisplay = memo(({ args, isFetching }: { args?: IProposalArguments; isFetching?: boolean }) => {
	const t = useTranslations();
	const [showAllCalls, setShowAllCalls] = useState(false);

	const calls = useMemo(() => extractCallDetails(args), [args]);

	const toggleShowAllCalls = useCallback(() => {
		setShowAllCalls((prev) => !prev);
	}, []);

	if (!args && isFetching) {
		return (
			<div className={classes.infoRow}>
				<Skeleton className='my-2 h-8' />
				<Skeleton className='my-2 h-8' />
			</div>
		);
	}

	if (!args) return null;

	return (
		<div className={classes.infoRow}>
			<p className={classes.infoRowLabel}>{t('PostDetails.OnchainInfo.call')}</p>
			<div className={cn('flex flex-col gap-y-1', classes.infoRowValue, 'break-words')}>
				<div className='flex gap-x-2'>
					<span className={cn(classes.argsLabel)}>{args.section}</span>
					<span className={cn(classes.argsLabel)}>{args.method.replace('_', ' ')}</span>

					<Dialog>
						<DialogTrigger className='flex items-center gap-x-0.5 text-xs text-text_pink'>
							{t('PostDetails.OnchainInfo.details')}
							<ChevronRightIcon className='h-3.5 w-3.5' />
						</DialogTrigger>
						<DialogContent className='max-h-[80vh] min-h-[50vh] w-[500px] p-6 max-lg:w-full'>
							<div className='max-h-[80vh] overflow-x-auto overflow-y-auto'>
								<ArgumentsTableJSONView postArguments={args} />
							</div>
						</DialogContent>
					</Dialog>
				</div>
				{calls.length > 0 && (
					<div className='relative ml-4 mt-2 flex flex-col gap-y-1 border-l-2 border-dashed border-border_grey pl-4 dark:border-gray-600'>
						{calls.slice(0, showAllCalls ? undefined : MAX_CALLS_TO_SHOW).map((call) => (
							<div
								className='flex gap-x-1'
								key={`${call.section}-${call.method}`}
							>
								<span className={classes.argsLabel}>{call.section}</span>
								<span className={classes.argsLabel}>{call.method}</span>
							</div>
						))}
						{calls.length > MAX_CALLS_TO_SHOW && (
							<div className='mt-1 flex justify-start'>
								<Button
									variant='ghost'
									className='flex h-4 w-full items-center justify-start p-0 text-xs font-medium text-text_pink'
									onClick={toggleShowAllCalls}
								>
									{showAllCalls ? t('PostDetails.OnchainInfo.showLess') : t('PostDetails.OnchainInfo.showMore')}
								</Button>
							</div>
						)}
					</div>
				)}
			</div>
		</div>
	);
});

CallsDisplay.displayName = 'CallsDisplay';

// Separate component for beneficiaries display
const BeneficiariesDisplay = memo(({ beneficiaries }: { beneficiaries?: IBeneficiary[] }) => {
	const t = useTranslations();

	if (!beneficiaries?.length) return null;

	return (
		<div className={classes.infoRow}>
			<p className={classes.infoRowLabel}>{t('PostDetails.OnchainInfo.requested')}</p>
			<p className={classes.infoRowValue}>
				<BeneficiaryPayoutsList
					beneficiaries={beneficiaries}
					usedInOnchainInfo
				/>
			</p>
		</div>
	);
});

BeneficiariesDisplay.displayName = 'BeneficiariesDisplay';

// Main component
interface CallsProps {
	proposalHash?: string;
	beneficiaries?: IBeneficiary[];
	args?: IProposalArguments;
	isFetching?: boolean;
}

const Calls = memo(({ proposalHash, beneficiaries, args, isFetching }: CallsProps) => {
	return (
		<div>
			<ProposalHashDisplay proposalHash={proposalHash} />
			<CallsDisplay
				args={args}
				isFetching={isFetching}
			/>
			<BeneficiariesDisplay beneficiaries={beneficiaries} />
		</div>
	);
});

Calls.displayName = 'Calls';

export default Calls;
