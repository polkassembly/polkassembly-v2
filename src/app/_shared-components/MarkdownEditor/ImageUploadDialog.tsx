// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ENotificationStatus } from '@/_shared/types';
import { useToast } from '@/hooks/useToast';
import { MDXEditorMethods } from '@mdxeditor/editor';
import React, { useState } from 'react';
import { Link, Upload } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../Dialog/Dialog';
import { Button } from '../Button';
import { Input } from '../Input';

enum EImageUploadTab {
	UPLOAD = 'upload',
	URL = 'url'
}

function ImageUploadDialog({
	editorRef,
	imageUploadHandler,
	isDialogOpen,
	setIsDialogOpen
}: {
	editorRef: React.RefObject<MDXEditorMethods>;
	setIsDialogOpen: (open: boolean) => void;
	isDialogOpen: boolean;
	imageUploadHandler: (image: File) => Promise<string>;
}) {
	const t = useTranslations('Create.UploadImage');
	const { toast } = useToast();
	const [imageAlt, setImageAlt] = useState('');
	const [imageTitle, setImageTitle] = useState('');
	const [imageUrl, setImageUrl] = useState('');
	const [imageUploadTab, setImageUploadTab] = useState<EImageUploadTab>(EImageUploadTab.UPLOAD);
	const [imageUploading, setImageUploading] = useState(false);

	const handleImageInsertion = () => {
		try {
			const alt = imageAlt.trim() || 'image';
			const url = imageUrl.trim();

			if (!url || !editorRef.current) return;

			const imageMarkdown = `![${alt}](${url})\n`;
			editorRef.current.insertMarkdown(imageMarkdown);

			// Reset form and close modal
			setImageAlt('');
			setImageTitle('');
			setImageUrl('');
			setIsDialogOpen(false);
			setImageUploadTab(EImageUploadTab.UPLOAD);
		} catch (error) {
			console.error('Error inserting image:', error);
		}
	};
	const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		try {
			setImageUploading(true);
			const url = await imageUploadHandler(file);
			if (url) {
				setImageUrl(url);
				if (!imageAlt) {
					setImageAlt(file.name.replace(/[^\w\s.-]/g, '').trim() || 'image');
				}
			}
			setImageUploading(false);
		} catch (error) {
			console.error('Error handling file upload:', error);
			setImageUploading(false);
			toast({
				title: (error as string) || t('failedToUploadImage'),
				status: ENotificationStatus.ERROR
			});
		}
	};

	return (
		<div>
			<Dialog
				open={isDialogOpen}
				onOpenChange={setIsDialogOpen}
			>
				<DialogContent className='w-[400px] pb-4 pt-3 max-lg:max-w-max'>
					<DialogHeader className='px-4 py-2'>
						<DialogTitle>{t('uploadImage')}</DialogTitle>
					</DialogHeader>

					<div className='px-4 dark:text-white'>
						<div className='mb-4'>
							<div className='mb-4 flex w-full rounded-lg bg-bg_code p-1'>
								<Button
									variant='ghost'
									onClick={() => setImageUploadTab(EImageUploadTab.UPLOAD)}
									className={cn('mr-2 h-8 text-sm', imageUploadTab === EImageUploadTab.UPLOAD ? 'bg-bg_modal text-text_pink shadow-none' : '', 'w-full')}
									disabled={imageUploading}
								>
									<Upload /> {t('uploadFromDevice')}
								</Button>
								<Button
									variant='ghost'
									onClick={() => setImageUploadTab(EImageUploadTab.URL)}
									className={cn('h-8 w-full text-sm', imageUploadTab === EImageUploadTab.URL ? 'bg-bg_modal text-text_pink shadow-none' : '')}
									disabled={imageUploading}
								>
									<Link /> {t('addFromURL')}
								</Button>
							</div>

							{imageUploadTab === EImageUploadTab.UPLOAD ? (
								<Input
									type='file'
									accept='image/*'
									onChange={handleFileUpload}
									className='dark:text-white'
								/>
							) : (
								<Input
									placeholder='https://example.com/image.jpg'
									value={imageUrl}
									type='url'
									onChange={(e) => setImageUrl(e.target.value)}
									className='dark:text-white'
								/>
							)}
						</div>

						<div className='mb-4 mt-4'>
							<span className='mb-1 block text-sm'>{t('alt')}</span>
							<Input
								placeholder='Alternative text'
								value={imageAlt}
								onChange={(e) => setImageAlt(e.target.value)}
								className='dark:border-separatorDark dark:bg-section-dark-overlay h-10 dark:text-white'
							/>
						</div>

						<div className='mb-4'>
							<span className='mb-1 block text-sm'>{t('title')}</span>
							<Input
								placeholder='Image title'
								value={imageTitle}
								onChange={(e) => setImageTitle(e.target.value)}
								className='dark:border-separatorDark dark:bg-section-dark-overlay h-10 dark:text-white'
							/>
						</div>
					</div>
					<DialogFooter className='px-4'>
						<div className='flex items-center justify-end gap-2'>
							<Button
								key='cancel'
								variant='outline'
								onClick={() => setIsDialogOpen(false)}
								className='border-separatorDark h-8 w-[80px] bg-transparent text-sm text-white'
							>
								{t('cancel')}
							</Button>
							<Button
								key='save'
								variant='default'
								onClick={handleImageInsertion}
								disabled={!imageUrl}
								isLoading={imageUploading}
								className='h-8 w-[80px] border-none bg-bg_pink text-sm text-white'
							>
								{t('save')}
							</Button>
						</div>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}

export default ImageUploadDialog;
