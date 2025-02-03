// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { EAllowedCommentor, EOffChainPostTopic, IWritePostFormFields } from '@/_shared/types';
import { UseFormReturn } from 'react-hook-form';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@ui/Form';
import { Input } from '@ui/Input';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@ui/Tooltip';
import { MessageCircleWarning } from 'lucide-react';
import { Button } from '../../Button';
import BlockEditor from '../../BlockEditor/BlockEditor';
import { RadioGroup, RadioGroupItem } from '../../RadioGroup/RadioGroup';
import { Label } from '../../Label';
import SelectTopic from '../../TopicTag/SelectTopic/SelectTopic';
import { AddTags } from '../AddTags/AddTags';
import classes from './WritePost.module.scss';
import LoadingLayover from '../../LoadingLayover';

const MAX_TAGS = 5;
function WritePost({ formData, handleSubmit }: { formData: UseFormReturn<IWritePostFormFields>; handleSubmit: (values: IWritePostFormFields) => Promise<void> }) {
	const t = useTranslations();
	const [loading, setLoading] = useState(false);

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

	const onSubmit = async (values: IWritePostFormFields) => {
		setLoading(true);
		await handleSubmit(values);
		setLoading(false);
	};

	return (
		<div className={classes.container}>
			{loading && <LoadingLayover />}
			<Form {...formData}>
				<form onSubmit={formData.handleSubmit(onSubmit)}>
					<div className={classes.form}>
						<FormField
							control={formData.control}
							name='title'
							key='title'
							disabled={loading}
							defaultValue=''
							rules={{
								required: true,
								validate: (value) => {
									if (value.length <= 3) return 'Please provide a valid title.';
									return true;
								}
							}}
							render={({ field }) => (
								<FormItem>
									<FormLabel>{t('Create.title')}*</FormLabel>
									<FormControl>
										<Input
											disabled={loading}
											placeholder='Enter title'
											type='text'
											className={classes.titleInput}
											onChange={(e) => field.onChange(e.target.value)}
											value={field.value}
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
							disabled={loading}
							rules={{
								required: true,
								validate: (value) => {
									if (!value) return 'Please provide a valid description.';
									return true;
								}
							}}
							render={({ field }) => (
								<FormItem>
									<FormLabel>{t('Create.description')}*</FormLabel>
									<FormControl>
										<BlockEditor
											className={classes.editor}
											id='write-post-editor'
											onChange={(data) => {
												field.onChange(data);
											}}
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
							disabled={loading}
							render={({ field }) => (
								<FormItem>
									<FormLabel className='flex items-center justify-between'>
										<span>{t('Create.addTags')}</span>
										<span className='text-xs text-basic_text'>
											{MAX_TAGS - (formData.getValues('tags')?.length || 0)} {t('Create.tagsLeftText')}
										</span>
									</FormLabel>
									<FormControl>
										<AddTags
											disabled={loading}
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
							disabled={loading}
							render={({ field }) => (
								<FormItem>
									<FormLabel className='flex items-center justify-between'>
										<span>{t('Create.selectTopic')}* </span>
									</FormLabel>
									<FormControl>
										<SelectTopic
											disabled={loading}
											onChange={(topic: EOffChainPostTopic) => {
												field.onChange(topic);
											}}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={formData.control}
							name='allowedCommentors'
							key='allowedCommentors'
							disabled={loading}
							defaultValue={EAllowedCommentor.ALL}
							render={({ field }) => (
								<FormItem>
									<FormLabel className='flex items-center gap-1'>
										<span>{t('Create.AllowedCommentors.title')} </span>
										<TooltipProvider>
											<Tooltip>
												<TooltipTrigger>
													<MessageCircleWarning className='text-text-grey h-4 w-4' />
												</TooltipTrigger>
												<TooltipContent className='bg-tooltip_background p-2 text-white'>
													<p>{t('Create.AllowedCommentors.tooltip')}</p>
												</TooltipContent>
											</Tooltip>
										</TooltipProvider>
									</FormLabel>
									<FormControl>
										<RadioGroup
											disabled={loading}
											defaultValue={EAllowedCommentor.ALL}
											className={classes.radioGroup}
											onValueChange={(e) => field.onChange(e)}
										>
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
										</RadioGroup>
									</FormControl>

									<FormMessage />
								</FormItem>
							)}
						/>
					</div>
					{/* {errorMessage && <ErrorMessage errorMessage={errorMessage} />} */}
					<div className='mt-4 flex justify-end'>
						<Button
							size='lg'
							className='px-12'
							type='submit'
							isLoading={loading}
						>
							{t('Create.create')}
						</Button>
					</div>
				</form>
			</Form>{' '}
		</div>
	);
}

export default WritePost;
