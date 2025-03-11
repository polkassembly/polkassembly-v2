// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { usePolkadotApiService } from '@/hooks/usePolkadotApiService';
import { useMemo } from 'react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../../DropdownMenu';

function SelectSection({ selectedSection, onChange }: { selectedSection?: string; onChange: (value: string) => void }) {
	const { apiService } = usePolkadotApiService();
	const sections = useMemo(() => apiService?.getApiSectionOptions(), [apiService]);

	return (
		<DropdownMenu>
			<DropdownMenuTrigger
				className='flex w-full cursor-pointer items-center gap-x-2 rounded border border-border_grey px-4 py-2'
				asChild
			>
				<div>{selectedSection || 'Select Section'}</div>
			</DropdownMenuTrigger>
			<DropdownMenuContent className='max-h-[300px] overflow-y-auto'>
				{sections?.map((section) => (
					<DropdownMenuItem key={section.value}>
						<button
							type='button'
							className='flex w-full'
							onClick={() => onChange(section.value)}
						>
							{section.label}
						</button>
					</DropdownMenuItem>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

export default SelectSection;
