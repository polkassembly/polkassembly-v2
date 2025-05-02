// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NETWORKS_DETAILS } from '@/_shared/_constants/networks';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { EDelegationStatus, ITrackDelegationStats, ENetwork } from '@/_shared/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/_shared-components/Table';
import { useUser } from '@/hooks/useUser';
import { cn } from '@/lib/utils';
import { RadioGroup, RadioGroupItem } from '@/app/_shared-components/RadioGroup/RadioGroup';
import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { LoadingSpinner } from '@/app/_shared-components/LoadingSpinner';
import { useTranslations } from 'next-intl';
import { Label } from '@/app/_shared-components/Label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/_shared-components/Select/Select';
import { NextApiClientService } from '@/app/_client-services/next_api_client_service';
import { useRouter } from 'nextjs-toploader/app';
import { useAtom } from 'jotai';
import { delegateUserTracksAtom } from '@/app/_atoms/delegation/delegationAtom';
import { Separator } from '@/app/_shared-components/Separator';
import { convertCamelCaseToTitleCase } from '@/_shared/_utils/convertCamelCaseToTitleCase';
import styles from '../Delegation.module.scss';

function MyDelegateTracks() {
	const { user } = useUser();
	const network = getCurrentNetwork();
	const t = useTranslations('Delegation');
	const router = useRouter();
	const [delegateUserTracks, setDelegateUserTracks] = useAtom(delegateUserTracksAtom);
	const [activeFilter, setActiveFilter] = useState<EDelegationStatus>(EDelegationStatus.ALL);

	const fetchDelegationStats = async () => {
		if (!user?.defaultAddress) return { delegationStats: [] };
		const response = await NextApiClientService.getDelegateTracks({ address: user.defaultAddress });
		if (!response.data) return { delegationStats: [] };
		setDelegateUserTracks(response.data.delegationStats);
		return response.data;
	};

	const { isLoading } = useQuery<{ delegationStats: ITrackDelegationStats[] }, Error>({
		queryKey: ['address', user?.defaultAddress],
		queryFn: fetchDelegationStats,
		enabled: !!user?.defaultAddress
	});

	const FILTER_OPTIONS = [
		{ value: EDelegationStatus.ALL, label: t('all') },
		{ value: EDelegationStatus.DELEGATED, label: t('delegated') },
		{ value: EDelegationStatus.RECEIVED, label: t('receivedDelegation') },
		{ value: EDelegationStatus.UNDELEGATED, label: t('undelegated') }
	] as const;

	const tabCounts = useMemo(() => {
		if (!delegateUserTracks) return { all: 0, delegated: 0, undelegated: 0 };

		const tracks = delegateUserTracks;
		return {
			all: tracks.length,
			delegated: tracks.filter((track: ITrackDelegationStats) => track.status === EDelegationStatus.DELEGATED).length,
			undelegated: tracks.filter((track: ITrackDelegationStats) => track.status === EDelegationStatus.UNDELEGATED).length,
			received: tracks.filter((track: ITrackDelegationStats) => track.status === EDelegationStatus.RECEIVED).length
		};
	}, [delegateUserTracks]);

	const filteredTracks = useMemo(() => {
		if (!delegateUserTracks) return [];
		switch (activeFilter) {
			case EDelegationStatus.DELEGATED:
				return delegateUserTracks.filter((track: ITrackDelegationStats) => track.status === EDelegationStatus.DELEGATED);
			case EDelegationStatus.RECEIVED:
				return delegateUserTracks.filter((track: ITrackDelegationStats) => track.status === EDelegationStatus.RECEIVED);
			case EDelegationStatus.UNDELEGATED:
				return delegateUserTracks.filter((track: ITrackDelegationStats) => track.status === EDelegationStatus.UNDELEGATED);
			default:
				return delegateUserTracks;
		}
	}, [delegateUserTracks, activeFilter]);

	return (
		<div className='mt-6 rounded-lg bg-bg_modal p-6 shadow-lg'>
			<div className='mb-4 flex flex-row items-center justify-between md:gap-20'>
				<h2 className='text-2xl font-semibold text-btn_secondary_text'>{t('tracks')}</h2>

				<div className='mt-4 md:hidden'>
					<Select
						value={activeFilter}
						onValueChange={(value: EDelegationStatus | 'all') => {
							setActiveFilter(value as EDelegationStatus);
						}}
					>
						<SelectTrigger className={styles.selectTrigger}>
							<SelectValue placeholder={t('selectFilter')} />
						</SelectTrigger>
						<SelectContent className={styles.selectContent}>
							{FILTER_OPTIONS.map((option) => (
								<SelectItem
									key={option.value}
									value={option.value}
								>
									{option.label} ({tabCounts[option.value.toLowerCase() as keyof typeof tabCounts]})
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				<div className='hidden md:block'>
					<RadioGroup
						defaultValue={EDelegationStatus.ALL}
						value={activeFilter}
						name='track-filter'
						className='flex flex-row space-x-2 lg:space-x-4'
						onValueChange={(value: EDelegationStatus) => {
							setActiveFilter(value);
						}}
					>
						<div className='flex flex-row flex-wrap items-end space-x-4'>
							{FILTER_OPTIONS.map((option) => (
								<div
									key={option.value}
									className={`flex items-center rounded-full px-4 py-2 transition-all duration-200 ${activeFilter === option.value ? 'bg-sidebar_menu_active' : ''}`}
								>
									<RadioGroupItem
										value={option.value}
										id={option.value}
										className={styles.radioButton}
									/>
									<Label
										htmlFor={option.value}
										className='ml-2 cursor-pointer whitespace-nowrap text-sm text-btn_secondary_text'
									>
										{option.label} ({tabCounts[option.value.toLowerCase() as keyof typeof tabCounts]})
									</Label>
								</div>
							))}
						</div>
					</RadioGroup>
				</div>
			</div>
			<Separator className='my-4' />
			{isLoading ? (
				<div className='flex h-full items-center justify-center'>
					<LoadingSpinner />
				</div>
			) : filteredTracks && filteredTracks.length > 0 ? (
				<Table>
					<TableHeader>
						<TableRow className={styles.tableRow}>
							<TableHead className='px-6 py-4 first:rounded-tl-lg last:rounded-tr-lg'>#</TableHead>
							<TableHead className={styles.tableCell_2}>{t('tracks')}</TableHead>
							<TableHead className={styles.tableCell}>{t('description')}</TableHead>
							<TableHead className={styles.tableCell}>{t('activeProposals')}</TableHead>
							<TableHead className={styles.tableCell_last}>{t('status')}</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{filteredTracks &&
							filteredTracks.map((track: ITrackDelegationStats, index: number) => {
								const trackDetails = Object.values(NETWORKS_DETAILS[network as ENetwork].trackDetails).find((detail) => detail.trackId === track.trackId);

								return (
									<TableRow
										onClick={() => {
											router.push(`/delegation/${trackDetails?.name.replace(/_/g, '-')}`);
										}}
										key={track.trackId}
										className='cursor-pointer'
									>
										<TableCell className='p-6'>{index + 1}</TableCell>
										<TableCell className={styles.tableCell_2}>{trackDetails?.name ? convertCamelCaseToTitleCase(trackDetails.name) : '-'}</TableCell>
										<TableCell className={styles.tableCell_3}>{trackDetails?.description || '-'}</TableCell>
										<TableCell className={styles.tableCell_3}>{track.activeProposalsCount}</TableCell>
										<TableCell className={styles.tableCell_3}>
											{track.status ? (
												<span
													className={cn(
														'rounded-[26px] px-3 py-1.5 text-center text-sm text-btn_secondary_text',
														track.status === EDelegationStatus.RECEIVED && 'bg-received_delegation_bg',
														track.status === EDelegationStatus.DELEGATED && 'bg-delegated_delegation_bg',
														track.status === EDelegationStatus.UNDELEGATED && 'bg-undelegated_delegation_bg'
													)}
												>
													{track.status ? track.status.charAt(0).toUpperCase() + track.status.slice(1) : '-'}
												</span>
											) : (
												<span className='px-3 py-1.5 text-center text-sm'>-</span>
											)}
										</TableCell>
									</TableRow>
								);
							})}
					</TableBody>
				</Table>
			) : (
				<div className='flex h-full items-center justify-center'>
					<p className='text-btn_secondary_text'>{t('noTracksFound')}</p>
				</div>
			)}
		</div>
	);
}

export default MyDelegateTracks;
