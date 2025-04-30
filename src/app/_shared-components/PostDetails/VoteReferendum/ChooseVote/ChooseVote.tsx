// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { Ban, Split, ThumbsDown, ThumbsUp } from 'lucide-react';
import { EVoteDecision } from '@/_shared/types';
import { Tabs, TabsList, TabsTrigger } from '@/app/_shared-components/Tabs';
import { THEME_COLORS } from '@/app/_style/theme';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import classes from './ChooseVote.module.scss';

function ChooseVote({
	voteDecision,
	onVoteDecisionChange,
	removeSplit
}: {
	voteDecision: EVoteDecision;
	onVoteDecisionChange: (voteDecision: EVoteDecision) => void;
	removeSplit?: boolean;
}) {
	const t = useTranslations();
	return (
		<Tabs
			defaultValue={voteDecision}
			onValueChange={(tab) => onVoteDecisionChange(tab as EVoteDecision)}
		>
			<TabsList className='flex gap-x-2 rounded border border-border_grey p-1'>
				<TabsTrigger
					className={cn(classes.tabs, 'py-1.5 data-[state=active]:rounded data-[state=active]:border-none data-[state=active]:bg-success data-[state=active]:text-white')}
					value={EVoteDecision.AYE}
				>
					<ThumbsUp
						fill={voteDecision === EVoteDecision.AYE ? THEME_COLORS.light.btn_primary_text : THEME_COLORS.light.wallet_btn_text}
						className='h-4 w-4'
					/>
					{t('PostDetails.aye')}
				</TabsTrigger>
				<TabsTrigger
					className={cn(classes.tabs, 'py-1.5 data-[state=active]:rounded data-[state=active]:border-none data-[state=active]:bg-failure data-[state=active]:text-white')}
					value={EVoteDecision.NAY}
				>
					<ThumbsDown
						fill={voteDecision === EVoteDecision.NAY ? THEME_COLORS.light.btn_primary_text : THEME_COLORS.light.wallet_btn_text}
						className='h-4 w-4'
					/>
					{t('PostDetails.nay')}
				</TabsTrigger>
				{!removeSplit && (
					<TabsTrigger
						className={cn(classes.tabs, 'py-1.5 data-[state=active]:rounded data-[state=active]:border-none data-[state=active]:bg-yellow_primary data-[state=active]:text-white')}
						value={EVoteDecision.SPLIT}
					>
						<Split className='h-4 w-4' />
						{t('PostDetails.split')}
					</TabsTrigger>
				)}
				<TabsTrigger
					className={cn(
						classes.tabs,
						'py-1.5 data-[state=active]:rounded data-[state=active]:border-none data-[state=active]:bg-decision_bar_indicator data-[state=active]:text-white'
					)}
					value={EVoteDecision.SPLIT_ABSTAIN}
				>
					<Ban className='h-4 w-4' />
					{t('PostDetails.abstain')}
				</TabsTrigger>
			</TabsList>
		</Tabs>
	);
}

export default ChooseVote;
