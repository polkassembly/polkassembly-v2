// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Filter, Check, X, Minus, Menu } from 'lucide-react';
import { PaginationWithLinks } from '@/app/_shared-components/PaginationWithLinks';
import VotingBar from '@/app/_shared-components/ListingComponent/VotingBar/VotingBar';
import { getSpanStyle } from '@/app/_shared-components/TopicTag/TopicTag';
import { convertCamelCaseToTitleCase } from '@/_shared/_utils/convertCamelCaseToTitleCase';
import StatusTag from '@/app/_shared-components/StatusTag/StatusTag';
import { Popover, PopoverContent, PopoverTrigger } from '@/app/_shared-components/Popover/Popover';
import { Checkbox } from '@/app/_shared-components/Checkbox';
import { IDVReferendumInfluence, EInfluenceStatus } from '@/_shared/types';
import { Skeleton } from '@/app/_shared-components/Skeleton';
import { formatBnBalance } from '@/app/_client-utils/formatBnBalance';
import { formatUSDWithUnits } from '@/app/_client-utils/formatUSDWithUnits';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/app/_shared-components/Tooltip';
import { MdArrowDropDown } from '@react-icons/all-files/md/MdArrowDropDown';
import { MdSort } from '@react-icons/all-files/md/MdSort';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/app/_shared-components/Collapsible';
import Link from 'next/link';
import Image from 'next/image';
import TimeLineIcon from '@assets/icons/timeline.svg';
import DVVotesDialog from './DVVotesDialog';

interface InfluenceCardProps {
	referendaInfluence: IDVReferendumInfluence[];
	loading?: boolean;
}

type SortOption = 'index' | 'status' | 'influence' | 'votes';
type SortDirection = 'asc' | 'desc';

