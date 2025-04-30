// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, { useState, useRef, ChangeEvent, useCallback } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { NextApiClientService } from '@/app/_client-services/next_api_client_service';
import { useQuery } from '@tanstack/react-query';
import { ClientError } from '@/app/_client-utils/clientError';
import { useTranslations } from 'next-intl';
import { ITag } from '@/_shared/types';
import { ValidatorService } from '@/_shared/_services/validator_service';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { MAX_POST_TAGS } from '@/_shared/_constants/maxPostTags';
import { Popover, PopoverContent, PopoverTrigger } from '../../Popover/Popover';
import { Skeleton } from '../../Skeleton';
import { Input } from '../../Input';
import { Button } from '../../Button';

interface AddTagsProps {
	className?: string;
	disabled?: boolean;
	onChange?: (tags: ITag[]) => void;
}

const TAG_MAX_LENGTH = 20;

// Custom hook for managing tags
const useTagManagement = (onChange?: (tags: ITag[]) => void) => {
	const [tags, setTags] = useState<ITag[]>([]);
	const network = getCurrentNetwork();

	const addTag = useCallback(
		(tag: string) => {
			const trimmedTag = tag.trim().replace(/,/g, '');

			if (!ValidatorService.isValidTag(trimmedTag)) {
				return false;
			}

			if (trimmedTag && !tags.some(({ value }) => value === trimmedTag)) {
				if (tags.length >= MAX_POST_TAGS) {
					return false;
				}

				const newTags = [...tags, { value: trimmedTag, lastUsedAt: new Date(), network }];
				setTags(newTags);
				onChange?.(newTags);
				return true;
			}
			return false;
		},
		[tags, network, onChange]
	);

	const removeTag = useCallback(
		(index: number) => {
			const newTags = tags.filter((_, i) => i !== index);
			setTags(newTags);
			onChange?.(newTags);
		},
		[tags, onChange]
	);

	return { tags, addTag, removeTag };
};

// Custom hook for tag suggestions
const useTagSuggestions = (disabled?: boolean) => {
	const fetchAllTags = async () => {
		const { data, error } = await NextApiClientService.fetchAllTags();
		if (error) {
			throw new ClientError(error.message || 'Failed to fetch data');
		}
		return data?.items;
	};

	return useQuery({
		queryKey: ['tags'],
		queryFn: fetchAllTags,
		enabled: !disabled
	});
};

// Tag item component
const TagItem = React.memo(({ tag, onRemove }: { tag: ITag; onRemove: () => void }) => (
	<div className='flex items-center gap-1 rounded-lg bg-tag_input_bg px-2 py-1.5 text-text_primary shadow-sm'>
		<span>{tag.value}</span>
		<Button
			variant='ghost'
			onClick={(e) => {
				e.stopPropagation();
				onRemove();
			}}
			className='h-5 px-1 py-0 text-text_primary'
		>
			<X size={16} />
		</Button>
	</div>
));

TagItem.displayName = 'TagItem';

// Suggestions list component
const SuggestionsList = React.memo(({ suggestions, onSelect, loading }: { suggestions: ITag[]; onSelect: (value: string) => void; loading: boolean }) => {
	const t = useTranslations();

	if (loading) {
		return <Skeleton className='h-[50px] w-full' />;
	}

	return (
		<div>
			{!suggestions.length && <div>{t('Create.noTagsFound')}</div>}
			<div>
				{suggestions.map((suggestion) => (
					<Button
						key={`suggestion-${suggestion.value}`}
						className='w-full cursor-pointer justify-start bg-transparent py-1 text-sm font-medium text-text_primary shadow-none hover:bg-transparent'
						onClick={() => onSelect(suggestion.value)}
					>
						{suggestion.value}
					</Button>
				))}
			</div>
		</div>
	);
});

SuggestionsList.displayName = 'SuggestionsList';

export function AddTags({ className, onChange, disabled }: AddTagsProps) {
	const t = useTranslations();
	const inputRef = useRef<HTMLInputElement>(null);
	const triggerRef = useRef<HTMLDivElement>(null);
	const containerRef = useRef<HTMLButtonElement>(null);
	const [open, setOpen] = useState(false);
	const [inputValue, setInputValue] = useState('');

	const { tags, addTag, removeTag } = useTagManagement(onChange);
	const { data: suggestions = [], isFetching } = useTagSuggestions(disabled);

	const handleInputChange = useCallback(
		(e: ChangeEvent<HTMLInputElement>) => {
			const { value } = e.target;
			setOpen(
				Boolean(
					value.length > 0 && suggestions.some((suggestion) => suggestion.value.toLowerCase().includes(value.toLowerCase()) && !tags?.some((tag) => tag.value === suggestion.value))
				)
			);
			setInputValue(value);
			inputRef.current?.focus();
		},
		[suggestions, tags]
	);

	const handleKeyDown = useCallback(
		(e: React.KeyboardEvent<HTMLInputElement>) => {
			if (['Enter', ','].includes(e.key) && inputValue.trim()) {
				e.preventDefault();
				if (addTag(inputValue)) {
					setInputValue('');
					setOpen(false);
				}
				return;
			}

			if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
				removeTag(tags.length - 1);
			}
		},
		[inputValue, tags.length, addTag, removeTag]
	);

	const handleSuggestionSelect = useCallback(
		(value: string) => {
			if (addTag(value)) {
				setInputValue('');
				setOpen(false);
			}
			inputRef.current?.focus();
		},
		[addTag]
	);

	return (
		<div className='space-y-2'>
			<Popover
				open={open && suggestions.length > 0}
				onOpenChange={setOpen}
			>
				<PopoverTrigger asChild>
					<Button
						ref={containerRef}
						className={cn(
							'flex min-h-12 w-full flex-wrap items-center gap-2 rounded-lg border-[1px] border-solid border-border_grey bg-transparent p-0 shadow-none hover:bg-transparent',
							className
						)}
						onClick={() => inputRef.current?.focus()}
					>
						{!!tags.length && (
							<div className='flex flex-wrap gap-2 px-3'>
								{tags.map((tag, index) => (
									<TagItem
										key={`tag-${tag.value}`}
										tag={tag}
										onRemove={() => removeTag(index)}
									/>
								))}
							</div>
						)}
						<div
							className='flex-1'
							ref={triggerRef}
						>
							<Input
								ref={inputRef}
								type='text'
								value={inputValue}
								onChange={handleInputChange}
								onKeyDown={handleKeyDown}
								className='w-full border-none bg-transparent p-0 text-input_text shadow-none placeholder:text-placeholder'
								placeholder={tags.length === 0 ? t('Create.addTagsPlaceholder') : ''}
								disabled={tags.length >= MAX_POST_TAGS}
								maxLength={TAG_MAX_LENGTH}
							/>
						</div>
					</Button>
				</PopoverTrigger>
				<PopoverContent
					className='max-h-[300px] w-[var(--radix-popover-trigger-width)] overflow-y-auto border-none bg-bg_modal p-4'
					align='start'
					sideOffset={5}
				>
					<SuggestionsList
						suggestions={suggestions}
						onSelect={handleSuggestionSelect}
						loading={isFetching}
					/>
				</PopoverContent>
			</Popover>
		</div>
	);
}
