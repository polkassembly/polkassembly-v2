// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { useTranslations } from 'next-intl';
import { Check, X, Minus, Menu } from 'lucide-react';
import VotingBar from '@/app/_shared-components/ListingComponent/VotingBar/VotingBar';
import { getSpanStyle } from '@/app/_shared-components/TopicTag/TopicTag';
import { convertCamelCaseToTitleCase } from '@/_shared/_utils/convertCamelCaseToTitleCase';
import StatusTag from '@/app/_shared-components/StatusTag/StatusTag';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/app/_shared-components/Tooltip';
import { IDVReferendumInfluence, EInfluenceStatus, ENetwork } from '@/_shared/types';
import { Skeleton } from '@/app/_shared-components/Skeleton';
import { formatBnBalance } from '@/app/_client-utils/formatBnBalance';
import { formatUSDWithUnits } from '@/app/_client-utils/formatUSDWithUnits';
import Link from 'next/link';
import { BsFillQuestionCircleFill } from '@react-icons/all-files/bs/BsFillQuestionCircleFill';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/_shared-components/Table';

interface InfluenceTableProps {
	data: IDVReferendumInfluence[];
	network: ENetwork;
	loading?: boolean;
	onReferendumClick: (item: IDVReferendumInfluence) => void;
}

function InfluenceTable({ data, network, loading, onReferendumClick }: InfluenceTableProps) {
	const t = useTranslations('DecentralizedVoices');

	return (
		<Table className='table-auto'>
			<TableHeader>
				<TableRow className='border-b border-t border-border_grey bg-bounty_table_bg pt-3 text-left text-xs font-semibold uppercase text-text_primary'>
					<TableHead className='whitespace-nowrap py-4 pl-4 font-semibold'>{t('Referendum')}</TableHead>
					<TableHead className='whitespace-nowrap py-4 font-semibold'>{t('Track')}</TableHead>
					<TableHead className='whitespace-nowrap py-4 font-semibold'>{t('Status')}</TableHead>
					<TableHead className='whitespace-nowrap py-4 font-semibold'>{t('VotingPower')}</TableHead>
					<TableHead className='whitespace-nowrap py-4 font-semibold'>
						<span className='inline-flex items-center gap-1 whitespace-nowrap'>
							{t('Influence')}
							<Tooltip>
								<TooltipTrigger asChild>
									<BsFillQuestionCircleFill className='text-base text-btn_secondary_border' />
								</TooltipTrigger>
								<TooltipContent className='bg-tooltip_background p-2 text-btn_primary_text'>
									<p>{t('InfluenceTooltip')}</p>
								</TooltipContent>
							</Tooltip>
						</span>
					</TableHead>
					<TableHead className='whitespace-nowrap py-4 pr-4 font-semibold' />
				</TableRow>
			</TableHeader>
			<TableBody>
				{loading
					? [1, 2, 3, 4, 5].map((i) => (
							<TableRow
								key={i}
								className='border-b border-border_grey'
							>
								<TableCell className='py-4 pl-4'>
									<Skeleton className='h-5 w-48' />
								</TableCell>
								<TableCell className='py-4'>
									<Skeleton className='h-5 w-24' />
								</TableCell>
								<TableCell className='py-4'>
									<Skeleton className='h-5 w-20' />
								</TableCell>
								<TableCell className='py-4'>
									<Skeleton className='h-5 w-32' />
								</TableCell>
								<TableCell className='py-4'>
									<Skeleton className='h-5 w-20' />
								</TableCell>
								<TableCell className='py-4 pr-4'>
									<Skeleton className='h-5 w-6' />
								</TableCell>
							</TableRow>
						))
					: data.map((item) => (
							<TableRow
								key={item.index}
								className='border-b border-border_grey text-sm font-semibold hover:border-border_grey/90'
							>
								<TableCell className='max-w-[250px] overflow-hidden text-ellipsis whitespace-nowrap py-4 pl-4 font-medium text-text_primary'>
									<Link href={`/referenda/${item.index}`}>
										#{item?.index} {item?.title}
									</Link>
								</TableCell>

								<TableCell className='whitespace-nowrap py-4'>
									<span className={`${getSpanStyle(item.track || '', 1)} whitespace-nowrap rounded-md px-1.5 py-1 text-xs`}>{convertCamelCaseToTitleCase(item.track || '')}</span>
								</TableCell>
								<TableCell className='whitespace-nowrap py-4'>
									<div className='flex'>
										<StatusTag status={item.status} />
									</div>
								</TableCell>
								<TableCell className='min-w-[120px] py-4'>
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
													{formatUSDWithUnits(formatBnBalance(item.totalAyeVotingPower || '0', { numberAfterComma: 2, withThousandDelimitor: false, withUnit: true }, network))} (
													{item.ayePercent.toFixed(2)}%)
												</p>
												<p>
													{t('Nay')} ={' '}
													{formatUSDWithUnits(formatBnBalance(item.totalNayVotingPower || '0', { numberAfterComma: 2, withThousandDelimitor: false, withUnit: true }, network))} (
													{item.nayPercent.toFixed(2)}%)
												</p>
											</div>
										</TooltipContent>
									</Tooltip>
								</TableCell>
								<TableCell className='whitespace-nowrap py-4'>
									<Tooltip>
										<TooltipTrigger asChild>
											<div className='flex items-center gap-2'>
												<div
													className={`flex h-5 w-5 items-center justify-center rounded-sm ${
														item.influence === EInfluenceStatus.NOT_APPLICABLE
															? 'bg-dv_influence_not_bg_color text-dv_influence_not_text_color'
															: item.influence === EInfluenceStatus.NO_INFLUENCE
																? 'bg-dv_influence_no_bg_color text-dv_influence_no_text_color'
																: 'bg-dv_influence_yes_bg_color text-dv_influence_yes_text_color'
													}`}
												>
													{item.influence === EInfluenceStatus.NOT_APPLICABLE ? (
														<Minus size={12} />
													) : item.influence === EInfluenceStatus.NO_INFLUENCE ? (
														<X size={12} />
													) : (
														<Check size={12} />
													)}
												</div>
											</div>
										</TooltipTrigger>
										<TooltipContent
											side='top'
											align='center'
											className='bg-tooltip_background text-btn_primary_text'
										>
											{item.influence === EInfluenceStatus.NOT_APPLICABLE
												? t('InfluenceNotApplicable')
												: item.influence === EInfluenceStatus.NO_INFLUENCE
													? t('InfluenceNoChange')
													: item.influence === EInfluenceStatus.CHANGED_TO_PASS
														? t('InfluenceChangedToPass')
														: t('InfluenceChangedToFail')}
										</TooltipContent>
									</Tooltip>
								</TableCell>
								<TableCell className='py-4 pr-4 text-right'>
									<button
										aria-label='Open referendum menu'
										type='button'
										onClick={() => onReferendumClick(item)}
									>
										<Menu className='h-4 w-4 text-wallet_btn_text' />
									</button>
								</TableCell>
							</TableRow>
						))}
			</TableBody>
		</Table>
	);
}

export default InfluenceTable;
