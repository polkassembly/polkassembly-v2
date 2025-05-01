// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, { useState, useRef, ChangeEvent, useCallback, RefObject, useLayoutEffect } from 'react';
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
import styles from './AddTags.module.scss';

interface AddTagsProps {
	className?: string;
	disabled?: boolean;
	onChange?: (tags: ITag[]) => void;
}

const TAG_MAX_LENGTH = 20;

// Custom hook for managing tags
const useTagManagement = ({
	onChange,
	setFilteredSuggestions,
	suggestions
}: {
	onChange?: (tags: ITag[]) => void;
	setFilteredSuggestions?: (suggestions: ITag[]) => void;
	suggestions?: ITag[];
}) => {
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
				setFilteredSuggestions?.(suggestions?.filter((suggestion) => !newTags?.some(({ value }) => value === suggestion.value)) || []);
				return true;
			}
			return false;
		},
		[tags, network, onChange, setFilteredSuggestions, suggestions]
	);

	const removeTag = useCallback(
		(index: number) => {
			const newTags = tags.filter((_, i) => i !== index);
			setTags(newTags);
			onChange?.(newTags);
			setFilteredSuggestions?.(suggestions?.filter((suggestion) => !newTags?.some((tag) => tag.value === suggestion.value)) || []);
		},
		[tags, onChange, setFilteredSuggestions, suggestions]
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
	<div className={styles.tagItem}>
		<span>{tag.value}</span>
		<Button
			variant='ghost'
			onClick={(e) => {
				e.stopPropagation();
				onRemove();
			}}
			className='h-5 bg-transparent px-1 py-0 text-text_primary'
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
			{!suggestions.length && <div className='text-text_secondary'>{t('Create.noTagsFound')}</div>}
			<div className={styles.suggestionsContainer}>
				{suggestions.map((suggestion) => (
					<Button
						type='button'
						variant='ghost'
						key={`suggestion-${suggestion.value}`}
						className={styles.suggestionButton}
						onClick={() => onSelect(suggestion.value)}
					>
						<div className={styles.suggestionText}>{suggestion.value}</div>
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
	const popoverOpenRef = useRef(false);
	const { data: suggestions = [], isFetching } = useTagSuggestions(disabled);
	const [filteredSuggestions, setFilteredSuggestions] = useState<ITag[]>(suggestions || []);
	const { tags, addTag, removeTag } = useTagManagement({ onChange, setFilteredSuggestions, suggestions });

	// Keep track of popover state
	useLayoutEffect(() => {
		popoverOpenRef.current = open;
	}, [open]);

	// Ensure input focus after DOM updates
	useLayoutEffect(() => {
		if (popoverOpenRef.current && inputRef.current) {
			// Use RAF to ensure focus after browser paint
			requestAnimationFrame(() => {
				inputRef.current?.focus();
			});
		}
	}, [filteredSuggestions, open]);

	// Handle popover state changes
	const onOpenChange = useCallback((isOpen: boolean) => {
		setOpen(isOpen);
		if (isOpen) {
			// Focus input when popover opens
			requestAnimationFrame(() => {
				inputRef.current?.focus();
			});
		}
	}, []);

	const handleInputChange = useCallback(
		(e: ChangeEvent<HTMLInputElement>) => {
			const { value } = e.target;
			setOpen(
				Boolean(
					value.length > 0 && suggestions.some((suggestion) => suggestion.value.toLowerCase().includes(value.toLowerCase()) && !tags?.some((tag) => tag.value === suggestion.value))
				)
			);
			setInputValue(value);
			setFilteredSuggestions(
				suggestions.filter((suggestion) => suggestion.value.toLowerCase().includes(value.toLowerCase()) && !tags?.some((tag) => tag.value === suggestion.value))
			);
			inputRef.current?.focus();
		},
		[suggestions, tags]
	);

	const handleKeyDown = useCallback(
		(e: React.KeyboardEvent<HTMLInputElement>) => {
			if (['Enter', ','].includes(e.key)) {
				// Only process Enter or comma if there's actual input
				if (inputValue.trim()) {
					e.preventDefault();
					if (addTag(inputValue)) {
						setInputValue('');
						setOpen(false);
					}
				} else if (e.key === 'Enter') {
					// Prevent any action when pressing Enter with empty input
					e.preventDefault();
				}
				return;
			}

			if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
				removeTag(tags.length - 1);
			}
		},
		[inputValue, addTag, removeTag, tags?.length]
	);

	const handleSuggestionSelect = useCallback(
		(value: string) => {
			if (addTag(value)) {
				setInputValue('');
				setOpen(false);
			}
			// Use requestAnimationFrame for consistent focus handling
			requestAnimationFrame(() => {
				inputRef.current?.focus();
			});
		},
		[addTag]
	);

	return (
		<div className='space-y-2'>
			<Popover
				open={open && suggestions.length > 0}
				onOpenChange={onOpenChange}
			>
				<PopoverTrigger asChild>
					<div
						ref={containerRef as unknown as RefObject<HTMLDivElement>}
						className={cn(styles.container, className)}
					>
						{!!tags.length && (
							<div className={styles.tagsContainer}>
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
								className={styles.inputBox}
								placeholder={tags.length === 0 ? t('Create.addTagsPlaceholder') : ''}
								disabled={tags.length >= MAX_POST_TAGS}
								maxLength={TAG_MAX_LENGTH}
							/>
						</div>
					</div>
				</PopoverTrigger>
				<PopoverContent
					className={styles.popoverContent}
					align='start'
					sideOffset={5}
				>
					<SuggestionsList
						suggestions={!inputValue && !tags.length ? suggestions : filteredSuggestions}
						onSelect={handleSuggestionSelect}
						loading={isFetching}
					/>
				</PopoverContent>
			</Popover>
		</div>
	);
}
