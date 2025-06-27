// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { useRef, useState } from 'react';
import { EAllowedCommentor, EOffChainPostTopic, IWritePostFormFields } from '@/_shared/types';
import { UseFormReturn } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@ui/Form';
import { Input } from '@ui/Input';
import { useTranslations } from 'next-intl';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@ui/Tooltip';
import { ChevronDown, Info } from 'lucide-react';
import { MAX_POST_TAGS } from '@/_shared/_constants/maxPostTags';
import { MDXEditorMethods } from '@mdxeditor/editor';
import { cn } from '@/lib/utils';
import { RadioGroup, RadioGroupItem } from '../../RadioGroup/RadioGroup';
import { Label } from '../../Label';
import SelectTopic from '../../TopicTag/SelectTopic/SelectTopic';
import { AddTags } from '../AddTags/AddTags';
import classes from './WritePost.module.scss';
import { MarkdownEditor } from '../../MarkdownEditor/MarkdownEditor';
import AddPoll from '../AddPoll/AddPoll';
import { Separator } from '../../Separator';
import { Button } from '../../Button';

function WritePost({ formData, disabled }: { formData: UseFormReturn<IWritePostFormFields>; disabled?: boolean }) {
	const t = useTranslations();
	const markdownEditorRef = useRef<MDXEditorMethods | null>(null);
	const [isAdvanced, setIsAdvanced] = useState(false);

	const allowedCommentorsOptions = [
		{
			label: t('Create.AllowedCommentors.all'),
			value: EAllowedCommentor.ALL
		},
		{
			label: t('Create.AllowedCommentors.onchainVerified'),
			value: EAllowedCommentor.ONCHAIN_VERIFIED
		},
		{
			label: t('Create.AllowedCommentors.none'),
			value: EAllowedCommentor.NONE
		}
	];

	return (
		<div className={classes.form}>
			<FormField
				control={formData.control}
				name='title'
				key='title'
				disabled={disabled}
				defaultValue=''
				rules={{
					required: true,
					validate: (value) => {
						if (value.length <= 3) return t('Create.titleTooShort');
						return true;
					}
				}}
				render={({ field }) => (
					<FormItem>
						<FormLabel>{t('Create.title')}*</FormLabel>
						<FormControl>
							<Input
								disabled={disabled}
								placeholder={t('Create.titlePlaceholder')}
								type='text'
								className={classes.titleInput}
								{...field}
							/>
						</FormControl>
						<FormMessage />
					</FormItem>
				)}
			/>
			<FormField
				control={formData.control}
				name='description'
				key='description'
				disabled={disabled}
				rules={{
					required: true,
					validate: (value) => {
						if (!value) return t('Create.descriptionRequired');
						return true;
					}
				}}
				render={({ field }) => (
					<FormItem>
						<FormLabel>{t('Create.description')}*</FormLabel>
						<FormControl>
							<MarkdownEditor
								markdown={field.value || ''}
								onChange={(data) => {
									field.onChange(data);
								}}
								ref={markdownEditorRef}
							/>
						</FormControl>

						<FormMessage />
					</FormItem>
				)}
			/>
			<FormField
				control={formData.control}
				name='tags'
				key='tags'
				defaultValue={[]}
				disabled={disabled}
				render={({ field }) => (
					<FormItem>
						<FormLabel className='flex items-center justify-between'>
							<span>{t('Create.addTags')}</span>
							<span className={cn('text-xs text-basic_text', { 'text-toast_error_text': field.value.length >= MAX_POST_TAGS })}>
								{MAX_POST_TAGS - (formData.getValues('tags')?.length || 0)} {t('Create.tagsLeftText')}
							</span>
						</FormLabel>
						<FormControl>
							<AddTags
								disabled={disabled}
								onChange={(options) => {
									field.onChange(options);
								}}
							/>
						</FormControl>

						<FormMessage />
					</FormItem>
				)}
			/>
			<FormField
				control={formData.control}
				name='topic'
				key='topic'
				defaultValue={EOffChainPostTopic.GENERAL}
				disabled={disabled}
				render={({ field }) => (
					<FormItem>
						<FormLabel className='flex items-center justify-between'>
							<span>{t('Create.selectTopic')}* </span>
						</FormLabel>
						<FormControl>
							<SelectTopic
								disabled={disabled}
								onChange={(topic: EOffChainPostTopic) => {
									field.onChange(topic);
								}}
							/>
						</FormControl>
						<FormMessage />
					</FormItem>
				)}
			/>
			<AddPoll
				formData={formData}
				disabled={disabled || false}
			/>

			<div className={classes.advancedContainer}>
				<Button
					variant='ghost'
					type='button'
					aria-label={`${t('Create.AllowedCommentors.advanced')} - ${isAdvanced}`}
					className='flex h-5 w-full items-center justify-between p-0'
					onClick={() => setIsAdvanced(!isAdvanced)}
				>
					<span className='text-sm font-medium'>{t('Create.AllowedCommentors.advanced')}</span>
					<ChevronDown className={cn('text-text-grey h-5 w-5', isAdvanced ? 'rotate-180' : '')} />
				</Button>
				{isAdvanced && (
					<div className='mt-2 flex flex-col gap-2'>
						<Separator
							orientation='horizontal'
							className='bg-border_grey'
						/>
						<FormField
							control={formData.control}
							name='allowedCommentor'
							key='allowedCommentor'
							disabled={disabled}
							defaultValue={EAllowedCommentor.ALL}
							render={({ field }) => (
								<FormItem>
									<FormLabel className='mt-2 flex items-center gap-1'>
										<span>{t('Create.AllowedCommentors.title')} </span>
										<TooltipProvider>
											<Tooltip>
												<TooltipTrigger>
													<Info className='text-text-grey h-4 w-4' />
												</TooltipTrigger>
												<TooltipContent className='bg-tooltip_background p-2 text-white'>
													<p>{t('Create.AllowedCommentors.tooltip')}</p>
												</TooltipContent>
											</Tooltip>
										</TooltipProvider>
									</FormLabel>
									<FormControl>
										<RadioGroup
											disabled={disabled}
											defaultValue={EAllowedCommentor.ALL}
											className={classes.radioGroup}
											onValueChange={(e) => field.onChange(e)}
										>
											<div className='flex flex-row gap-2'>
												{allowedCommentorsOptions?.map((option) => {
													return (
														<div
															key={option.value}
															className='flex items-center space-x-2'
														>
															<RadioGroupItem
																value={option.value}
																id={option.value}
															/>
															<Label
																htmlFor={option.value}
																className={classes.radioGroupItem}
															>
																{option.label}
															</Label>
														</div>
													);
												})}
											</div>
										</RadioGroup>
									</FormControl>

									<FormMessage />
								</FormItem>
							)}
						/>
					</div>
				)}
			</div>
		</div>
	);
}

export default WritePost;
