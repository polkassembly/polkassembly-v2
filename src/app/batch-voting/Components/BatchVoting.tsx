// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { EConvictionAmount, EVoteDecision, IPostListing } from '@/_shared/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/_shared-components/Tabs';
import { BN, BN_ZERO } from '@polkadot/util';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { useUser } from '@/hooks/useUser';
import Link from 'next/link';
import SetDefaults from './SetDefaults/SetDefaults';
import BatchVote from './Vote/BatchVote';

enum EBatchVotingTab {
	SET_DEFAULTS = 'set-defaults',
	VOTE = 'vote'
}

function BatchVoting({ proposals }: { proposals: IPostListing[] }) {
	const t = useTranslations();
	const [voteDecision, setVoteDecision] = useState<EVoteDecision>(EVoteDecision.AYE);
	const [defaultConviction, setDefaultConviction] = useState<EConvictionAmount>(EConvictionAmount.ZERO);
	const [defaultAyeNayValue, setDefaultAyeNayValue] = useState<BN>(BN_ZERO);
	const [defaultAbstainValue, setDefaultAbstainValue] = useState<BN>(BN_ZERO);
	const [defaultAbstainAyeValue, setDefaultAbstainAyeValue] = useState<BN>(BN_ZERO);
	const [defaultAbstainNayValue, setDefaultAbstainNayValue] = useState<BN>(BN_ZERO);

	const [tab, setTab] = useState<EBatchVotingTab>(EBatchVotingTab.SET_DEFAULTS);

	const { user } = useUser();

	return (
		<div className='flex flex-col gap-y-4'>
			<h1 className='text-2xl font-bold'>{t('BatchVote.batchVoting')}</h1>
			{!user ? (
				<div className='flex items-center justify-center gap-x-1 rounded-2xl bg-bg_modal p-4 text-text_primary'>
					{t('BatchVote.please')}{' '}
					<Link
						href='/login'
						className='text-text_pink'
					>
						{t('BatchVote.login')}
					</Link>{' '}
					{t('BatchVote.toVote')}
				</div>
			) : (
				<Tabs
					defaultValue={EBatchVotingTab.SET_DEFAULTS}
					value={tab}
					onValueChange={(value) => setTab(value as EBatchVotingTab)}
					className='flex flex-col gap-y-8'
				>
					<div className='rounded-2xl bg-bg_modal px-6 pt-2'>
						<TabsList>
							<TabsTrigger value={EBatchVotingTab.SET_DEFAULTS}>{t('BatchVote.setDefaults')}</TabsTrigger>
							<TabsTrigger value={EBatchVotingTab.VOTE}>{t('BatchVote.vote')}</TabsTrigger>
						</TabsList>
					</div>
					<TabsContent
						value={EBatchVotingTab.SET_DEFAULTS}
						className='rounded-2xl bg-bg_modal'
					>
						<SetDefaults
							voteDecision={voteDecision}
							onVoteDecisionChange={setVoteDecision}
							onConvictionChange={setDefaultConviction}
							onDefaultAyeNayValueChange={setDefaultAyeNayValue}
							onDefaultAbstainValueChange={setDefaultAbstainValue}
							onDefaultAbstainAyeValueChange={setDefaultAbstainAyeValue}
							onDefaultAbstainNayValueChange={setDefaultAbstainNayValue}
							onNext={() => setTab(EBatchVotingTab.VOTE)}
						/>
					</TabsContent>
					<TabsContent value={EBatchVotingTab.VOTE}>
						<BatchVote
							proposals={proposals}
							defaultAyeNayValue={defaultAyeNayValue}
							defaultAbstainValue={defaultAbstainValue}
							defaultAbstainAyeValue={defaultAbstainAyeValue}
							defaultAbstainNayValue={defaultAbstainNayValue}
							defaultConviction={defaultConviction}
						/>
					</TabsContent>
				</Tabs>
			)}
		</div>
	);
}

export default BatchVoting;
