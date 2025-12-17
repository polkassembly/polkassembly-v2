// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { useTranslations } from 'next-intl';
import { FaFilter } from '@react-icons/all-files/fa/FaFilter';
import { EDelegateSource } from '@/_shared/types';
import { Popover, PopoverContent, PopoverTrigger } from '@/app/_shared-components/Popover/Popover';
import { Checkbox } from '@/app/_shared-components/Checkbox';
import { Label } from '@/app/_shared-components/Label';
import { Button } from '@/app/_shared-components/Button';

function FilterPopover({ selectedSources, setSelectedSources }: { selectedSources: EDelegateSource[]; setSelectedSources: (sources: EDelegateSource[]) => void }) {
	const t = useTranslations('Delegation');
	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button
					variant='outline'
					className='flex h-10 w-10 items-center justify-center'
				>
					<FaFilter className='text-lg text-wallet_btn_text' />
				</Button>
			</PopoverTrigger>
			<PopoverContent className='w-[200px] border-border_grey p-4'>
				<div className='flex items-center justify-end'>
					<Button
						onClick={() => setSelectedSources([])}
						className='text-sm font-medium text-text_pink'
						variant='ghost'
						size='sm'
					>
						{t('clearAll')}
					</Button>
				</div>
				<hr className='my-2 border-text_pink' />
				<div className='mt-2 space-y-4'>
					{Object.values(EDelegateSource).map((source) => (
						<div
							key={source}
							className='flex items-center space-x-2'
						>
							<Checkbox
								checked={selectedSources.includes(source)}
								onCheckedChange={(checked: boolean) => {
									setSelectedSources(checked ? [...selectedSources, source] : selectedSources.filter((s) => s !== source));
								}}
							/>
							<Label className='text-sm text-text_primary'>{source.charAt(0).toUpperCase() + source.slice(1)}</Label>
						</div>
					))}
				</div>
			</PopoverContent>
		</Popover>
	);
}

export default FilterPopover;
