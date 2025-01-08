// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import React, { forwardRef, useState } from 'react';
import { EyeIcon, EyeOffIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@ui/Button';
import { Input } from '@ui/Input';
import { useTranslations } from 'next-intl';
import classes from './PasswordInput.module.scss';

const PasswordInput = forwardRef<HTMLInputElement, React.ComponentProps<'input'>>(({ className, ...props }, ref) => {
	const [showPassword, setShowPassword] = useState(false);
	const disabled = props.value === '' || props.value === undefined || props.disabled;
	const t = useTranslations();

	return (
		<div className='relative'>
			<Input
				type={showPassword ? 'text' : 'password'}
				className={cn(classes.hidePasswordToggle, 'pr-10', className)}
				ref={ref}
				{...props}
			/>
			<Button
				type='button'
				variant='ghost'
				size='sm'
				className='absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent'
				onClick={() => setShowPassword((prev) => !prev)}
				disabled={disabled}
			>
				{showPassword && !disabled ? (
					<EyeIcon
						className='h-4 w-4'
						aria-hidden='true'
					/>
				) : (
					<EyeOffIcon
						className='h-4 w-4'
						aria-hidden='true'
					/>
				)}
				<span className='sr-only'>{showPassword ? t('AddressDropdown.hidePassword') : t('AddressDropdown.showPassword')}</span>
			</Button>
		</div>
	);
});
PasswordInput.displayName = 'PasswordInput';

export { PasswordInput };
