// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { usePolkadotApiService } from '@/hooks/usePolkadotApiService';
import { useEffect, useMemo, useState } from 'react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../../DropdownMenu';

function SelectSection({ selectedSection, onChange }: { selectedSection?: string; onChange: (value: string) => void }) {
	const { apiService } = usePolkadotApiService();
	const sections = useMemo(() => apiService?.getApiSectionOptions(), [apiService]);
	const [defaultSection, setDefaultSection] = useState<string>();

	useEffect(() => {
		if (sections?.length) {
			const systemSection = sections.find((item) => item.value === 'system')?.value;
			if (systemSection) {
				setDefaultSection(systemSection);
				onChange(systemSection);
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [sections]);

	return (
		<DropdownMenu>
			<DropdownMenuTrigger>
				<div>{selectedSection || defaultSection || 'Select Section'}</div>
			</DropdownMenuTrigger>
			<DropdownMenuContent className='max-h-[300px] overflow-y-auto'>
				{sections?.map((section) => (
					<DropdownMenuItem key={section.value}>
						<button
							type='button'
							className='flex w-full capitalize'
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
