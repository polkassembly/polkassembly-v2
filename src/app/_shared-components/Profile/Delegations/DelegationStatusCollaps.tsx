// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ValidatorService } from '@/_shared/_services/validator_service';
import { EDelegationStatus, ENetwork } from '@/_shared/types';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { ChevronDown } from 'lucide-react';
import ReceivedIcon from '@assets/delegation/received.svg';
import { formatBnBalance } from '@/app/_client-utils/formatBnBalance';
import { BN } from '@polkadot/util';
import { NETWORKS_DETAILS } from '@/_shared/_constants/networks';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { cn } from '@/lib/utils';
import DelegatedIcon from '@assets/delegation/delegated.svg';
import DelegateIcon from '@assets/delegation/delegatedTo.svg';
import CapitalIcon from '@assets/delegation/capital.svg';
import VotingPowerIcon from '@assets/delegation/votingPower.svg';
import { useState } from 'react';
import classes from './Delegations.module.scss';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../../Collapsible';
import Address from '../Address/Address';

interface IDelegationItem {
	address: string;
	status: EDelegationStatus;
	trackId: number;
	activeProposalsCount?: number;
	capital: string;
	votingPower: string;
	balance: string;
	createdAt: Date;
	lockPeriod: number;
}
const getTrackName = ({ trackId, network }: { trackId: number; network: ENetwork }) => {
	const trackName = Object.entries(NETWORKS_DETAILS[`${network}`].trackDetails).find(([, details]) => details?.trackId === trackId)?.[1]?.name;
	return trackName?.replace(/_/g, ' ');
};

