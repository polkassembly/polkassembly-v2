// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import Link from 'next/link';
import { useTranslations } from 'next-intl';

interface AppItem {
	icon: string;
	key: string;
	href: string;
}

const apps: AppItem[] = [
	{
		icon: '🏛',
		key: 'OpenGov',
		href: '/activity-feed'
	},
	{
		icon: '👥',
		key: 'Delegation',
		href: '/delegation'
	},
	{
		icon: '💰',
		key: 'Bounties',
		href: '/bounties'
	},
	{
		icon: '🪪',
		key: 'Identity',
		href: '/judgements'
	},
	{
		icon: '🧑‍🤝‍🧑',
		key: 'People',
		href: '/people'
	},
	{
		icon: '🧬',
		key: 'PoP',
		href: 'https://www.proofofpersonhood.how/'
	},
	{
		icon: '⚖️',
		key: 'DelegateX',
		href: '/delegation'
	},
	{
		icon: '🦜',
		key: 'Klara',
		href: '/'
	},
	{
		icon: '📊',
		key: 'TreasuryAnalytics',
		href: '/treasury-analytics'
	},
	{
		icon: '🌐',
		key: 'Offchain',
		href: '/discussions'
	},
	{
		icon: '🏗',
		key: 'Create',
		href: '/create'
	},
	{
		icon: '📈',
		key: 'GovAnalytics',
		href: '/gov-analytics'
	},
	{
		icon: '🎥',
		key: 'AAG',
		href: '/aag'
	},
	{
		icon: '🛡',
		key: 'Polkasafe',
		href: 'https://polkasafe.xyz'
	},
	{
		icon: '🎓',
		key: 'Fellowship',
		href: 'https://collectives.polkassembly.io'
	},
	{
		icon: '🧩',
		key: 'Proxy',
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
							{app.icon} <span className='text-base font-semibold text-text_primary'>{t(`${app.key}.title`)}</span>
						</div>
						<p className='text-sm leading-5 text-wallet_btn_text'>{t(`${app.key}.description`)}</p>
					</Link>
				))}
			</div>
		</div>
	);
}
