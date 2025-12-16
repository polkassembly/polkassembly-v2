// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { BN } from '@polkadot/util';
import { IDVDelegateVotingMatrix, EDVDelegateType, ENetwork } from '@/_shared/types';
import { formatBnBalance } from '@/app/_client-utils/formatBnBalance';
import { Skeleton } from '@/app/_shared-components/Skeleton';
import delegatees from '@assets/delegation/delegatees.svg';
import delegates from '@assets/delegation/delegates.svg';
import votes from '@assets/delegation/votes.svg';

interface VotingStatsCardProps {
	votingMatrix: IDVDelegateVotingMatrix[];
	referendumCount: number;
	network: ENetwork;
	loading?: boolean;
}

function VotingStatsCard({ votingMatrix, referendumCount, network, loading }: VotingStatsCardProps) {
	const t = useTranslations('DecentralizedVoices');

	if (loading) {
		return (
			<div className='my-2 w-full rounded-xl border border-border_grey bg-bg_modal p-3'>
				<div className='flex flex-wrap items-center justify-between gap-6'>
					<div className='flex items-start gap-4'>
						<Skeleton className='h-10 w-10 rounded-full' />
						<div className='space-y-2'>
							<Skeleton className='h-3 w-24' />
							<Skeleton className='h-5 w-32' />
						</div>
					</div>
					<div className='flex items-start gap-4'>
						<Skeleton className='h-10 w-10 rounded-full' />
						<div className='space-y-2'>
							<Skeleton className='h-3 w-24' />
							<Skeleton className='h-5 w-32' />
						</div>
					</div>
					<div className='flex items-start gap-4'>
						<Skeleton className='h-10 w-10 rounded-full' />
						<div className='space-y-2'>
							<Skeleton className='h-3 w-24' />
							<Skeleton className='h-5 w-32' />
						</div>
					</div>
				</div>
			</div>
		);
	}

	const totalDAOVotes = votingMatrix
		.filter((d) => d.type === EDVDelegateType.DAO)
		.reduce((acc, curr) => acc.add(new BN(curr.totalVotingPower || '0')), new BN(0))
		.toString();

	const totalGuardianVotes = votingMatrix
		.filter((d) => d.type === EDVDelegateType.GUARDIAN)
		.reduce((acc, curr) => acc.add(new BN(curr.totalVotingPower || '0')), new BN(0))
		.toString();

	const totalPossibleVotes = votingMatrix.length * referendumCount;
	const activeParticipationRate = totalPossibleVotes > 0 ? ((votingMatrix.reduce((acc, curr) => acc + curr.activeCount, 0) / totalPossibleVotes) * 100).toFixed(1) : '0.0';
	const hasGuardians = votingMatrix.filter((d) => d.type === EDVDelegateType.GUARDIAN).length > 0;

	return (
		<div className='my-2 w-full rounded-xl border border-border_grey bg-bg_modal p-3'>
			<div className='flex flex-wrap items-center justify-between gap-6'>
				<div className='flex items-start gap-4'>
					<Image
						src={delegatees}
						alt='Delegatees'
						className='h-10 w-10'
					/>
					<div>
						<p className='text-xs font-medium uppercase text-dv_header_text'>{t('TotalDAOVotes')}</p>
						<p className='text-lg font-semibold text-text_primary'>{formatBnBalance(totalDAOVotes, { withUnit: true, numberAfterComma: 0, compactNotation: true }, network)}</p>
					</div>
				</div>

				{hasGuardians && (
					<div className='flex items-start gap-4'>
						<Image
							src={delegates}
							alt='Delegates'
							className='h-10 w-10'
						/>
						<div>
							<p className='text-xs font-medium uppercase text-dv_header_text'>{t('TotalGuardianVotes')}</p>
							<p className='text-lg font-semibold text-text_primary'>
								{formatBnBalance(totalGuardianVotes, { withUnit: true, numberAfterComma: 0, compactNotation: true }, network)}
							</p>
						</div>
					</div>
				)}

				<div className='flex items-start gap-4'>
					<Image
						src={votes}
						alt='Votes'
						className='h-10 w-10'
					/>
					<div>
						<p className='text-xs font-medium uppercase text-dv_header_text'>{t('ActiveParticipationRate')}</p>
						<p className='text-lg font-semibold text-text_primary'>{activeParticipationRate}%</p>
					</div>
				</div>
			</div>
		</div>
	);
}

export default VotingStatsCard;
