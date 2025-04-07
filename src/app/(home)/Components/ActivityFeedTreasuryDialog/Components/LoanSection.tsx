// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ITreasuryStats } from '@/_shared/types';
import { useTranslations } from 'next-intl';
import Image, { StaticImageData } from 'next/image';
import Link from 'next/link';
import DotIcon from '@assets/icons/dot.png';
import UsdcIcon from '@assets/icons/usdc.svg';
import { formatTreasuryValues } from '@/app/_client-utils/getTreasuryNetworkStats';

interface LoansSectionProps {
	data: ITreasuryStats;
}

interface LoanItemProps {
	title: string;
	dotValue: string;
	link: string;
	icon: StaticImageData;
}

function LoanItem({ title, dotValue, link, icon }: LoanItemProps) {
	return (
		<div className='flex items-center gap-2'>
			<Link
				href={link}
				className='text-sm text-text_pink transition-colors'
				target='_blank'
				rel='noopener noreferrer'
			>
				{title}
			</Link>
			<Image
				src={icon}
				alt={title}
				width={16}
				height={16}
			/>
			<span className='text-sm text-btn_secondary_text'>{dotValue}</span>
		</div>
	);
}

function LoansSection({ data }: LoansSectionProps) {
	const t = useTranslations('ActivityFeed');
	const treasury = formatTreasuryValues(data);

	return (
		<div>
			<div className='flex items-center gap-2'>
				<span className='text-sm text-btn_secondary_text'>{t('loans')}</span>
				<span className='text-sm font-semibold text-btn_secondary_text'>~ ${treasury.loansUsd as string}</span>
				<span className='hidden'>{`$${treasury.exactLoansUsd}`}</span>
			</div>
			<div className='mt-1 flex flex-wrap items-center gap-x-2 pl-10'>
				<LoanItem
					title='Bifrost'
					dotValue='500.0K'
					link='https://polkadot.polkassembly.io/referenda/432'
					icon={DotIcon}
				/>
				<LoanItem
					title='Pendulum'
					dotValue='50.0K'
					link='https://polkadot.polkassembly.io/referenda/748'
					icon={DotIcon}
				/>
				<LoanItem
					title='Hydration'
					dotValue='1M'
					link='https://polkadot.polkassembly.io/referenda/560'
					icon={DotIcon}
				/>
				<LoanItem
					title='Centrifuge'
					dotValue={data.loans?.usdc ? '1.5M USDC' : 'N/A'}
					link='https://polkadot.polkassembly.io/referenda/1122'
					icon={UsdcIcon}
				/>
			</div>
		</div>
	);
}

export default LoansSection;
