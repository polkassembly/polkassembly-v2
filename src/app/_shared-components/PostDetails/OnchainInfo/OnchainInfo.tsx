// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { EProposalType, IOnChainPostInfo } from '@/_shared/types';
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
import { Skeleton } from '../../Skeleton';
import ArgumentsTableJSONView from './ArgumentsTableJSONView';
import classes from './OnchainInfo.module.scss';
import Address from '../../Profile/Address/Address';

function OnchainInfo({ proposalType, index, onchainInfo }: { proposalType: EProposalType; index: string; onchainInfo?: IOnChainPostInfo }) {
	const t = useTranslations();
	const network = getCurrentNetwork();
	const fetchPreimage = async () => {
		const { data, error } = await NextApiClientService.getPreimageForPost(proposalType, index);
		if (error) {
			throw new ClientError(error.message || 'Failed to fetch data');
		}
		return data;
	};

	const { data, isFetching } = useQuery({
		queryKey: ['preimage', proposalType, index],
		queryFn: fetchPreimage,
		placeholderData: (previousData) => previousData,
		staleTime: FIVE_MIN_IN_MILLI
	});

	return (
		<div>
			<p className={classes.metadataHeading}>{t('PostDetails.OnchainInfo.metadata')}</p>
			{isFetching ? (
				<Skeleton className='h-4' />
			) : (
				<div className={classes.infoContainer}>
					{onchainInfo?.origin && (
						<div className={classes.infoRow}>
							<p className={classes.infoRowLabel}>{t('PostDetails.OnchainInfo.origin')}</p>
							<p className={classes.infoRowValue}>{onchainInfo?.origin}</p>
						</div>
					)}
					{data?.method && (
						<div className={classes.infoRow}>
							<p className={classes.infoRowLabel}>{t('PostDetails.OnchainInfo.method')}</p>
							<p className={classes.infoRowValue}>{data?.method}</p>
						</div>
					)}
					{data?.hash && (
						<div className={classes.infoRow}>
							<p className={classes.infoRowLabel}>{t('PostDetails.OnchainInfo.proposalHash')}</p>
							<p className={cn(classes.infoRowValue, 'break-words')}>{data?.hash}</p>
						</div>
					)}
					{data?.section && (
						<div className={classes.infoRow}>
							<p className={classes.infoRowLabel}>{t('PostDetails.OnchainInfo.section')}</p>
							<p className={classes.infoRowValue}>{data?.section}</p>
						</div>
					)}
					{data?.proposedCall?.description && (
						<div className={classes.infoRow}>
							<p className={classes.infoRowLabel}>{t('PostDetails.OnchainInfo.description')}</p>
							<p className={classes.infoRowValue}>{data?.proposedCall?.description}</p>
						</div>
					)}
					{data?.proposedCall?.args && (
						<div>
							<ArgumentsTableJSONView postArguments={data?.proposedCall?.args} />
						</div>
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
				</div>
			)}
		</div>
	);
}

export default OnchainInfo;
