// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NETWORKS_DETAILS } from '@/_shared/_constants/networks';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { ENetwork, ETrackDelegationStatus, ITrackDelegation } from '@/_shared/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/_shared-components/Table';
import { useUser } from '@/hooks/useUser';
import { RadioGroup, RadioGroupItem } from '@/app/_shared-components/RadioGroup/RadioGroup';
import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import styles from './Delegation.module.scss';
import { Label } from '@/app/_shared-components/Label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/_shared-components/Select/Select';

const FILTER_OPTIONS = [
	{ value: ETrackDelegationStatus.ALL, label: 'All' },
	{ value: ETrackDelegationStatus.DELEGATED, label: 'Delegated' },
	{ value: ETrackDelegationStatus.RECEIVED_DELEGATION, label: 'Received delegation' },
	{ value: ETrackDelegationStatus.UNDELEGATED, label: 'Undelegated' }
] as const;

function MyDelegateTracks() {
	const { user } = useUser();
	const network = getCurrentNetwork();
	const [activeFilter, setActiveFilter] = useState(ETrackDelegationStatus.ALL);

	const { data } = useQuery({
		queryKey: ['address'],
		queryFn: () => fetch(`/api/v2/delegation/userData?address=${user?.defaultAddress}`).then((res) => res.json()),
		enabled: !!user?.defaultAddress
	});

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
			<div className='mb-4 flex flex-row items-center justify-between'>
				<h2 className='mb-4 text-2xl font-semibold text-btn_secondary_text'>Tracks</h2>
				<div className='md:hidden'>
					<Select
						value={activeFilter}
						onValueChange={(value: ETrackDelegationStatus) => {
							setActiveFilter(value as ETrackDelegationStatus);
						}}
					>
						<SelectTrigger className={styles.selectTrigger}>
							<SelectValue placeholder='Select filter' />
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
						defaultValue={ETrackDelegationStatus.ALL}
						value={activeFilter}
						name='track-filter'
						className='flex flex-row items-center gap-4'
						onValueChange={(value: ETrackDelegationStatus) => {
							setActiveFilter(value);
						}}
					>
						{FILTER_OPTIONS.map((option) => (
							<div
								key={option.value}
								className={`flex items-center rounded-full px-4 py-2 ${activeFilter === option.value ? 'bg-sidebar_menu_active' : ''}`}
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
					</RadioGroup>
				</div>
			</div>
			<hr className='my-4 border-border_grey' />
			{filteredTracks.length > 0 ? (
				<Table>
					<TableHeader>
						<TableRow className={styles.tableRow}>
							<TableHead className={styles.tableCell_1}>#</TableHead>
							<TableHead className={styles.tableCell_2}>Tracks</TableHead>
							<TableHead className={styles.tableCell}>Description</TableHead>
							<TableHead className={styles.tableCell}>Active proposals</TableHead>
							<TableHead className={styles.tableCell_last}>Status</TableHead>
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
									<TableCell className={styles.tableCell_3}>{track.status.join(', ')}</TableCell>
								</TableRow>
							);
						})}
					</TableBody>
				</Table>
			) : (
				<div className='flex h-full items-center justify-center'>
					<p className='text-btn_secondary_text'>No tracks found</p>
				</div>
			)}
		</div>
	);
}

export default MyDelegateTracks;
