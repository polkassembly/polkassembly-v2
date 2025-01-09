// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React from 'react';
import { EActivityFeedTab } from '@/_shared/types';
import { NextApiClientService } from '@/app/_client-services/next_api_client_service';
import { useQuery } from '@tanstack/react-query';
import { ADDRESS_LOGIN_TTL } from '@/app/api/_api-constants/timeConstants';
import ActivityFeedPostList from './ActivityFeedPostList';

const subscribedpost = [
	{
		id: '',
		index: 1371,
		title: 'Next-Gen Smart Account Features – powered by Polkadot',
		content:
			'![Alternatives_UX_Security_Slide.png](https://subsquare.infura-ipfs.io/ipfs/Qmb2FpvvAdgJouGNDe1JjYRecXMUquJ6cpCaTkyfMssqEM)\n\n<br>\n\n**Interstellar | 9 Milestones** → [[⟬ BREAKDOWN ⟭]](https://docs.google.com/spreadsheets/d/11sWKYRzh3ioeX_8d_Fg59LXCuOOcPq2WEclHLVKBOWI/edit?usp=sharing)\n\n**Requested Allocation: 606,380 USDC - Distributed per Milestone via Multisig**\n\n**3/5 Multisig -** Alain Brenzikofer (Polkadot Fellowship & Integritee CTO) | Bryan Chen (Polkadot Fellowship & Acala CTO) | Jonathan Dunne (Talisman CTO) | Trang Ha Nguyen (SubWallet Research Lead) | Eliot Leleu (Interstellar Co-Founder)\n\n**AAG Intro** → [[⟬ WATCH ⟭]](https://www.youtube.com/live/eP4fFrdZKyg?si=CViJYFGGvnzZzi-R&t=3483)  \n**Teaser Deck** → [[⟬ VIEW ⟭]](https://docs.google.com/presentation/d/1T6mnKZbgh1N54yQDDbUTXgEN_FbhK2L-yigZyTCLd4Y/present)  \n**Forum Post** → [[⟬ READ ⟭]](https://forum.polkadot.network/t/interstellar-a-new-universal-layer-to-access-web3/6991)  \n**Tech Links** → [[⟬ EXPLORE ⟭]](https://linktr.ee/0xinterstellar)  \n\n**Early Access Partners** include:\n\n- Acala\n- Apillon\n- Braille\n- Hydration\n- SubWallet\n- Xcavate\n- …\n\n<br>\n\n**Short Description:** For multiple years now, other ecosystems and platforms have been at the forefront of newcomer onboarding by allowing for Web2-like onboarding experiences. These concepts are mostly known as “Account Abstraction/Smart Accounts” today and have an [immense potential](https://x.com/ayyyeandy/status/1859945812446364148) for the adoption of Web3 services. Why? Because they make Web3 accessible — fundamentally enabling any non-blockchain-savvy person to participate and access this new world without the need to use seed phrases or know about private keys.\n\n→ Some examples: [Magic](https://magic.link/) | [Web3Auth](https://web3auth.io/) | [Argent](https://www.argent.xyz/)\n\n→ Other Smart Account Stats: [Safe](https://safe.global/dataroom)\n\n<br>\n\nWhile the **Polkadot Cloud** offers:\n\n- Cloud Execution Services\n- Settlement / Finality Services\n- Data Availability Services\n- Object Storage Services\n- Polkadot Rollup Services\n\nand the **Polkadot Hub** provides native features such as:\n\n- Smart Contracts\n- Staking\n- Governance\n- Treasury\n- Stablecoins\n- Token Registry\n\n<br>\n\n**Smart Accounts are nowhere to be found.** But maybe for [a good reason](https://x.com/joenrv/status/1857609397607813171):\n\nToday’s smart accounts represent an immense security risk for any newcomer. Why? Because they rely on centralized architectures, centralized custody companies and centralized authentication services like your email/password provider, your social account, your Google/Apple passkeys, or SMS verifications.\n\n<br>\n\n**Interstellar aims to change that through a deep tech breakthrough and new common good smart account framework powered by Polkadot.**\n\n→ No seed phrases. No emails. No passwords. No passkeys. Mobile-first. Instant onboarding. World-leading security. Decentralized authentications. One-tap backups. Drainer protection. Sybil-resistance. Gas abstraction. Spending limits. And more features that are:\n\n<br>\n\n- **Resilient**\n- **Accessible**\n- **User Friendly**\n- **Non-Custodial**\n- **Decentralized**\n- **Scalable**\n- **Affordable**\n\n<br>\n\n![Costs_Comparison_Slide.png](https://subsquare.infura-ipfs.io/ipfs/QmTuCwjHztE1UDgHs3pSDsXMSoQUg4xDAPGdsZBP9bXbh3)\n\n<br>\n\nWe think that Polkadot’s vision shouldn’t be limited to catching up with centralized smart wallet features, offered by other ecosystems. Instead, we should focus on innovating and providing an improved alternative for Polkadot services and beyond. Unlocking the next generation of smart accounts - powered by Polkadot.',
		createdAt: '2025-01-05T19:38:48.000Z',
		updatedAt: '2025-01-05T20:53:37.819Z',
		tags: [],
		proposalType: 'ReferendumV2',
		network: 'polkadot',
		dataSource: 'subsquare',
		metrics: {
			reactions: {
				like: 0,
				dislike: 0
			},
			comments: 1
		},
		onChainInfo: {
			createdAt: '2025-01-05T19:38:48.000000Z',
			description: '',
			index: 1371,
			origin: 'MediumSpender',
			proposer: '13NQkqy2N8bvdmAQxmVHQYzra996ex892md14VSWa1fwTfKZ',
			status: 'Deciding',
			type: 'ReferendumV2',
			hash: '0xf3edbfec4c3c9a0e3fedb1880b4c4650d10352aee87a247109c6378dc37658cd',
			voteMetrics: {
				nay: {
					count: 7,
					value: '0'
				},
				aye: {
					count: 7,
					value: '0'
				},
				support: {
					value: '50000000000000'
				},
				bareAyes: {
					value: '0'
				}
			},
			beneficiaries: [
				{
					address: '5GSAcddxeap6G6uEznQtkU6HTaY2Wbq3SVCiTm1KBe14ERrv',
					amount: '606380000000',
					assetId: '1337'
				}
			],
			decisionPeriodEndsAt: '2025-02-02T20:56:30.001Z'
		}
	}
];

function LatestActivity({ currentTab }: { currentTab: EActivityFeedTab }) {
	const getExploreActivityFeed = async () => {
		const { data, error } = await NextApiClientService.getActivityFeedApi();
		if (error) {
			throw new Error(error.message || 'Failed to fetch data');
		}
		return data;
	};

	const { data: activityData } = useQuery({
		queryKey: ['activityFeed', currentTab],
		queryFn: getExploreActivityFeed,
		placeholderData: (previousData) => previousData,
		staleTime: ADDRESS_LOGIN_TTL
	});

	return (
		<div className='space-y-5'>
			{currentTab === EActivityFeedTab.EXPLORE ? <ActivityFeedPostList postData={activityData} /> : subscribedpost.map((item) => <p>{item.title}</p>)}
		</div>
	);
}

export default LatestActivity;
