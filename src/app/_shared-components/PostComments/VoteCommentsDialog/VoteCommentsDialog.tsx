// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { formatBnBalance } from '@/app/_client-utils/formatBnBalance';
import React from 'react';
import { Dialog, DialogContent } from '@ui/Dialog/Dialog';
import Identicon from '@polkadot/react-identicon';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { IVoteData } from '@/_shared/types';
import { useTranslations } from 'next-intl';
import { Separator } from '../../Separator';
import Address from '../../Profile/Address/Address';

function VoteCommentsDialog({
	voteInfo,
	showVoteDetails,
	setShowVoteDetails
}: {
	voteInfo: IVoteData;
	showVoteDetails: boolean;
	setShowVoteDetails: (showVoteDetails: boolean) => void;
}) {
	const network = getCurrentNetwork();
	const t = useTranslations();

	const getConvictionText = (lockPeriod: number) => {
		if (lockPeriod === 0) return '0.1x/d';
		return `${lockPeriod}x`;
	};

	const convictionText = t('PostDetails.conviction');
	const votingPowerText = t('PostDetails.votingPower');
	return (
		<div>
			<Dialog
				open={showVoteDetails}
				onOpenChange={setShowVoteDetails}
			>
				<DialogContent className='max-w-2xl p-0'>
					<div className='flex items-center justify-between border-b p-6'>
						<h2 className='text-xl font-semibold text-text_primary'>{t('PostDetails.votes')}</h2>
					</div>

					{voteInfo && (
						<div className='p-0'>
							<div className='border-b'>
								<div className='text-text_secondary grid grid-cols-4 p-4 text-sm font-semibold'>
									<div>{t('PostDetails.vote')}</div>
									<div>{t('PostDetails.amount')}</div>
									<div>{convictionText}</div>
									<div>{votingPowerText}</div>
								</div>

								<div className='grid grid-cols-4 items-center border-b p-4'>
									<div className='flex items-center gap-2'>
										<Address address={voteInfo.voterAddress} />
									</div>
									<div>{formatBnBalance(voteInfo.balanceValue, { withUnit: true, numberAfterComma: 2, compactNotation: true }, network)}</div>
									<div>{getConvictionText(voteInfo.lockPeriod)}</div>
									{voteInfo.totalVotingPower && (
										<div>{formatBnBalance(voteInfo.totalVotingPower?.toString(), { withUnit: true, numberAfterComma: 2, compactNotation: true }, network)}</div>
									)}
								</div>
							</div>

							<div className='p-4'>
								<div className='mb-4 flex items-center gap-2'>
									<span className='text-text_secondary text-sm font-semibold'>
										{new Date(voteInfo.createdAt).toLocaleDateString()} {new Date(voteInfo.createdAt).toLocaleTimeString()}
									</span>
									<span className='text-text_secondary text-sm font-semibold'>{votingPowerText}: &lt;1%</span>
								</div>

								<Separator className='my-4' />

								<div>
									<h3 className='mb-4 text-lg font-semibold text-text_primary'>{t('PostDetails.voteBreakdown')}</h3>

									<div className='grid grid-cols-2 gap-8'>
										<div>
											<h4 className='text-text_secondary mb-2 text-sm font-semibold'>{t('PostDetails.selfVotes')}</h4>
											<div className='text-text_secondary flex items-center gap-2 text-sm'>
												<span>{votingPowerText}</span>
												{voteInfo.selfVotingPower && (
													<span className='ml-auto'>
														{formatBnBalance(voteInfo.selfVotingPower?.toString(), { withUnit: true, numberAfterComma: 2, compactNotation: true }, network)}
													</span>
												)}
											</div>
											<div className='text-text_secondary flex items-center gap-2 text-sm'>
												<span>{convictionText}</span>
												<span className='ml-auto'>{getConvictionText(voteInfo.lockPeriod)}</span>
											</div>
											<div className='text-text_secondary flex items-center gap-2 text-sm'>
												<span>Capital</span>
												{voteInfo.balanceValue && (
													<span className='ml-auto'>
														{formatBnBalance(voteInfo.balanceValue?.toString(), { withUnit: true, numberAfterComma: 2, compactNotation: true }, network)}
													</span>
												)}
											</div>
										</div>

										{voteInfo.delegatedVotes && voteInfo.delegatedVotes.length > 0 && (
											<div>
												<h4 className='text-text_secondary mb-2 text-sm font-semibold'>Delegated Votes</h4>
												<div className='text-text_secondary flex items-center gap-2 text-sm'>
													<span>{votingPowerText}</span>
													{voteInfo.delegatedVotingPower && (
														<span className='ml-auto'>
															{formatBnBalance(voteInfo.delegatedVotingPower?.toString(), { withUnit: true, numberAfterComma: 2, compactNotation: true }, network)}
														</span>
													)}
												</div>
												<div className='text-text_secondary flex items-center gap-2 text-sm'>
													<span>{t('PostDetails.delegators')}</span>
													<span className='ml-auto'>{voteInfo.delegatedVotes.length}</span>
												</div>
												<div className='text-text_secondary flex items-center gap-2 text-sm'>
													<span>{t('PostDetails.capital')}</span>
													{voteInfo.delegatedVotes.reduce((sum, vote) => sum + Number(vote.balanceValue || 0), 0) && (
														<span className='ml-auto'>
															{formatBnBalance(
																voteInfo.delegatedVotes.reduce((sum, vote) => sum + Number(vote.balanceValue || 0), 0).toString(),
																{ withUnit: true, numberAfterComma: 2, compactNotation: true },
																network
															)}
														</span>
													)}
												</div>
											</div>
										)}
									</div>
								</div>

								{voteInfo.delegatedVotes && voteInfo.delegatedVotes.length > 0 && (
									<div className='mt-8'>
										<h3 className='mb-4 text-lg font-semibold text-text_primary'>{t('PostDetails.delegationList')}</h3>
										<div className='text-text_secondary grid grid-cols-4 pb-2 text-sm font-semibold'>
											<div>{t('PostDetails.delegators')}</div>
											<div>{t('PostDetails.amount')}</div>
											<div>{convictionText}</div>
											<div>{votingPowerText}</div>
										</div>

										{voteInfo.delegatedVotes.map((delegatedVote) => (
											<div
												key={delegatedVote.voterAddress}
												className='grid grid-cols-4 items-center py-4'
											>
												<div className='flex items-center gap-2'>
													<Identicon
														size={24}
														value={delegatedVote.voterAddress}
														theme='polkadot'
													/>
													<span className='text-text_primary'>
														{delegatedVote.voterAddress.slice(0, 6)}...{delegatedVote.voterAddress.slice(-4)}
													</span>
												</div>
												{delegatedVote.balanceValue && (
													<div>{formatBnBalance(delegatedVote.balanceValue?.toString(), { withUnit: true, numberAfterComma: 2, compactNotation: true }, network)}</div>
												)}
												<div>{getConvictionText(delegatedVote.lockPeriod)}</div>
												{delegatedVote.totalVotingPower && (
													<div>{formatBnBalance(delegatedVote.totalVotingPower?.toString(), { withUnit: true, numberAfterComma: 2, compactNotation: true }, network)}</div>
												)}
											</div>
										))}
									</div>
								)}
							</div>
						</div>
					)}
				</DialogContent>
			</Dialog>
		</div>
	);
}

export default VoteCommentsDialog;
