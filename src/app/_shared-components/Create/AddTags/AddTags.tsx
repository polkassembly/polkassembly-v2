// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import React, { useEffect, useState } from 'react';
import { X, ChevronsUpDown, PlusIcon } from 'lucide-react';
import { Button } from '@/app/_shared-components/Button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/app/_shared-components/Command';
import { useTranslations } from 'next-intl';
import { NextApiClientService } from '@/app/_client-services/next_api_client_service';
import { ClientError } from '@/app/_client-utils/clientError';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../DropdownMenu';
import classes from './AddTags.module.scss';
import { Input } from '../../Input';

interface Option {
	value: string;
	label: string;
}
const MAX_TAGS = 5;

export function AddTags({ onChange, disabled }: { onChange: (options: Option[]) => void; disabled: boolean }) {
	const t = useTranslations();
	const [open, setOpen] = React.useState(false);
	const [selectedValues, setSelectedValues] = React.useState<Option[]>([]);
	const [pressedAddTag, setPressedAddTag] = React.useState(false);
	const [allTags, setAllTags] = useState<Option[]>([]);
	const [loading, setLoading] = useState(false);
	const addTagInputRef = React.useRef<HTMLInputElement>(null);

	const getAllTags = async () => {
		setLoading(true);
		const { data, error } = await NextApiClientService.fetchAllTagsApi();
		if (error) {
			setLoading(false);
			throw new ClientError(error.message || 'Failed to fetch data');
		}
		setAllTags(data?.map((tag) => ({ value: tag.name, label: tag.name })) || []);
		setLoading(false);
	};

	const handleSelect = (option: Option) => {
		if (selectedValues?.length >= MAX_TAGS) return;
		const newTags = selectedValues?.find((item) => item.value === option.value) ? selectedValues : [...selectedValues, option];
		setSelectedValues(newTags);
		onChange(newTags);
	};

	const handleRemove = (optionToRemove: Option) => {
		const newTags = selectedValues?.filter((item) => item.value !== optionToRemove.value);
		setSelectedValues(newTags);
		onChange(newTags);
	};

	useEffect(() => {
		getAllTags();
	}, []);

	return (
		<div className={classes.container}>
			<div>
				{pressedAddTag ? (
					<Input
						disabled={disabled}
						ref={addTagInputRef}
						className={classes.addTagInput}
						placeholder={t('Create.addTags')}
						onKeyDown={(e) => {
							if (e.key === 'Enter') {
								handleSelect({ value: e.currentTarget.value, label: e.currentTarget.value });
								setPressedAddTag(false);
							}
						}}
					/>
				) : (
					<Button
						className={classes.addTagButton}
						disabled={disabled}
						onClick={() => {
							setPressedAddTag(true);
							addTagInputRef.current?.focus();
						}}
					>
						<PlusIcon className='h-4 w-4' />
						{t('Create.createTag')}
					</Button>
				)}
			</div>

			<DropdownMenu onOpenChange={setOpen}>
				<DropdownMenuTrigger
					className='w-full'
					asChild
					disabled={disabled}
				>
					<div
						role='combobox'
						aria-controls='tags-listbox'
						aria-expanded={open}
						className={classes.popoverTrigger}
					>
						<div className='flex flex-wrap'>
							{selectedValues?.length ? (
								selectedValues?.map((option) => (
									<div
										key={option.value}
										className={classes.tagLabel}
									>
										{option.label}
										<Button
											type='button'
											disabled={disabled}
											className={classes.tagRemoveButton}
											onClick={(e) => {
												e.stopPropagation();
												e.preventDefault();
												handleRemove(option);
												setOpen(false);
											}}
										>
											<X />
										</Button>
									</div>
								))
							) : (
								<span className={classes.selectTagsText}>{t('Create.selectTags')}</span>
							)}
						</div>
						<ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
					</div>
				</DropdownMenuTrigger>
				<DropdownMenuContent align='start'>
					<DropdownMenuItem>
						<Command className={classes.command}>
							<CommandInput
								placeholder={t('Create.searchTags')}
								className={classes.commandInput}
								disabled={disabled}
							/>
							<CommandList>
								{!loading ? <CommandEmpty className={classes.noTagFoundText}>{t('Create.noTagsFound')}.</CommandEmpty> : <div className={classes.noTagFoundText}>Loading....</div>}
								<CommandGroup>
									{allTags?.map((tag) => (
										<CommandItem
											key={tag.value}
											onSelect={() => handleSelect(tag)}
											className={classes.commandItem}
										>
											{tag.label}
										</CommandItem>
									))}
								</CommandGroup>
							</CommandList>
						</Command>
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	);
}
