// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { useTranslations } from 'next-intl';
import { IWritePostFormFields, EPollVotesType } from '@/_shared/types';
import { UseFormReturn } from 'react-hook-form';
import { useState, useCallback, useMemo } from 'react';
import { Trash2, CalendarRange, X } from 'lucide-react';
import { MIN_POLL_OPTIONS_COUNT, MAX_POLL_OPTIONS_COUNT, MAX_POLL_OPTION_LENGTH } from '@/_shared/_constants/pollLimits';
import { dayjs } from '@/_shared/_utils/dayjsInit';
import { cn } from '@/lib/utils';
import { Switch } from '../../Switch';
import { Input } from '../../Input';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '../../Form';
import { Button } from '../../Button';
import { Calendar } from '../../Calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../../Popover/Popover';
import { Checkbox } from '../../Checkbox';
import { Separator } from '../../Separator';
import classes from './AddPoll.module.scss';

interface PollOption {
	id: string;
	value: string;
}

function PollOptions({
	options,
	onChange,
	onAdd,
	onDelete
}: {
	options: PollOption[];
	onChange: (value: string, id: string) => void;
	onAdd: () => void;
	onDelete: (id: string) => void;
}) {
	const t = useTranslations('Create');
	// Find duplicate option values
	const duplicateValues = useMemo(() => {
		const nonEmptyOptions = options.filter((option) => option.value.trim() !== '');
		const valueCounts = nonEmptyOptions.reduce(
			(acc, option) => {
				const trimmedValue = option.value.trim().toLowerCase();
				acc[`${trimmedValue}`] = (acc[`${trimmedValue}`] || 0) + 1;
				return acc;
			},
			{} as Record<string, number>
		);

		return Object.keys(valueCounts).filter((value) => valueCounts[`${value}`] > 1);
	}, [options]);

	const isDuplicate = useCallback(
		(value: string) => {
			if (!value.trim()) return false;
			return duplicateValues.includes(value.trim().toLowerCase());
		},
		[duplicateValues]
	);

	return (
		<div className={classes.pollOptionsContainer}>
			{options.map((option, index) => (
				<div
					key={option.id}
					className='flex flex-col gap-1'
				>
					<div className='flex items-center gap-1'>
						<Input
							value={option.value}
							onChange={(e) => onChange(e.target.value, option.id)}
							placeholder={`Option ${index + 1}`}
							maxLength={MAX_POLL_OPTION_LENGTH}
							className={cn(classes.pollOptionInput, isDuplicate(option.value) ? classes.pollOptionInputError : '')}
						/>
						{options.length > MIN_POLL_OPTIONS_COUNT && (
							<Button
								variant='outline'
								onClick={() => onDelete(option.id)}
								className='text-text_secondary hover:bg-toast_error_bg hover:text-toast_error_text'
							>
								<Trash2 className='h-4 w-4' />
							</Button>
						)}
					</div>
					{isDuplicate(option.value) && <p className={classes.pollOptionInputErrorText}>{t('AddPoll.optionDuplicated')}</p>}
				</div>
			))}

			{options.length < MAX_POLL_OPTIONS_COUNT && (
				<Button
					variant='outline'
					onClick={onAdd}
					className='mt-0 flex h-8 w-full items-center justify-start gap-2 rounded-md border-dashed bg-transparent text-sm font-medium text-placeholder hover:text-text_pink'
				>
					{t('AddPoll.addAnotherOption')}
				</Button>
			)}
		</div>
	);
}