function InfluenceCard({ referendaInfluence, loading }: InfluenceCardProps) {
	const t = useTranslations('DecentralizedVoices');
	const [isOpen, setIsOpen] = useState(true);
	const [page, setPage] = useState(1);
	const [sortBy, setSortBy] = useState<SortOption>('index');
	const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
	const [selectedTracks, setSelectedTracks] = useState<string[]>([]);
	const [selectedInfluence, setSelectedInfluence] = useState<string[]>([]);
	const [selectedReferendum, setSelectedReferendum] = useState<IDVReferendumInfluence | null>(null);
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const pageSize = 10;
	const network = getCurrentNetwork();

	const availableTracks = useMemo(() => {
		const tracks = [...new Set(referendaInfluence.map((r) => r.track))];
		return tracks.sort();
	}, [referendaInfluence]);

	const filteredAndSortedData = useMemo(() => {
		let data = [...referendaInfluence];

		if (selectedTracks.length > 0) {
			data = data.filter((r) => selectedTracks.includes(r.track));
		}

		if (selectedInfluence.length > 0) {
			data = data.filter((r) => selectedInfluence.includes(r.influence));
		}

		data.sort((a, b) => {
			let comparison = 0;
			switch (sortBy) {
				case 'index':
					comparison = a.index - b.index;
					break;
				case 'status':
					comparison = a.status.localeCompare(b.status);
					break;
				case 'influence':
					comparison = a.influence.localeCompare(b.influence);
					break;
				case 'votes':
					comparison = Number(a.dvTotalVotingPower) - Number(b.dvTotalVotingPower);
					break;
				default:
					comparison = 0;
			}
			return sortDirection === 'asc' ? comparison : -comparison;
		});

		return data;
	}, [referendaInfluence, selectedTracks, selectedInfluence, sortBy, sortDirection]);

	const outcomeChangedCount = filteredAndSortedData.filter((r) => r.influence === EInfluenceStatus.APPROVED || r.influence === EInfluenceStatus.REJECTED).length;

	const totalCount = filteredAndSortedData.length;
	const outcomePercent = totalCount > 0 ? ((outcomeChangedCount / totalCount) * 100).toFixed(2) : '0';

	const paginatedData = filteredAndSortedData.slice((page - 1) * pageSize, page * pageSize);

	const handleSort = (option: SortOption) => {
		if (sortBy === option) {
			setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
		} else {
			setSortBy(option);
			setSortDirection('desc');
		}
		setPage(1);
	};

	const handleTrackToggle = (track: string) => {
		setSelectedTracks((prev) => (prev.includes(track) ? prev.filter((t) => t !== track) : [...prev, track]));
		setPage(1);
	};

	const clearFilters = () => {
		setSelectedTracks([]);
		setSelectedInfluence([]);
		setPage(1);
	};

	return (
		<Collapsible
			open={isOpen}
			onOpenChange={setIsOpen}
		>
			<div className='rounded-xxl my-4 w-full rounded-3xl border border-border_grey bg-bg_modal p-6'>
				<div className='mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center'>
					<div className='flex items-center gap-2'>
						<Image
							src={TimeLineIcon}
							alt='Delegation Green Icon'
							width={24}
							height={24}
							className='h-6 w-6'
						/>{' '}
						<h2 className='text-2xl font-semibold text-navbar_title'>{t('InfluenceByReferenda')}</h2>
						<span className='ml-2 rounded-lg bg-bounty_dash_bg p-2 text-xs font-medium text-wallet_btn_text'>
							{t('OutcomeChanged')} {outcomeChangedCount} ({outcomePercent}%) | {t('Total')} {totalCount}
						</span>
					</div>
					<div className='flex items-center gap-2'>
						<Popover>
							<PopoverTrigger asChild>
								<button
									type='button'
									className={`flex items-center gap-1 rounded-md border p-2 ${selectedTracks.length > 0 ? 'border-text_pink bg-text_pink/10' : 'border-border_grey'}`}
								>
									<Filter className='h-4 w-4 text-wallet_btn_text' />
									{selectedTracks.length > 0 && <span className='ml-1 rounded-full bg-text_pink px-1.5 text-xs text-white'>{selectedTracks.length}</span>}
								</button>
							</PopoverTrigger>
							<PopoverContent className='max-h-64 w-56 overflow-y-auto border-border_grey p-3'>
								<div className='mb-2 flex items-center justify-between'>
									<span className='text-xs font-semibold text-text_primary'>{t('FilterByTrack')}</span>
									<button
										type='button'
										onClick={() => setSelectedTracks([])}
										className='text-xs text-text_pink'
									>
										{t('Clear')}
									</button>
								</div>
								<div className='space-y-2'>
									{availableTracks.map((track) => (
										<div
											key={track}
											className='flex items-center gap-2'
										>
											<Checkbox
												checked={selectedTracks.includes(track)}
												onCheckedChange={() => handleTrackToggle(track)}
											/>
											<span className='text-xs text-text_primary'>{convertCamelCaseToTitleCase(track)}</span>
										</div>
									))}
								</div>
							</PopoverContent>
						</Popover>

						<Popover>
							<PopoverTrigger asChild>
								<button
									type='button'
									className='flex items-center gap-1 rounded-md border border-border_grey p-1.5'
								>
									<MdSort className='text-xl text-wallet_btn_text' />
								</button>
							</PopoverTrigger>
							<PopoverContent className='w-48 border-border_grey p-3'>
								<div className='mb-2 text-xs font-semibold text-text_primary'>{t('SortBy')}</div>
								<div className='space-y-1'>
									{[
										{ value: 'index', label: `${t('Referendum')} #` },
										{ value: 'status', label: t('Status') },
										{ value: 'influence', label: t('Influence') },
										{ value: 'votes', label: t('VotingPower') }
									].map((option) => (
										<button
											key={option.value}
											type='button'
											onClick={() => handleSort(option.value as SortOption)}
											className={`flex w-full items-center justify-between rounded px-2 py-1.5 text-xs ${sortBy === option.value ? 'bg-text_pink/10 text-text_pink' : 'text-text_primary hover:bg-sidebar_footer'}`}
										>
											{option.label}
											{sortBy === option.value && <span className='text-[10px]'>{sortDirection === 'asc' ? '↑' : '↓'}</span>}
										</button>
									))}
								</div>
							</PopoverContent>
						</Popover>

						{(selectedTracks.length > 0 || selectedInfluence.length > 0) && (
							<button
								type='button'
								onClick={clearFilters}
								className='rounded-md border border-toast_error_text px-3 py-2 text-xs text-toast_error_text'
							>
								{t('ClearAll')}
							</button>
						)}
						<CollapsibleTrigger asChild>
							<button
								type='button'
								className='transition-transform duration-200'
								style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
							>
								<MdArrowDropDown className='text-3xl text-wallet_btn_text' />
							</button>
						</CollapsibleTrigger>
					</div>
				</div>
				<CollapsibleContent>
					<div className='overflow-x-auto'>
						<table className='w-full border-collapse'>
							<thead>
								<tr className='border-b border-border_grey'>
									<th className='py-3 pl-4 text-left text-xs font-semibold text-wallet_btn_text'>{t('Referendum')}</th>
									<th className='py-3 text-left text-xs font-semibold text-wallet_btn_text'>{t('Track')}</th>
									<th className='py-3 text-left text-xs font-semibold text-wallet_btn_text'>{t('Status')}</th>
									<th className='py-3 text-left text-xs font-semibold text-wallet_btn_text'>{t('VotingPower')}</th>
									<th className='py-3 text-left text-xs font-semibold text-wallet_btn_text'>{t('Influence')}</th>
									<th className='py-3 pr-4 text-right text-xs font-semibold text-wallet_btn_text' />
								</tr>
							</thead>
							<tbody>
								{loading
									? [1, 2, 3, 4, 5].map((i) => (
											<tr
												key={i}
												className='border-b border-border_grey'
											>
												<td className='py-4 pl-4'>
													<Skeleton className='h-5 w-48' />
												</td>
												<td className='py-4'>
													<Skeleton className='h-5 w-24' />
												</td>
												<td className='py-4'>
													<Skeleton className='h-5 w-20' />
												</td>
												<td className='py-4'>
													<Skeleton className='h-5 w-32' />
												</td>
												<td className='py-4'>
													<Skeleton className='h-5 w-20' />
												</td>
												<td className='py-4'>
													<Skeleton className='h-5 w-6' />
												</td>
											</tr>
										))
									: paginatedData.map((item) => (
											<tr
												key={item.index}
												className='cursor-pointer border-b border-border_grey text-sm font-semibold hover:border-border_grey/90'
											>
												<td className='max-w-[250px] overflow-hidden text-ellipsis whitespace-nowrap py-4 pr-10 font-medium text-text_primary'>
													<Link href={`/referenda/${item.index}`}>
														#{item?.index} {item?.title}
													</Link>
												</td>

												<td className='py-4'>
													<span className={`${getSpanStyle(item.track || '', 1)} rounded-md px-1.5 py-1 text-xs`}>{convertCamelCaseToTitleCase(item.track || '')}</span>
												</td>
												<td className='py-4'>
													<div className='flex'>
														<StatusTag status={item.status} />
													</div>
												</td>
												<td className='py-4'>
													<Tooltip>
														<TooltipTrigger asChild>
															<div>
																<VotingBar
																	ayePercent={item.ayePercent}
																	nayPercent={item.nayPercent}
																/>
															</div>
														</TooltipTrigger>
														<TooltipContent
															side='top'
															align='center'
														>
															<div className='flex flex-col gap-1'>
																<p>
																	{t('Aye')} ={' '}
																	{formatUSDWithUnits(formatBnBalance(item.ayeVotingPower, { numberAfterComma: 2, withThousandDelimitor: false, withUnit: true }, network))} (
																	{item.ayePercent.toFixed(2)}%)
																</p>
																<p>
																	{t('Nay')} ={' '}
																	{formatUSDWithUnits(formatBnBalance(item.nayVotingPower, { numberAfterComma: 2, withThousandDelimitor: false, withUnit: true }, network))} (
																	{item.nayPercent.toFixed(2)}%)
																</p>
															</div>
														</TooltipContent>
													</Tooltip>
												</td>
												<td className='py-4'>
													<div className='flex items-center gap-2'>
														<div
															className={`flex h-5 w-5 items-center justify-center rounded-sm ${
																item.influence === EInfluenceStatus.APPROVED
																	? 'bg-success_vote_bg text-success'
																	: item.influence === EInfluenceStatus.REJECTED
																		? 'bg-toast_error_bg text-toast_error_text'
																		: item.influence === EInfluenceStatus.FAILED
																			? 'bg-toast_error_bg text-toast_error_text'
																			: 'bg-toast_info_bg text-toast_info_text'
															}`}
														>
															{item.influence === EInfluenceStatus.APPROVED ? (
																<Check size={12} />
															) : item.influence === EInfluenceStatus.REJECTED || item.influence === EInfluenceStatus.FAILED ? (
																<X size={12} />
															) : (
																<Minus size={12} />
															)}
														</div>
													</div>
												</td>
												<td className='py-4 pr-4 text-right'>
													<button
														type='button'
														onClick={() => {
															setSelectedReferendum(item);
															setIsDialogOpen(true);
														}}
														className='hover:bg-bg_secondary rounded-full p-1'
													>
														<Menu className='h-4 w-4 text-wallet_btn_text' />
													</button>
												</td>
											</tr>
										))}
							</tbody>
						</table>
					</div>

					{totalCount > pageSize && (
						<div className='mt-6 flex justify-center gap-2'>
							<PaginationWithLinks
								totalCount={totalCount}
								pageSize={pageSize}
								page={page}
								onPageChange={setPage}
							/>
						</div>
					)}
				</CollapsibleContent>
			</div>

			<DVVotesDialog
				open={isDialogOpen}
				onOpenChange={setIsDialogOpen}
				data={selectedReferendum}
			/>
		</Collapsible>
	);
}

export default InfluenceCard;
