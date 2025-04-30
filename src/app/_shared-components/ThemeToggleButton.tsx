// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React from 'react';
import { FiMoon } from '@react-icons/all-files/fi/FiMoon';
import { IoSunnyOutline } from '@react-icons/all-files/io5/IoSunnyOutline';
import { cn } from '@/lib/utils';
import { ETheme } from '@/_shared/types';
import { useTranslations } from 'next-intl';
import { useUserPreferences } from '@/hooks/useUserPreferences';

interface ToggleButtonProps {
	className?: string;
}

function ThemeToggleButton({ className }: ToggleButtonProps) {
	const t = useTranslations('Header');

	const { userPreferences, setUserPreferences } = useUserPreferences();

	const isDark = userPreferences.theme === ETheme.DARK;

	return (
		<button
			type='button'
			onClick={() => setUserPreferences({ ...userPreferences, theme: isDark ? ETheme.LIGHT : ETheme.DARK })}
			className={cn(
				'flex items-center justify-center',
				'rounded-full border',
				'h-9 w-9',
				'transition-all duration-200 ease-in-out',
				'hover:bg-gray-100 dark:hover:bg-gray-800',
				'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-gray-900',
				'border-border_grey',
				className
			)}
			aria-label={`${t('switchTo')} ${isDark ? t('lightMode') : t('darkMode')}`}
		>
			{isDark ? (
				<div className='flex items-center gap-2'>
					<FiMoon
						className='h-4 w-4 text-[#90A0B7] transition-transform duration-200 hover:scale-110'
						strokeWidth={2}
						aria-hidden='true'
					/>
					<p className='block text-xs text-text_primary md:hidden'>
						{t('switchTo')} <span className='font-semibold'>{t('lightMode')}</span>
					</p>
				</div>
			) : (
				<div className='flex items-center gap-2'>
					<IoSunnyOutline
						className='h-5 w-5 text-[#888888] transition-transform duration-200 hover:scale-110'
						strokeWidth={2}
						aria-hidden='true'
					/>
					<p className='block text-xs text-text_primary md:hidden'>
						{t('switchTo')} <span className='font-semibold'>{t('darkMode')}</span>
					</p>
				</div>
			)}
		</button>
	);
}

export default ThemeToggleButton;
