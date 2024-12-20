// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from './Alert';

function ErrorMessage({ errorMessage }: { errorMessage: string }) {
	return (
		<div className='my-4 flex w-full justify-center'>
			<Alert
				variant='destructive'
				className='flex items-center gap-x-3'
			>
				<AlertCircle className='h-4 w-4' />
				<AlertDescription className=''>{errorMessage}</AlertDescription>
			</Alert>
		</div>
	);
}

export default ErrorMessage;
