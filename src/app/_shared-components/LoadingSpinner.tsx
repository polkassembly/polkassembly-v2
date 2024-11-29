// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

// TODO: Replace this Spinner import with Shadcn Ui's Spinner component
// import { Spinner } from '@nextui-org/spinner';

function LoadingSpinner({ className = '', message = 'Loading...', size = 'md' }: { className?: string; message?: string; size?: 'sm' | 'md' | 'lg' }) {
	return (
		<div className={`${className} flex flex-col items-center justify-center gap-3`}>
			{/* <Spinner size={size} /> */}
			{message && <span className='text-xs'>{message}</span>}
		</div>
	);
}

export default LoadingSpinner;
