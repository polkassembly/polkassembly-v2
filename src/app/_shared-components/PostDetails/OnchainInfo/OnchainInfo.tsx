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
import { Skeleton } from '../../Skeleton';
import ArgumentsTableJSONView from './ArgumentsTableJSONView';
import classes from './OnchainInfo.module.scss';

function OnchainInfo({ proposalType, index, onchainInfo }: { proposalType: EProposalType; index: string; onchainInfo?: IOnChainPostInfo }) {
	const t = useTranslations();
	const fetchPreimage = async () => {
		const { data, error } = await NextApiClientService.getPreimageForPostApi(proposalType, index);
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
					<div className={classes.infoRow}>
						<p className={classes.infoRowLabel}>{t('PostDetails.OnchainInfo.origin')}</p>
						<p className={classes.infoRowValue}>{onchainInfo?.origin}</p>
					</div>
					<div className={classes.infoRow}>
						<p className={classes.infoRowLabel}>{t('PostDetails.OnchainInfo.method')}</p>
						<p className={classes.infoRowValue}>{data?.method}</p>
					</div>
					<div className={classes.infoRow}>
						<p className={classes.infoRowLabel}>{t('PostDetails.OnchainInfo.proposalHash')}</p>
						<p className={cn(classes.infoRowValue, 'break-words')}>{data?.hash}</p>
					</div>
					<div className={classes.infoRow}>
						<p className={classes.infoRowLabel}>{t('PostDetails.OnchainInfo.section')}</p>
						<p className={classes.infoRowValue}>{data?.section}</p>
					</div>
					<div className={classes.infoRow}>
						<p className={classes.infoRowLabel}>{t('PostDetails.OnchainInfo.description')}</p>
						<p className={classes.infoRowValue}>{data?.proposedCall.description}</p>
					</div>
					<div>
						<ArgumentsTableJSONView postArguments={data?.proposedCall.args || {}} />
					</div>
				</div>
			)}
		</div>
	);
}

export default OnchainInfo;
