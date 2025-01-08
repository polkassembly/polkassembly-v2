// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React from 'react';
import { useTheme } from 'next-themes';
import { FiMoon } from 'react-icons/fi';
import { IoSunnyOutline } from 'react-icons/io5';
import { cn } from '@/lib/utils';

interface ToggleButtonProps {
	className?: string;
}

function ToggleButton({ className }: ToggleButtonProps) {
	const { resolvedTheme: theme, setTheme } = useTheme();
	const isDark = theme === 'dark';

	return (
		<button
			type='button'
			onClick={() => setTheme(isDark ? 'light' : 'dark')}
			className={cn(
				'flex items-center justify-center',
				'rounded-full border',
				'h-9 w-9',
				'transition-all duration-200 ease-in-out',
				'hover:bg-gray-100 dark:hover:bg-gray-800',
				'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-gray-900',
				{
					'border-gray-200 dark:border-gray-700': true
				},
				className
			)}
			aria-label={`Switch to ${isDark ? 'light' : 'dark'} theme`}
		>
			{isDark ? (
				<FiMoon className='h-4 w-4 text-[#90A0B7] transition-transform duration-200 hover:scale-110' />
			) : (
				<IoSunnyOutline className='h-5 w-5 text-[#888888] transition-transform duration-200 hover:scale-110' />
			)}
		</button>
	);
}

export default ToggleButton;
