// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import React from 'react';
import Image from 'next/image';
import { ChevronDown } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@ui/Collapsible';
import { useTranslations } from 'next-intl';
import AstralScoringBanner from '@assets/leaderboard/astralscoring.svg';
import BountiesIcon from '@assets/leaderboard/Bounties.svg';
import DelegationIcon from '@assets/leaderboard/Delegation.svg';
import TipsIcon from '@assets/leaderboard/tips.svg';
import VerifyIdentityIcon from '@assets/leaderboard/VerifyIdentity.svg';
import ProfileIcon from '@assets/leaderboard/user.svg';
import DiscussionsIcon from '@assets/leaderboard/discussions.svg';
import ReferendumIcon from '@assets/leaderboard/referendum.svg';
import OnchainIcon from '@assets/leaderboard/OnChain.svg';
import OffchainIcon from '@assets/leaderboard/OffChain.svg';
import rankStar from '@assets/leaderboard/star.svg';

function AstralScoring() {
	const t = useTranslations();

	const sections = [
		{
			title: t('AstralScoring.Profile'),
			icon: ProfileIcon,
			items: [
				{ name: t('AstralScoring.items.Profile.addProfilePicture'), score: '0.5', isOffChain: true },
				{ name: t('AstralScoring.items.Profile.addBio'), score: '0.5', isOffChain: true },
				{ name: t('AstralScoring.items.Profile.linkMultipleWalletAddresses'), score: '0.5', isOffChain: true },
				{ name: t('AstralScoring.items.Profile.addDescription'), score: '0.5', isOffChain: true },
				{ name: t('AstralScoring.items.Profile.addTags'), score: '0.25', isOffChain: true }
			]
		},
		{
			title: t('AstralScoring.Discussions'),
			icon: DiscussionsIcon,
			items: [
				{ name: t('AstralScoring.items.Discussions.likeDislike'), score: '0.25', isOffChain: true },
				{ name: t('AstralScoring.items.Discussions.postCommentOrReply'), score: '0.25', isOffChain: true },
				{ name: t('AstralScoring.items.Discussions.linkDiscussionToProposal'), score: '0.5', isOffChain: true },
				{ name: t('AstralScoring.items.Discussions.createDiscussion'), score: '1', isOffChain: true },
				{ name: t('AstralScoring.items.Discussions.receivedLikeOnDiscussions'), score: '1', isOffChain: true },
				{ name: t('AstralScoring.items.Discussions.receivedLikeOnCommentOrReply'), score: '1', isOffChain: true }
			]
		},
		{
			title: t('AstralScoring.Referendum'),
			icon: ReferendumIcon,
			items: [
				{ name: t('AstralScoring.items.Referendum.likeDislike'), score: '0.25', isOffChain: true },
				{ name: t('AstralScoring.items.Referendum.postCommentOrReply'), score: '1', isOffChain: true },
				{ name: t('AstralScoring.items.Referendum.voteSuccessfullyPassed'), score: '1', isOnChain: true },
				{ name: t('AstralScoring.items.Referendum.voteFailed'), score: '2', isOnChain: true },
				{ name: t('AstralScoring.items.Referendum.createProposalReferendum'), score: '5', isOnChain: true },
				{ name: t('AstralScoring.items.Referendum.linkDiscussionToProposal'), score: '0.5', isOffChain: true },
				{ name: t('AstralScoring.items.Referendum.takeQuiz'), score: '1', isOnChain: true },
				{ name: t('AstralScoring.items.Referendum.answerQuizCorrectly'), score: '1', isOnChain: true },
				{ name: t('AstralScoring.items.Referendum.voteOnTreasuryProposal'), score: '2', isOnChain: true },
				{ name: t('AstralScoring.items.Referendum.placeDecisionDepositOnBehalf'), score: '1-5', isOnChain: true },
				{ name: t('AstralScoring.items.Referendum.receivedLikeOnCommentOrReply'), score: '1', isOnChain: true }
			]
		},
		{
			title: t('AstralScoring.Bounties'),
			icon: BountiesIcon,
			items: [
				{ name: t('AstralScoring.items.Bounties.createBounty'), score: '5', isOnChain: true },
				{ name: t('AstralScoring.items.Bounties.approveBounty'), score: '1', isOnChain: true },
				{ name: t('AstralScoring.items.Bounties.createChildBounty'), score: '3', isOnChain: true },
				{ name: t('AstralScoring.items.Bounties.claimBounty'), score: '0.5', isOnChain: true }
			]
		},
		{
			title: t('AstralScoring.VerifyIdentity'),
			icon: VerifyIdentityIcon,
			items: [
				{ name: t('AstralScoring.items.VerifyIdentity.signUpForVerification'), score: '2', isOnChain: true },
				{ name: t('AstralScoring.items.VerifyIdentity.requestAndCompleteJudgement'), score: '3', isOnChain: true }
			]
		},
		{
			title: t('AstralScoring.Tips'),
			icon: TipsIcon,
			items: [
				{ name: t('AstralScoring.items.Tips.createTip'), score: '2', isOnChain: true },
				{ name: t('AstralScoring.items.Tips.giveTip'), score: '1', isOnChain: true },
				{ name: t('AstralScoring.items.Tips.tipNewUniqueUser'), score: '1-5', isOnChain: true }
			]
		},
		{
			title: t('AstralScoring.Delegation'),
			icon: DelegationIcon,
			items: [
				{ name: t('AstralScoring.items.Delegation.userDelegatesVote'), score: '5', isOnChain: true },
				{ name: t('AstralScoring.items.Delegation.receivedDelegation'), score: '1', isOnChain: true }
			]
		}
	];

	return (
		<div className='space-y-4 bg-page_background px-4 py-4 sm:px-12 sm:py-12'>
			<div className='rounded-lg bg-bg_modal p-6 shadow-md'>
				<Image
					src={AstralScoringBanner}
					alt={t('AstralScoring.bannerAlt')}
					width={1200}
					height={300}
					className='h-auto w-full'
				/>
				<div className='relative grid auto-rows-auto grid-cols-1 gap-4 pt-6 md:grid-cols-2'>
					{sections.map((section) => (
						<Collapsible
							key={section.title}
							className='group h-fit w-full overflow-hidden rounded-lg border border-primary_border transition-all'
						>
							<CollapsibleTrigger className='flex w-full items-start justify-between p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-900'>
								<div className='flex items-center gap-2'>
									<Image
										src={section.icon}
										alt={section.title}
										width={24}
										height={24}
									/>
									<span className='text-lg font-medium'>{section.title}</span>
								</div>
								<ChevronDown className='h-5 w-5 transition-transform duration-200 data-[state=open]:rotate-180' />
							</CollapsibleTrigger>
							<CollapsibleContent className='animate-collapsible-down data-[state=closed]:animate-collapsible-up'>
								<div className='space-y-3 border-t border-primary_border bg-white/50 p-4 dark:bg-black/50'>
									{section.items.map((item) => (
										<div
											key={`${section.title}-${item.name}`}
											className='flex items-center justify-between rounded-lg bg-astral_card_bg px-3 py-1'
										>
											<div className='flex items-center gap-2'>
												<span className='max-w-80 text-sm text-btn_secondary_text'>{item.name}</span>
												{(item.isOffChain || item.isOnChain) && (
													<div className='flex items-center gap-2 rounded-md bg-bg_modal px-2 py-0.5'>
														<Image
															src={item.isOffChain ? OffchainIcon : OnchainIcon}
															alt={item.isOffChain ? t('AstralScoring.OffChain') : t('AstralScoring.OnChain')}
															width={14}
															height={14}
														/>
														<p className='whitespace-nowrap text-xs text-wallet_btn_text'>{item.isOffChain ? t('AstralScoring.OffChain') : t('AstralScoring.OnChain')}</p>
													</div>
												)}
											</div>
											<div className='flex items-center gap-2'>
												<span className='text-sm text-astral_score'>{item.score}</span>
												<Image
													src={rankStar}
													alt={t('AstralScoring.rankStarAlt')}
													width={14}
													height={14}
												/>
											</div>
										</div>
									))}
								</div>
							</CollapsibleContent>
						</Collapsible>
					))}
				</div>
			</div>
		</div>
	);
}

export default AstralScoring;
