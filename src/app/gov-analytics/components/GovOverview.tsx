// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';
import TimeLineIcon from '@assets/icons/timeline.svg';
import { Separator } from '@/app/_shared-components/Separator';
import { cn } from '@/lib/utils';
import { ETheme } from '@/_shared/types';
import ExpandIcon from '@assets/icons/expand.svg';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/app/_shared-components/Collapsible';
import AnalyticsReferendumOutcome from './AnalyticsReferendumOutcome';
import AnalyticsReferendumCount from './AnalyticsReferendumCount';
import MonthlySpend from './MonthlySpend';
import AnalyticsTurnOutPercentage from './AnalyticsTurnoutPercentage';
import ReferendumCount from './ReferendumCount';

function GovOverview() {
	const t = useTranslations('GovAnalytics');
	const { userPreferences } = useUserPreferences();

	return (
		<Collapsible
			defaultOpen
			className='rounded-lg border border-border_grey bg-bg_modal'
		>
			<CollapsibleTrigger className='group flex w-full items-center gap-x-4 p-3 lg:p-4'>
				<Image
					src={TimeLineIcon}
					alt='Timeline Icon'
					width={24}
					height={24}
					className='h-6 w-6'
				/>
				<p className='text-base font-semibold text-text_primary'>{t('overview')}</p>
				<div className='flex-1' />
				<Image
					src={ExpandIcon}
					alt=''
					aria-hidden
					width={16}
					height={16}
					className={cn(userPreferences?.theme === ETheme.DARK ? 'darkIcon' : '', 'transition-transform duration-200 group-data-[state=open]:rotate-180')}
				/>
			</CollapsibleTrigger>
			<CollapsibleContent>
				<Separator className='my-0' />
				<div className='p-3 lg:p-4'>
					<div className='mb-4 flex flex-col gap-4 md:grid md:grid-cols-2'>
						<AnalyticsReferendumOutcome />
						<AnalyticsReferendumCount />
					</div>
					<div className='mb-4 flex flex-col gap-4 md:grid md:grid-cols-2'>
						<MonthlySpend />
						<AnalyticsTurnOutPercentage />
					</div>
					<ReferendumCount />
				</div>
			</CollapsibleContent>
		</Collapsible>
	);
}

export default GovOverview;
