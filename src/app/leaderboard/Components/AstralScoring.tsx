// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import React from 'react';
import Image from 'next/image';
import { ChevronDown } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@ui/Collapsible';
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
	const sections = [
		{
			title: 'Profile',
			icon: ProfileIcon,
			items: [
				{ name: 'Add Profile Picture', score: '0.5', isOffChain: true },
				{ name: 'Add bio', score: '0.5', isOffChain: true },
				{ name: 'Link Multiple Wallet addresses', score: '0.5', isOffChain: true },
				{ name: 'Add Description', score: '0.5', isOffChain: true },
				{ name: 'Add Tags', score: '0.25', isOffChain: true }
			]
		},
		{
			title: 'Discussions',
			icon: DiscussionsIcon,
			items: [
				{ name: 'Like/Dislike', score: '0.25', isOffChain: true },
				{ name: 'Post a comment or Reply to one', score: '0.25', isOffChain: true },
				{ name: 'Link Discussion to Proposal', score: '0.5', isOffChain: true },
				{ name: 'Create Discussion', score: '1', isOffChain: true },
				{ name: 'Received a like on your discussions', score: '1', isOffChain: true },
				{ name: 'Received a like on your comment/reply', score: '1', isOffChain: true }
			]
		},
		{
			title: 'Referendum',
			icon: ReferendumIcon,
			items: [
				{ name: 'Like/Dislike', score: '0.25', isOffChain: true },
				{ name: 'Post a comment or Reply to one', score: '1', isOffChain: true },
				{ name: 'Vote Successfully Passed', score: '1', isOnChain: true },
				{ name: 'Vote Failed', score: '2', isOnChain: true },
				{ name: 'Create Proposal/Referendum', score: '5', isOnChain: true },
				{ name: 'Link Discussion to Proposal', score: '0.5', isOffChain: true },
				{ name: 'Take Quiz', score: '1', isOnChain: true },
				{ name: 'Answer Quiz Correctly before Vote', score: '1', isOnChain: true },
				{ name: 'Vote on Treasury Proposal', score: '2', isOnChain: true },
				{ name: 'User can place decision deposit on behalf of another proposal', score: '1-5', isOnChain: true },
				{ name: 'Received a like on your comment/reply', score: '1', isOnChain: true }
			]
		},
		{
			title: 'Bounties',
			icon: BountiesIcon,
			items: [
				{ name: 'Create Bounty', score: '5', isOnChain: true },
				{ name: 'Approve Bounty', score: '1', isOnChain: true },
				{ name: 'Create Child Bounty', score: '3', isOnChain: true },
				{ name: 'Claim Bounty', score: '0.5', isOnChain: true }
			]
		},
		{
			title: 'Verify Indentity',
			icon: VerifyIdentityIcon,
			items: [
				{ name: 'Sign up for verification of on chain identity', score: '2', isOnChain: true },
				{ name: 'Request and complete judgement', score: '3', isOnChain: true }
			]
		},
		{
			title: 'Tips',
			icon: TipsIcon,
			items: [
				{ name: 'Create Tip', score: '2', isOnChain: true },
				{ name: 'Give Tip', score: '1', isOnChain: true },
				{ name: 'User tips a new unique user at Polks with > 0.01DOT', score: '1-5', isOnChain: true }
			]
		},
		{
			title: 'Delegation',
			icon: DelegationIcon,
			items: [
				{ name: 'User delegates their vote to another user (first # of # tracks – one time)', score: '5', isOnChain: true },
				{ name: 'Received Delegation: User receives delegation from another user', score: '1', isOnChain: true }
			]
		}
	];

	return (
		<div className='space-y-4 bg-page_background px-4 py-4 sm:px-12 sm:py-12'>
			<div className='rounded-lg bg-bg_modal p-6 shadow-md'>
				<Image
					src={AstralScoringBanner}
					alt='Astral Scoring Banner'
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
												<span className='max-w-80 text-sm text-text_primary'>{item.name}</span>
												{(item.isOffChain || item.isOnChain) && (
													<div className='flex items-center gap-2 rounded-md bg-bg_modal px-2 py-0.5'>
														<Image
															src={item.isOffChain ? OffchainIcon : OnchainIcon}
															alt={item.isOffChain ? 'Off Chain' : 'On Chain'}
															width={14}
															height={14}
														/>
														<p className='whitespace-nowrap text-xs text-wallet_btn_text'>{item.isOffChain ? 'Off-Chain' : 'On-Chain'}</p>
													</div>
												)}
											</div>
											<div className='flex items-center gap-2'>
												<span className='text-sm text-astral_score'>{item.score}</span>
												<Image
													src={rankStar}
													alt='Rank Star'
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
