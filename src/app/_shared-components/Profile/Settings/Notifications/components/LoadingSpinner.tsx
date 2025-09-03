// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
	size?: 'sm' | 'md' | 'lg';
	className?: string;
}

function LoadingSpinner({ size = 'md', className = '' }: LoadingSpinnerProps) {
	const sizeClasses = {
		sm: 'h-4 w-4',
		md: 'h-6 w-6',
		lg: 'h-8 w-8'
	};

	return (
		<div className={`flex items-center justify-center ${className}`}>
			<Loader2 className={`text-text_secondary animate-spin ${sizeClasses[size]}`} />
		</div>
	);
}

export default LoadingSpinner;
