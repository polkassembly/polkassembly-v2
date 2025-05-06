// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { EPostOrigin } from '@/_shared/types';
import { NextApiClientService } from '@/app/_client-services/next_api_client_service';
import { Separator } from '@/app/_shared-components/Separator';
import { useQuery } from '@tanstack/react-query';
import Image from 'next/image';
import { ChevronDown } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/app/_shared-components/Collapsible';
import DelegationGreenIcon from '@assets/icons/delegate-green-icon.svg';
import { formatBnBalance } from '@/app/_client-utils/formatBnBalance';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { Fragment, useState } from 'react';
import { NETWORKS_DETAILS } from '@/_shared/_constants/networks';
import { Skeleton } from '@/app/_shared-components/Skeleton';
import { RadioGroup, RadioGroupItem } from '@/app/_shared-components/RadioGroup/RadioGroup';
import { Label } from '@/app/_shared-components/Label';
import { useTranslations } from 'next-intl';
import Delegatees from './DelegateeTab/Delegatees';
import Delegators from './DelegatorsTab/Delegators';

enum ETab {
	Delegatee = 'Delegatee',
	Delegator = 'Delegator'
}

function TrackDelegations({ origin }: { origin?: EPostOrigin }) {
	const t = useTranslations('TrackAnalytics');
	const network = getCurrentNetwork();

	const [selectedTab, setSelectedTab] = useState<ETab>(ETab.Delegatee);

	const fetchDelegations = async () => {
		const { data, error } = await NextApiClientService.getTrackAnalyticsDelegations({ origin: origin || 'all' });
		if (error || !data) {
			console.error(error?.message || 'Failed to fetch data');
			return null;
		}

		return data;
	};

	const { data, isFetching } = useQuery({
		queryKey: ['track-analytics-delegations', origin],
		queryFn: fetchDelegations,
		retry: false,
		refetchOnMount: false,
		refetchOnWindowFocus: false
	});

	const stats = [
		{ title: t('delegatee'), value: data?.totalDelegates },
		{ title: t('delegator'), value: data?.totalDelegators },
		{
			title: t('totalCapital'),
			value: data?.totalCapital && formatBnBalance(data?.totalCapital, { compactNotation: true, numberAfterComma: 1 }, network),
			tokenSymbol: NETWORKS_DETAILS[`${network}`]?.tokenSymbol
		},
		{
			title: t('totalVotes'),
			value: data?.totalVotesBalance && formatBnBalance(data?.totalVotesBalance, { compactNotation: true, numberAfterComma: 1 }, network),
			tokenSymbol: NETWORKS_DETAILS[`${network}`]?.tokenSymbol
		}
	];

	return (
		<Collapsible
			defaultOpen
			className='rounded-lg border border-border_grey'
		>
			<CollapsibleTrigger className='flex w-full items-center gap-x-4 p-4'>
				<Image
					src={DelegationGreenIcon}
					alt='Delegation Green Icon'
					width={24}
					height={24}
					className='h-6 w-6'
				/>
				<p className='text-base font-semibold text-text_primary'>{t('delegation')}</p>
				<div className='flex-1' />
				<ChevronDown className='text-lg font-semibold text-text_primary' />
			</CollapsibleTrigger>
			<CollapsibleContent>
				<Separator className='my-0' />
				<div className='flex flex-col gap-y-4 p-4'>
					<div className='grid grid-cols-2 gap-2 sm:flex sm:justify-between sm:px-4'>
						{stats.map((stat, index) => (
							<Fragment key={stat.title}>
								<div className='flex flex-col items-center rounded-xl bg-border_grey pb-1 pt-2 sm:bg-transparent'>
									<div className='text-xs text-wallet_btn_text'>{stat.title}</div>
									{isFetching ? (
										<Skeleton className='h-5 w-32' />
									) : (
										<div className='text-center text-xl font-semibold text-text_primary sm:text-2xl'>
											{stat.value}
											{stat.tokenSymbol && <span className='ml-1 text-base font-semibold text-wallet_btn_text sm:text-lg'>{stat.tokenSymbol}</span>}
										</div>
									)}
								</div>
								{index < stats.length - 1 && (
									<Separator
										className='h-[60px] max-sm:hidden'
										orientation='vertical'
									/>
								)}
							</Fragment>
						))}
					</div>
					<Separator className='border-dashed' />
					<RadioGroup
						value={selectedTab}
						onValueChange={(value) => setSelectedTab(value as ETab)}
						className='flex items-center gap-x-4'
					>
						<div className='flex items-center gap-x-2'>
							<RadioGroupItem
								id={ETab.Delegatee}
								value={ETab.Delegatee}
							/>
							<Label
								htmlFor={ETab.Delegatee}
								className='cursor-pointer'
							>
								{t('delegatee')}
							</Label>
						</div>
						<div className='flex items-center gap-x-2'>
							<RadioGroupItem
								id={ETab.Delegator}
								value={ETab.Delegator}
							/>
							<Label
								htmlFor={ETab.Delegator}
								className='cursor-pointer'
							>
								{t('delegator')}
							</Label>
						</div>
					</RadioGroup>
					{isFetching ? (
						<div className='flex flex-col gap-y-4'>
							<Skeleton className='h-8 w-full' />
							<Skeleton className='h-8 w-full' />
							<Skeleton className='h-8 w-full' />
						</div>
					) : selectedTab === ETab.Delegatee ? (
						data?.delegateesData ? (
							<Delegatees delegateesData={data.delegateesData} />
						) : (
							<div className='flex flex-col gap-y-2'>
								<p className='text-text_secondary text-lg'>{t('noDelegateesFound')}</p>
							</div>
						)
					) : data?.delegatorsData ? (
						<Delegators delegatorsData={data.delegatorsData} />
					) : (
						<div className='flex flex-col gap-y-2'>
							<p className='text-text_secondary text-lg'>{t('noDelegatorsFound')}</p>
						</div>
					)}
				</div>
			</CollapsibleContent>
		</Collapsible>
	);
}

export default TrackDelegations;
