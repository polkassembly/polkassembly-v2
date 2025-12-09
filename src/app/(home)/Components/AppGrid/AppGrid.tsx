// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import Link from 'next/link';
import { useTranslations } from 'next-intl';

interface AppItem {
	key: string;
	href: string;
}

const apps: AppItem[] = [
	{
		key: '🏛 OpenGov',
		href: '/opengov'
	},
	{
		key: '👥 Delegation',
		href: '/delegation'
	},
	{
		key: '💰 Bounties',
		href: '/bounties'
	},
	{
		key: '🪪 Identity & Judgement',
		href: '/judgements'
	},
	{
		key: '🧑‍🤝‍🧑 People',
		href: '/people'
	},
	{
		key: '🧬 Proof of Personhood',
		href: 'https://www.proofofpersonhood.how/'
	},
	{
		key: '⚖️ DelegateX',
		href: '/delegation'
	},
	{
		key: '🦜 Klara',
		href: '/'
	},
	{
		key: '📊 Treasury Analytics',
		href: '/treasury-analytics'
	},
	{
		key: '🌐 Offchain',
		href: '/offchain'
	},
	{
		key: '🏗 Create',
		href: '/create'
	},
	{
		key: '📈 Governance Analytics',
		href: '/gov-analytics'
	},
	{
		key: '🎥 AAG',
		href: '/aag'
	},
	{
		key: '🛡 Polkasafe',
		href: 'https://polkasafe.xyz'
	},
	{
		key: '🎓 Fellowship',
		href: 'https://collectives.polkassembly.io'
	},
	{
		key: '🧩 Proxy',
		href: '/proxies'
	}
];

export default function AppGrid() {
	const t = useTranslations('Apps');
	return (
		<div>
			<h2 className='mb-4 text-lg font-semibold text-text_primary'>{t('header')}</h2>
			<div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
				{apps.map((app) => (
					<Link
						key={app.key}
						href={app.href}
						className='flex flex-col gap-y-2 rounded-2xl border border-border_grey bg-bg_modal p-3 shadow-sm transition-all hover:shadow-md'
					>
						<div className='mb-1 flex items-center gap-x-2'>
							<span className='text-base font-semibold text-text_primary'>{t(`${app.key}.title`)}</span>
						</div>
						<p className='text-xs leading-5 text-wallet_btn_text'>{t(`${app.key}.description`)}</p>
					</Link>
				))}
			</div>
		</div>
	);
}
