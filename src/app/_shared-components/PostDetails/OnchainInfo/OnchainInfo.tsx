// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

/* eslint-disable sonarjs/no-duplicate-string */

import { EProposalType, IOnChainMetadata, IOnChainPostInfo } from '@/_shared/types';
import { NextApiClientService } from '@/app/_client-services/next_api_client_service';
import { ClientError } from '@/app/_client-utils/clientError';
import { FIVE_MIN_IN_MILLI } from '@/app/api/_api-constants/timeConstants';
import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { formatBnBalance } from '@/app/_client-utils/formatBnBalance';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { ValidatorService } from '@/_shared/_services/validator_service';
import Link from 'next/link';
import { dayjs } from '@/_shared/_utils/dayjsInit';
import { Skeleton } from '../../Skeleton';
import ArgumentsTableJSONView from './ArgumentsTableJSONView';
import classes from './OnchainInfo.module.scss';
import Address from '../../Profile/Address/Address';

// FIXME: reduce cognitive complexity
// eslint-disable-next-line sonarjs/cognitive-complexity
function OnchainInfo({ proposalType, index, onchainInfo }: { proposalType: EProposalType; index: string; onchainInfo?: IOnChainPostInfo }) {
	const t = useTranslations();
	const network = getCurrentNetwork();

	const fetchOnChainMetadata = async (): Promise<IOnChainMetadata> => {
		const { data, error } = await NextApiClientService.getOnChainMetadataForPost(proposalType, index);
		if (error || !data) {
			throw new ClientError(error?.message || 'Failed to fetch onchain metadata');
		}

		return data;
	};

	const { data: onchainMetadata, isFetching } = useQuery({
		queryKey: ['onchainMetadata', proposalType, index],
		queryFn: fetchOnChainMetadata,
		placeholderData: (previousData) => previousData,
		staleTime: FIVE_MIN_IN_MILLI
	});

	const proposer: string | undefined = onchainInfo?.proposer || onchainMetadata?.proposer || onchainMetadata?.preimage?.proposer;
	const createdAtDate: Date | string | undefined = onchainInfo?.createdAt || onchainMetadata?.preimage?.createdAt || onchainMetadata?.createdAt;
	const hash: string | undefined = onchainInfo?.hash || onchainMetadata?.preimage?.hash || onchainMetadata?.hash;
	const createdAtBlock: number | undefined = onchainMetadata?.preimage?.createdAtBlock || onchainMetadata?.createdAtBlock;
	const method: string | undefined = onchainMetadata?.preimage?.method || onchainMetadata?.preimage?.proposedCall?.method || onchainMetadata?.proposedCall?.method;
	const section: string | undefined = onchainMetadata?.preimage?.section || onchainMetadata?.preimage?.proposedCall?.section || onchainMetadata?.proposedCall?.section;
	const description: string | undefined = onchainMetadata?.preimage?.proposedCall?.description || onchainMetadata?.proposedCall?.description;
	const trackNumber: number | undefined = onchainMetadata?.trackNumber;
	const enactmentAtBlock: number | undefined = onchainMetadata?.enactmentAtBlock;
	const enactmentAfterBlock: number | undefined = onchainMetadata?.enactmentAfterBlock;
	const args = onchainMetadata?.preimage?.proposedCall || onchainMetadata?.proposedCall;

	return (
		<div>
			<p className={classes.metadataHeading}>{t('PostDetails.OnchainInfo.metadata')}</p>

			<div className={cn(classes.infoContainer, 'gap-y-2')}>
				{onchainInfo?.origin && (
					<div className={classes.infoRow}>
						<p className={classes.infoRowLabel}>{t('PostDetails.OnchainInfo.origin')}</p>
						<p className={classes.infoRowValue}>{onchainInfo?.origin}</p>
					</div>
				)}

				{!proposer && isFetching ? (
					<Skeleton className='h-4' />
				) : (
					proposer && (
						<div className={classes.infoRow}>
							<p className={classes.infoRowLabel}>{t('PostDetails.OnchainInfo.proposer')}</p>
							<Address address={proposer} />
						</div>
					)
				)}

				{!hash && isFetching ? (
					<Skeleton className='my-2 h-7' />
				) : (
					hash && (
						<div className={classes.infoRow}>
							<p className={classes.infoRowLabel}>{t('PostDetails.OnchainInfo.proposalHash')}</p>
							<p className={cn(classes.infoRowValue, 'break-words')}>{hash}</p>
						</div>
					)
				)}

				{!createdAtDate && isFetching ? (
					<Skeleton className='my-2 h-7' />
				) : (
					createdAtDate && (
						<div className={classes.infoRow}>
							<p className={classes.infoRowLabel}>{t('PostDetails.OnchainInfo.createdAt')}</p>
							<p className={classes.infoRowValue}>{dayjs(createdAtDate).format('DD MMM YYYY, HH:mm')}</p>
						</div>
					)
				)}

				{!createdAtBlock && isFetching ? (
					<Skeleton className='my-2 h-7' />
				) : (
					createdAtBlock && (
						<div className={classes.infoRow}>
							<p className={classes.infoRowLabel}>{t('PostDetails.OnchainInfo.createdAtBlock')}</p>
							<p className={classes.infoRowValue}>{createdAtBlock}</p>
						</div>
					)
				)}

				{!ValidatorService.isValidNumber(trackNumber) && isFetching ? (
					<Skeleton className='my-2 h-7' />
				) : (
					trackNumber && (
						<div className={classes.infoRow}>
							<p className={classes.infoRowLabel}>{t('PostDetails.OnchainInfo.trackNumber')}</p>
							<p className={classes.infoRowValue}>{trackNumber}</p>
						</div>
					)
				)}

				{!enactmentAtBlock && isFetching ? (
					<Skeleton className='my-2 h-7' />
				) : (
					enactmentAtBlock && (
						<div className={classes.infoRow}>
							<p className={classes.infoRowLabel}>{t('PostDetails.OnchainInfo.enactmentAtBlock')}</p>
							<p className={classes.infoRowValue}>{enactmentAtBlock}</p>
						</div>
					)
				)}

				{!enactmentAfterBlock && isFetching ? (
					<Skeleton className='my-2 h-7' />
				) : (
					enactmentAfterBlock && (
						<div className={classes.infoRow}>
							<p className={classes.infoRowLabel}>{t('PostDetails.OnchainInfo.enactmentAfterBlock')}</p>
							<p className={classes.infoRowValue}>{enactmentAfterBlock}</p>
						</div>
					)
				)}

				{!method && isFetching ? (
					<Skeleton className='my-2 h-7' />
				) : (
					method && (
						<div className={classes.infoRow}>
							<p className={classes.infoRowLabel}>{t('PostDetails.OnchainInfo.method')}</p>
							<p className={cn(classes.infoRowValue, 'break-words')}>{method}</p>
						</div>
					)
				)}

				{!section && isFetching ? (
					<Skeleton className='my-2 h-7' />
				) : (
					section && (
						<div className={classes.infoRow}>
							<p className={classes.infoRowLabel}>{t('PostDetails.OnchainInfo.section')}</p>
							<p className={cn(classes.infoRowValue, 'break-words')}>{section}</p>
						</div>
					)
				)}

				{!description && isFetching ? (
					<Skeleton className='my-2 h-20' />
				) : (
					description && (
						<div className={classes.infoRow}>
							<p className={classes.infoRowLabel}>{t('PostDetails.OnchainInfo.description')}</p>
							<p className={cn(classes.infoRowValue, 'break-words')}>{description}</p>
						</div>
					)
				)}

				{/* Bounty Onchain Info */}
				{ValidatorService.isValidNumber(onchainInfo?.parentBountyIndex) && (
					<div className={classes.infoRow}>
						<p className={classes.infoRowLabel}>{t('PostDetails.OnchainInfo.parentBountyIndex')}</p>
						<Link
							href={`/bounty/${onchainInfo?.parentBountyIndex}`}
							className={cn(classes.infoRowValue, 'text-text_pink')}
						>
							#{onchainInfo?.parentBountyIndex}
						</Link>
					</div>
				)}
				{onchainInfo?.deposit && (
					<div className={classes.infoRow}>
						<p className={classes.infoRowLabel}>{t('PostDetails.OnchainInfo.deposit')}</p>
						<p className={classes.infoRowValue}>{formatBnBalance(onchainInfo?.deposit, { withUnit: true, numberAfterComma: 2 }, network)}</p>
					</div>
				)}
				{onchainInfo?.reward && (
					<div className={classes.infoRow}>
						<p className={classes.infoRowLabel}>{t('PostDetails.OnchainInfo.reward')}</p>
						<p className={classes.infoRowValue}>{formatBnBalance(onchainInfo?.reward, { withUnit: true, numberAfterComma: 2 }, network)}</p>
					</div>
				)}
				{onchainInfo?.curatorDeposit && (
					<div className={classes.infoRow}>
						<p className={classes.infoRowLabel}>{t('PostDetails.OnchainInfo.curatorDeposit')}</p>
						<p className={classes.infoRowValue}>{formatBnBalance(onchainInfo?.curatorDeposit, { withUnit: true, numberAfterComma: 2 }, network)}</p>
					</div>
				)}
				{onchainInfo?.fee && (
					<div className={classes.infoRow}>
						<p className={classes.infoRowLabel}>{t('PostDetails.OnchainInfo.fee')}</p>
						<p className={classes.infoRowValue}>{formatBnBalance(onchainInfo?.fee, { withUnit: true, numberAfterComma: 2 }, network)}</p>
					</div>
				)}
				{onchainInfo?.payee && (
					<div className={classes.infoRow}>
						<p className={classes.infoRowLabel}>{t('PostDetails.OnchainInfo.payee')}</p>
						<Address address={onchainInfo?.payee} />
					</div>
				)}
				{onchainInfo?.curator && (
					<div className={classes.infoRow}>
						<p className={classes.infoRowLabel}>{t('PostDetails.OnchainInfo.curator')}</p>
						<Address address={onchainInfo?.curator} />
					</div>
				)}

				{!args && isFetching ? (
					<Skeleton className='my-2 h-40' />
				) : (
					args && (
						<div>
							<ArgumentsTableJSONView postArguments={args} />
						</div>
					)
				)}
			</div>
		</div>
	);
}

export default OnchainInfo;