function DelegationStatusCollaps({
	data,
	status
}: {
	data: { delegations: { [key: string]: IDelegationItem[] }; count: number };
	status: EDelegationStatus.RECEIVED | EDelegationStatus.DELEGATED;
}) {
	const t = useTranslations('Profile');
	const network = getCurrentNetwork();
	const [open, setOpen] = useState(false);
	const TRANSLATION_KEYS = {
		DELEGATED_BY: t('Delegations.delegatedBy'),
		DELEGATED_TO: t('Delegations.delegatedTo'),
		TRACKS: t('Delegations.tracks'),
		MULTIPLE: t('Delegations.multiple'),
		INDEX: t('Delegations.index')
	};
	return (
		<Collapsible
			className={classes.collapsible}
			open={open && !!ValidatorService.isValidNumber(data?.count) && data?.count > 0}
			onOpenChange={setOpen}
		>
			<CollapsibleTrigger className={cn(classes.collapsibleTrigger, open ? 'rounded-t-lg' : 'rounded-lg')}>
				<div className={classes.collapsibleTriggerContent}>
					<span className='flex items-center gap-2 text-xs uppercase'>
						<Image
							src={status === EDelegationStatus.RECEIVED ? ReceivedIcon : DelegatedIcon}
							alt='Received Delegation'
							width={30}
							height={30}
						/>
						<div className='flex flex-col items-start justify-start gap-0.5 font-normal'>
							<p>{status === EDelegationStatus.RECEIVED ? t('Delegations.receivedDelegations') : t('Delegations.delegatedDelegations')}</p>
							{ValidatorService.isValidNumber(data?.count) && <span className='text-text_secondary'>{data?.count}</span>}
						</div>
					</span>
					{!!ValidatorService.isValidNumber(data?.count) && data?.count > 0 && (
						<div className={classes.collapsibleTriggerContentInner}>
							<ChevronDown className='text-sm font-semibold text-text_primary' />
						</div>
					)}
				</div>
			</CollapsibleTrigger>
			{!!ValidatorService.isValidNumber(data?.count) && data?.count > 0 && (
				<CollapsibleContent className={classes.collapsibleContent}>
					<div className='my-4 grid grid-cols-4 gap-2 px-4 text-sm'>
						<div className='col-span-1'>
							<p>{TRANSLATION_KEYS.INDEX}</p>
						</div>
						<div className='col-span-1'>
							<p>{status === EDelegationStatus.RECEIVED ? TRANSLATION_KEYS.DELEGATED_BY : TRANSLATION_KEYS.DELEGATED_TO}</p>
						</div>
						<div className='col-span-1'>
							<p>{TRANSLATION_KEYS.TRACKS}</p>
						</div>
						<div />
					</div>
					<div className='flex flex-col text-sm'>
						{Object.entries(data.delegations || {}).map(([address, delegationItems], index) => {
							const allSameVotingPowerAndLockPeriod = delegationItems.every(
								(item) => item.votingPower === delegationItems[0].votingPower && item.lockPeriod === delegationItems[0].lockPeriod
							);
							return (
								<Collapsible
									key={address}
									className='flex flex-col'
								>
									<CollapsibleTrigger className={classes.innerCollapsibleTrigger}>
										<div className='grid grid-cols-4 justify-start gap-4'>
											<div className='w-full text-left'>#0{index + 1}</div>
											<div>
												<Address
													address={address}
													className='text-sm'
													redirectToProfile
												/>
											</div>
											<div className='w-full text-left'>{delegationItems.length}</div>
											<div className='flex w-full justify-end text-right'>
												<ChevronDown className='text-sm font-semibold text-text_primary' />
											</div>
										</div>
									</CollapsibleTrigger>
									<CollapsibleContent className={cn(classes.innerCollapsibleContent, 'bg-bg_code text-sm')}>
										<div className='flex flex-col gap-y-2 p-3'>
											<div className='flex flex-col gap-y-1'>
												<div className='flex justify-between'>
													<div className='flex gap-1'>
														<Image
															src={DelegateIcon}
															alt={status === EDelegationStatus.RECEIVED ? 'Received Delegation' : 'Delegated Delegation'}
															width={16}
															height={16}
														/>
														<span className='capitalize text-text_primary'>
															{status === EDelegationStatus.RECEIVED ? TRANSLATION_KEYS.DELEGATED_BY : TRANSLATION_KEYS.DELEGATED_TO}
														</span>
													</div>
													<div>
														<Address
															address={address}
															className='text-sm'
															redirectToProfile
														/>
													</div>
												</div>

												<div className='flex justify-between'>
													<div className='flex gap-1'>
														<Image
															src={VotingPowerIcon}
															alt='Received Delegation'
															width={16}
															height={16}
														/>
														<span className='capitalize text-text_primary'>{t('Delegations.votes')}</span>
													</div>
													{allSameVotingPowerAndLockPeriod ? (
														<div>
															{formatBnBalance(new BN(delegationItems?.[0]?.votingPower || '0'), { withThousandDelimitor: false, withUnit: true, numberAfterComma: 1 }, network)}
														</div>
													) : (
														<div>{TRANSLATION_KEYS.MULTIPLE}</div>
													)}
												</div>

												<div className='flex justify-between'>
													<div className='flex gap-1'>
														<Image
															src={CapitalIcon}
															alt='Received Delegation'
															width={16}
															height={16}
														/>
														<span className='capitalize text-text_primary'>{t('Delegations.capital')}</span>
													</div>
													{allSameVotingPowerAndLockPeriod ? (
														<div>{formatBnBalance(delegationItems?.[0]?.capital || '0', { withThousandDelimitor: false, withUnit: true, numberAfterComma: 1 }, network)}</div>
													) : (
														<div>{TRANSLATION_KEYS.MULTIPLE}</div>
													)}
												</div>
												<div className='flex justify-between'>
													<div className='mr-6 flex flex-nowrap gap-1 max-md:mr-2'>
														<span>{TRANSLATION_KEYS.TRACKS}</span>
														<span className='text-text_secondary'>({delegationItems?.length})</span>
													</div>
													<div className={cn('flex items-end justify-end gap-y-1 text-right', !allSameVotingPowerAndLockPeriod ? 'flex-col' : 'flex-wrap gap-x-1')}>
														{delegationItems?.map((item, i) => {
															const trackName = getTrackName({ trackId: item.trackId, network });
															return (
																<div
																	className='flex flex-wrap gap-1 text-xs'
																	key={item.trackId}
																>
																	<span className='capitalize'>{trackName}</span>
																	{i !== delegationItems.length - 1 && <span>,</span>}
																	{!allSameVotingPowerAndLockPeriod ? (
																		<span className='flex'>
																			(
																			<div className='flex items-center gap-1'>
																				<div className='flex gap-1'>
																					<span>{t('Delegations.VP')}:</span>
																					<span>
																						{formatBnBalance(new BN(item.votingPower || '0'), { withThousandDelimitor: false, withUnit: true, numberAfterComma: 1 }, network)}
																					</span>
																				</div>
																				<div className='flex gap-1'>
																					<span>{t('Delegations.CA')}:</span>
																					<span>
																						{formatBnBalance(new BN(item.capital || '0'), { withThousandDelimitor: false, withUnit: true, numberAfterComma: 1 }, network)}
																					</span>
																				</div>
																				<div className='flex gap-1'>
																					<span>{t('Delegations.CO')}:</span>
																					<span>{item.lockPeriod ? item.lockPeriod : '0.1'}x</span>
																				</div>
																			</div>
																			)
																		</span>
																	) : (
																		''
																	)}
																</div>
															);
														})}
													</div>
												</div>
											</div>
										</div>
									</CollapsibleContent>
								</Collapsible>
							);
						})}
					</div>
				</CollapsibleContent>
			)}
		</Collapsible>
	);
}

export default DelegationStatusCollaps;
