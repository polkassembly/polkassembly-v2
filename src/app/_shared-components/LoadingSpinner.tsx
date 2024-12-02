import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
	size?: 'small' | 'medium' | 'large';
	show?: boolean;
	className?: string;
	children?: React.ReactNode;
	message?: string;
}

export function LoadingSpinner({ size = 'medium', show = true, className, children, message }: LoadingSpinnerProps) {
	const sizeClasses = {
		small: 'size-6',
		medium: 'size-8',
		large: 'size-12'
	};

	return show ? (
		<span className={`flex flex-col items-center justify-center ${className}`}>
			<Loader2 className={`animate-spin text-primary ${sizeClasses[size]}`} />
			{message && <span className='mt-2 text-xs text-gray-500'>{message}</span>}
			{children}
		</span>
	) : null;
}
