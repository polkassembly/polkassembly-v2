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
		const methodOptions = apiService?.getApiMethodOptions({ sectionName: selectedSection });
		if (!methodOptions) {
			return;
		}
		const initialExtFn = apiService?.getPreimageTx({ sectionName: selectedSection, methodName: methodOptions[0].value });
		setMethods(methodOptions || []);
		if (initialExtFn) {
			onChange(initialExtFn);
		}
	}, [apiService, onChange, selectedSection]);

	return (
		<DropdownMenu>
			<DropdownMenuTrigger>
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
								const extFn = apiService?.getPreimageTx({ sectionName: selectedSection, methodName: method.value });
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