// main component
function AddPoll({ formData, disabled }: { formData: UseFormReturn<IWritePostFormFields>; disabled: boolean }) {
	const t = useTranslations('Create');
	const [isActive, setIsActive] = useState(false);

	// Convert string array to PollOption array and vice versa
	const convertToPollOptions = useCallback((stringOptions: string[]): PollOption[] => {
		return stringOptions.map((value, index) => ({
			id: `option-${index + 1}`,
			value
		}));
	}, []);

	const convertToStringArray = useCallback((pollOptions: PollOption[]): string[] => {
		return pollOptions.map((option) => option.value);
	}, []);

	// Initialize with 2 empty options if not already set
	const initializeOptions = () => {
		const currentOptions = formData.getValues('pollOptions');
		if (!currentOptions || currentOptions.length === 0) {
			formData.setValue('pollOptions', ['', '']);
		}
	};

	const handleAddOption = () => {
		const currentOptions = formData.getValues('pollOptions') || ['', ''];
		if (currentOptions.length >= MAX_POLL_OPTIONS_COUNT) return;

		const newOptions = [...currentOptions, ''];
		formData.setValue('pollOptions', newOptions);
		formData.trigger('pollOptions');
	};

	const handleDeleteOption = (idToDelete: string) => {
		const currentOptions = formData.getValues('pollOptions') || ['', ''];
		if (currentOptions.length <= MIN_POLL_OPTIONS_COUNT) return;

		const pollOptions = convertToPollOptions(currentOptions);
		const newPollOptions = pollOptions.filter((option) => option.id !== idToDelete);
		const newStringOptions = convertToStringArray(newPollOptions);

		formData.setValue('pollOptions', newStringOptions);
		formData.trigger('pollOptions');
	};

	const handleOptionChange = (value: string, id: string) => {
		const currentOptions = formData.getValues('pollOptions') || ['', ''];
		const pollOptions = convertToPollOptions(currentOptions);
		const updatedPollOptions = pollOptions.map((option) => (option.id === id ? { ...option, value } : option));
		const newStringOptions = convertToStringArray(updatedPollOptions);

		formData.setValue('pollOptions', newStringOptions);
		formData.trigger('pollOptions');
	};

	return (
		<div className={classes.container}>
			<div className={classes.addPollHeader}>
				<span className={classes.addPollText}>{t('AddPoll.addPoll')}</span>
				<Switch
					checked={isActive}
					onCheckedChange={(checked) => {
						setIsActive(checked);
						formData.setValue('isAddingPoll', checked);
						if (checked) {
							initializeOptions();
						}
					}}
					disabled={disabled}
					className='h-5'
				/>
			</div>
			{isActive && (
				<div className={classes.addPollContent}>
					<Separator
						className={classes.addPollSeparator}
						orientation='horizontal'
					/>
					<FormField
						control={formData.control}
						name='pollTitle'
						key='pollTitle'
						disabled={disabled}
						rules={{
							required: true,
							validate: (value) => {
								if (!value) return t('AddPoll.titleRequired');
								return true;
							}
						}}
						render={({ field }) => (
							<FormItem>
								<FormLabel className={classes.addPollLabel}>{t('AddPoll.title')}</FormLabel>
								<FormControl>
									<Input
										value={field.value || ''}
										onChange={field.onChange}
										className='h-8 rounded-md'
										placeholder={t('AddPoll.titlePlaceholder')}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={formData.control}
						name='pollOptions'
						key='pollOptions'
						disabled={disabled}
						rules={{
							required: true,
							validate: (value) => {
								if (!value?.length || value.length < MIN_POLL_OPTIONS_COUNT) return t('AddPoll.optionsRequired');
								const filledOptions = value.filter((option) => option.trim() !== '');
								if (filledOptions.length < MIN_POLL_OPTIONS_COUNT) return `At least ${MIN_POLL_OPTIONS_COUNT} options must be filled`;
								if (value.length > MAX_POLL_OPTIONS_COUNT) return `Maximum ${MAX_POLL_OPTIONS_COUNT} options allowed`;

								// Check for duplicates
								const trimmedOptions = filledOptions.map((option) => option.trim().toLowerCase());
								const uniqueOptions = new Set(trimmedOptions);
								if (uniqueOptions.size !== trimmedOptions.length) {
									return t('AddPoll.optionsDuplicated');
								}

								return true;
							}
						}}
						render={({ field }) => (
							<FormItem>
								<FormLabel className={classes.addPollLabel}>{t('AddPoll.options')}</FormLabel>
								<FormControl>
									<PollOptions
										options={convertToPollOptions(field.value || [])}
										onChange={handleOptionChange}
										onAdd={handleAddOption}
										onDelete={handleDeleteOption}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={formData.control}
						name='pollEndDate'
						key='pollEndDate'
						disabled={disabled}
						rules={{
							required: true,
							validate: (value) => {
								if (!value) return t('AddPoll.endDateRequired');
								const now = new Date();
								if (value <= now) return t('AddPoll.endDateInFuture');
								return true;
							}
						}}
						render={({ field }) => (
							<FormItem>
								<FormLabel className={classes.addPollLabel}>{t('AddPoll.pollEndsIn')}</FormLabel>
								<FormControl>
									<Popover>
										<PopoverTrigger asChild>
											<Button
												variant='outline'
												className={`h-8 w-full justify-start gap-2 rounded-md border ${field.value ? 'text-text_primary' : 'text-placeholder'}`}
											>
												<CalendarRange className='h-4 w-4' />
												<span className='flex-1 text-left'>{field.value ? dayjs(field.value).format("Do MMM 'YY") : 'Select end date'}</span>
												{field.value && (
													<X
														className='h-4 w-4 cursor-pointer hover:text-red-500'
														onClick={(e) => {
															e.stopPropagation();
															field.onChange(undefined);
														}}
													/>
												)}
											</Button>
										</PopoverTrigger>
										<PopoverContent className='w-auto p-0'>
											<Calendar
												mode='single'
												selected={field.value}
												onSelect={field.onChange}
												disabled={(date) => date <= new Date()}
												className='text-basic_text'
											/>
										</PopoverContent>
									</Popover>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={formData.control}
						name='pollVoteTypes'
						disabled={disabled}
						render={({ field }) => (
							<FormItem>
								<FormLabel className={classes.addPollLabel}>{t('AddPoll.settings')}</FormLabel>
								<FormControl>
									<div className='space-y-3'>
										<div className={classes.addPollCheckbox}>
											<Checkbox
												id={EPollVotesType.ANONYMOUS}
												checked={field.value?.includes(EPollVotesType.ANONYMOUS) || false}
												onCheckedChange={(checked) => {
													const currentValues = field.value || [];
													if (checked) {
														// Add ANONYMOUS if not present
														if (!currentValues.includes(EPollVotesType.ANONYMOUS)) {
															field.onChange([...currentValues, EPollVotesType.ANONYMOUS]);
														}
													} else {
														// Remove ANONYMOUS
														field.onChange(currentValues.filter((type) => type !== EPollVotesType.ANONYMOUS));
													}
												}}
											/>
											<span className={cn(classes.addPollCheckboxLabel, 'dark:text-text_primary')}>{t('AddPoll.anonymousPolls')}</span>
										</div>

										<div className={classes.addPollCheckbox}>
											<Checkbox
												id={EPollVotesType.MASKED}
												checked={field.value?.includes(EPollVotesType.MASKED) || false}
												onCheckedChange={(checked) => {
													const currentValues = field.value || [];
													if (checked) {
														// Add MASKED if not present
														if (!currentValues.includes(EPollVotesType.MASKED)) {
															field.onChange([...currentValues, EPollVotesType.MASKED]);
														}
													} else {
														// Remove MASKED
														field.onChange(currentValues.filter((type) => type !== EPollVotesType.MASKED));
													}
												}}
											/>
											<span className={cn(classes.addPollCheckboxLabel, 'dark:text-text_primary')}>{t('AddPoll.maskedPolls')}</span>
										</div>
									</div>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
				</div>
			)}
		</div>
	);
}

export default AddPoll;
