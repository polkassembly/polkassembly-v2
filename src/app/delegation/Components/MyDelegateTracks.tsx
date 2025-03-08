// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NETWORKS_DETAILS } from '@/_shared/_constants/networks';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { ENetwork, ETrackDelegationStatus, ITrackDelegation } from '@/_shared/types';
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
import styles from './Delegation.module.scss';

function MyDelegateTracks() {
	const { user } = useUser();
	const network = getCurrentNetwork();
	const t = useTranslations('Delegation');
	const [activeFilter, setActiveFilter] = useState(ETrackDelegationStatus.ALL);
	const { data, isLoading } = useQuery({
		queryKey: ['address'],
		queryFn: () => fetch(`/api/v2/delegation/userData?address=${user?.defaultAddress}`).then((res) => res.json()),
		enabled: !!user?.defaultAddress
	});

	const FILTER_OPTIONS = [
		{ value: ETrackDelegationStatus.ALL, label: t('all') },
		{ value: ETrackDelegationStatus.DELEGATED, label: t('delegated') },
		{ value: ETrackDelegationStatus.RECEIVED_DELEGATION, label: t('receivedDelegation') },
		{ value: ETrackDelegationStatus.UNDELEGATED, label: t('undelegated') }
	] as const;

	const tabCounts = useMemo(() => {
		if (!data) return { all: 0, delegated: 0, received_delegation: 0, undelegated: 0 };

		return {
			all: data.length,
			delegated: data.filter((track: ITrackDelegation) => track.status.includes(ETrackDelegationStatus.DELEGATED)).length,
			received_delegation: data.filter((track: ITrackDelegation) => track.status.includes(ETrackDelegationStatus.RECEIVED_DELEGATION)).length,
			undelegated: data.filter((track: ITrackDelegation) => track.status.includes(ETrackDelegationStatus.UNDELEGATED)).length
		};
	}, [data]);

	const filteredTracks = useMemo(() => {
		if (!data) return [];

		switch (activeFilter) {
			case ETrackDelegationStatus.DELEGATED:
				return data.filter((track: ITrackDelegation) => track.status.includes(ETrackDelegationStatus.DELEGATED));
			case ETrackDelegationStatus.RECEIVED_DELEGATION:
				return data.filter((track: ITrackDelegation) => track.status.includes(ETrackDelegationStatus.RECEIVED_DELEGATION));
			case ETrackDelegationStatus.UNDELEGATED:
				return data.filter((track: ITrackDelegation) => track.status.includes(ETrackDelegationStatus.UNDELEGATED));
			default:
				return data;
		}
	}, [data, activeFilter]);

	return (
		<div className='mt-6 rounded-lg bg-bg_modal p-6 shadow-lg'>
			<div className='mb-4 flex flex-row items-center justify-between md:gap-20'>
				<h2 className='text-2xl font-semibold text-btn_secondary_text'>{t('tracks')}</h2>

				<div className='mt-4 md:hidden'>
					<Select
						value={activeFilter}
						onValueChange={(value: ETrackDelegationStatus) => {
							setActiveFilter(value as ETrackDelegationStatus);
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

				{/* Desktop Radio Group */}
				<div className='hidden md:block'>
					<RadioGroup
						defaultValue={ETrackDelegationStatus.ALL}
						value={activeFilter}
						name='track-filter'
						className='flex flex-row space-x-2 lg:space-x-4'
						onValueChange={(value: ETrackDelegationStatus) => {
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
			<hr className='my-4 border-border_grey' />
			{isLoading ? (
				<div className='flex h-full items-center justify-center'>
					<LoadingSpinner />
				</div>
			) : filteredTracks.length > 0 ? (
				<Table>
					<TableHeader>
						<TableRow className={styles.tableRow}>
							<TableHead className={styles.tableCell_1}>#</TableHead>
							<TableHead className={styles.tableCell_2}>{t('tracks')}</TableHead>
							<TableHead className={styles.tableCell}>{t('description')}</TableHead>
							<TableHead className={styles.tableCell}>{t('activeProposals')}</TableHead>
							<TableHead className={styles.tableCell_last}>{t('status')}</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{filteredTracks.map((track: ITrackDelegation, index: number) => {
							const trackDetails = Object.values(NETWORKS_DETAILS[network as ENetwork].trackDetails).find((detail) => detail.trackId === track.track);

							return (
								<TableRow key={track.track}>
									<TableCell className={styles.tableCell_3}>{index + 1}</TableCell>
									<TableCell className={styles.tableCell_2}>{trackDetails?.name.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())}</TableCell>
									<TableCell className={styles.tableCell_3}>{trackDetails?.description || '-'}</TableCell>
									<TableCell className={styles.tableCell_3}>{track.active_proposals_count}</TableCell>
									<TableCell className={styles.tableCell_3}>
										{track.status.length > 0 ? (
											<span
												className={cn(
													'rounded-[26px] px-3 py-1.5 text-center text-sm',
													track.status.includes(ETrackDelegationStatus.RECEIVED_DELEGATION) && 'bg-received_delegation_bg',
													track.status.includes(ETrackDelegationStatus.DELEGATED) && 'bg-delegated_delegation_bg',
													track.status.includes(ETrackDelegationStatus.UNDELEGATED) && 'bg-undelegated_delegation_bg'
												)}
											>
												{track.status.map((status) => status.split('_').join(' ').charAt(0).toUpperCase() + status.split('_').join(' ').slice(1)).join(', ')}
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
