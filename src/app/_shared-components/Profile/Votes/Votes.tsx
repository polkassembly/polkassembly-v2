// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { useTranslations } from 'next-intl';
import Image from 'next/image';
import VotesIcon from '@assets/activityfeed/vote.svg';
import { NextApiClientService } from '@/app/_client-services/next_api_client_service';
import { useState } from 'react';
import { DEFAULT_LISTING_LIMIT } from '@/_shared/_constants/listingLimit';
import { EGovType } from '@/_shared/types';
import { ClientError } from '@/app/_client-utils/clientError';
import { useQuery } from '@tanstack/react-query';
import { getEncodedAddress } from '@/_shared/_utils/getEncodedAddress';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { ValidatorService } from '@/_shared/_services/validator_service';
import { Separator } from '../../Separator';
import classes from './Votes.module.scss';
import { PaginationWithLinks } from '../../PaginationWithLinks';
import VotesTable from './VotesTable';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../Select/Select';
import Address from '../Address/Address';

function Votes({ addresses }: { addresses: string[] }) {
	const t = useTranslations('Profile');
	const network = getCurrentNetwork();
	const [selectedAddress, setSelectedAddress] = useState<string>(addresses[0]);
	const [page, setPage] = useState<number>(1);
	const [govType, setGovType] = useState<EGovType>(EGovType.OPENGOV);

	const fetchUserVotes = async () => {
		const { data: userVotesData, error: userVotesError } = await NextApiClientService.getUserVotes({
			address: getEncodedAddress(selectedAddress, network) || '',
			page,
			limit: DEFAULT_LISTING_LIMIT,
			govType
		});
		if (userVotesError) {
			throw new ClientError(userVotesError?.message || 'Failed to fetch data');
		}
		return userVotesData;
	};

	const { data: userVotesData, isFetching } = useQuery({
		queryKey: ['userVotes', selectedAddress, page, govType],
		queryFn: fetchUserVotes,
		enabled: !!selectedAddress
	});

	const handleGovTypeChange = (value: string) => {
		setGovType(value as EGovType);
		setPage(1); // Reset to first page when changing filter
	};

	return (
		<div className={classes.votesContainer}>
			<div className={classes.votesHeaderContainer}>
				<div className={classes.votesHeader}>
					<Image
						src={VotesIcon}
						alt='votes'
						width={24}
						height={24}
					/>
					<span className={classes.votesHeaderText}>{t('Votes.votes')}</span>
					{ValidatorService.isValidNumber(userVotesData?.totalCount) && <span className='text-text_secondary text-sm'>({userVotesData?.totalCount})</span>}
				</div>

				<div className={classes.votesHeaderSelectContainer}>
					{addresses.length > 1 && (
						<Select
							value={selectedAddress}
							onValueChange={(value) => {
								setSelectedAddress(value);
							}}
						>
							<SelectTrigger className='w-[180px] text-sm'>
								<SelectValue defaultValue={selectedAddress} />
							</SelectTrigger>
							<SelectContent>
								{addresses.map((address) => (
									<SelectItem
										key={address}
										value={address}
									>
										<Address
											address={address}
											disableTooltip
										/>
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					)}
					<Select
						value={govType}
						onValueChange={handleGovTypeChange}
					>
						<SelectTrigger className='w-[120px] text-sm'>
							<SelectValue defaultValue={govType} />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value={EGovType.OPENGOV}>{t('Votes.openGov')}</SelectItem>
							<SelectItem value={EGovType.GOV_1}>{t('Votes.gov1')}</SelectItem>
						</SelectContent>
					</Select>
				</div>
			</div>
			<Separator className='mb-4' />
			<VotesTable
				isFetching={isFetching}
				votes={userVotesData?.items || []}
			/>
			{userVotesData && userVotesData?.totalCount > DEFAULT_LISTING_LIMIT && (
				<div className='mt-4'>
					<PaginationWithLinks
						page={Number(page)}
						pageSize={DEFAULT_LISTING_LIMIT}
						totalCount={userVotesData?.totalCount || 0}
						pageSearchParam='page'
						onPageChange={(val) => setPage(val)}
					/>
				</div>
			)}
		</div>
	);
}

export default Votes;
