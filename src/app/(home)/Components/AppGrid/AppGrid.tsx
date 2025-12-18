// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { MouseEvent } from 'react';
import { useKlara } from '@/hooks/useKlara';
import { EChatState } from '@/_shared/types';

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
		icon: '🧬',
		key: 'PoP',
		href: 'https://www.proofofpersonhood.how/'
	},

	{
		icon: '🦜',
		key: 'Klara',
		href: '/'
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
		icon: '🌐',
		key: 'Offchain',
		href: '/discussions'
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
	const { setChatState } = useKlara();

	const handleAppClick = (app: AppItem, e: MouseEvent) => {
		if (app.key === 'Klara') {
			e.preventDefault();
			setChatState(EChatState.EXPANDED);
		}
	};

	return (
		<div>
			<h2 className='mb-4 text-lg font-semibold text-text_primary'>{t('header')}</h2>
			<div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
				{apps.map((app) => (
					<Link
						key={app.key}
						href={app.href}
						onClick={(e) => handleAppClick(app, e)}
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
