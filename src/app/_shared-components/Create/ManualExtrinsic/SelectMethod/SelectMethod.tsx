// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { usePolkadotApiService } from '@/hooks/usePolkadotApiService';
import { useEffect, useState } from 'react';
import { SubmittableExtrinsicFunction } from '@polkadot/api/types';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../../DropdownMenu';

function SelectMethod({
	selectedSection,
	selectedMethod,
	onChange
}: {
	selectedSection?: string;
	selectedMethod?: string;
	onChange: (extFn: SubmittableExtrinsicFunction<'promise'>) => void;
}) {
	const { apiService } = usePolkadotApiService();
	const [methods, setMethods] = useState<{ label: string; value: string }[]>([]);

	useEffect(() => {
		if (!selectedSection) {
			return;
		}
		const methodOptions = apiService?.getApiMethodOptions(selectedSection);
		if (!methodOptions) {
			return;
		}
		const initialExtFn = apiService?.getExtrinsic(selectedSection, methodOptions[0].value);
		setMethods(methodOptions || []);
		if (initialExtFn) {
			onChange(initialExtFn);
		}
	}, [apiService, onChange, selectedSection]);

	return (
		<DropdownMenu>
			<DropdownMenuTrigger
				className='flex w-full cursor-pointer items-center gap-x-2 rounded border border-border_grey px-4 py-2'
				asChild
			>
				<div>{selectedMethod || 'Select Method'}</div>
			</DropdownMenuTrigger>
			<DropdownMenuContent className='max-h-[300px] overflow-y-auto'>
				{methods?.map((method) => (
					<DropdownMenuItem key={method.value}>
						<button
							type='button'
							className='flex w-full'
							onClick={() => {
								if (!selectedSection) {
									return;
								}
								const extFn = apiService?.getExtrinsic(selectedSection, method.value);
								console.log('from select method', extFn?.section, extFn?.method);
								if (extFn) {
									onChange(extFn);
								}
							}}
						>
							{method.label}
						</button>
					</DropdownMenuItem>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

export default SelectMethod;
