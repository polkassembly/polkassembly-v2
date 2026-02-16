// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { useState, useRef, type ChangeEvent, type FormEvent } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/app/_shared-components/Dialog/Dialog';
import { Button } from '@/app/_shared-components/Button';
import { Input } from '@/app/_shared-components/Input';
import { Label } from '@/app/_shared-components/Label';
import FileUploadIcon from '@assets/icons/aag/file-upload.svg';
import { Mail, Send, Twitter, ExternalLink, Info } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { ETheme, ENotificationStatus, EProposalType } from '@/_shared/types';
import { useToast } from '@/hooks/useToast';
import { useTranslations } from 'next-intl';
import { NextApiClientService } from '@/app/_client-services/next_api_client_service';

interface RequestToPresentModalProps {
	isOpen: boolean;
	onClose: () => void;
}

function RequestToPresentModal({ isOpen, onClose }: RequestToPresentModalProps) {
	const t = useTranslations('AAG.requestToPresentModal');
	const [formData, setFormData] = useState({
		fullName: '',
		organization: '',
		hasProposal: 'yes',
		referendumIndex: '',
		description: '',
		estimatedDuration: '',
		preferredDate: '',
		supportingFile: null as File | null,
		email: '',
		telegram: '',
		twitter: ''
	});
	const { userPreferences } = useUserPreferences();
	const { toast } = useToast();

	const [isSubmitting, setIsSubmitting] = useState(false);
	const [referendumData, setReferendumData] = useState<{
		id: string;
		title: string;
		loading: boolean;
		error: string | null;
	} | null>(null);

	const referendumRequestIdRef = useRef(0);

	const extractReferendumId = (input: string): string | null => {
		if (!input.trim()) return null;

		if (input.includes('/referenda/')) {
			const match = input.match(/\/referenda\/(\d+)/);
			return match ? match[1] : null;
		}

		if (/^\d+$/.test(input.trim())) {
			return input.trim();
		}

		return null;
	};

	const fetchReferendumData = async (id: string) => {
		const requestId = referendumRequestIdRef.current + 1;
		referendumRequestIdRef.current = requestId;
		setReferendumData({ id, title: '', loading: true, error: null });

		try {
			const { data, error } = await NextApiClientService.fetchProposalDetails({
				proposalType: EProposalType.REFERENDUM_V2,
				indexOrHash: id
			});

			if (requestId !== referendumRequestIdRef.current) {
				return;
			}

			if (error || !data) {
				setReferendumData({ id, title: '', loading: false, error: t('proposalNotFound') });
			} else if (data.title) {
				setReferendumData({ id, title: data.title, loading: false, error: null });
			} else {
				setReferendumData({ id, title: '', loading: false, error: t('proposalNotFound') });
			}
		} catch {
			if (requestId !== referendumRequestIdRef.current) {
				return;
			}
			setReferendumData({ id, title: '', loading: false, error: t('failedToFetchProposal') });
		}
	};

	const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
		const { name, value } = e.target;

		if (name === 'preferredDate') {
			const now = new Date();
			const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
			const [year, month, day] = value.split('-').map(Number);
			const selectedDate = new Date(year, (month || 1) - 1, day || 1);

			if (selectedDate < startOfToday) {
				toast({
					status: ENotificationStatus.ERROR,
					title: t('invalidDate'),
					description: t('invalidDateDescription')
				});
				return;
			}
		}

		if (name === 'referendumIndex') {
			const referendumId = extractReferendumId(value);
			if (referendumId) {
				fetchReferendumData(referendumId);
			} else if (value.trim() === '') {
				setReferendumData(null);
			} else {
				setReferendumData({ id: '', title: '', loading: false, error: t('invalidReferendum') });
			}
		}

		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0] || null;
		setFormData((prev) => ({ ...prev, supportingFile: file }));
	};

	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault();
		setIsSubmitting(true);

		try {
			const submitData = new FormData();

			submitData.append('fullName', formData.fullName);
			submitData.append('organization', formData.organization);
			submitData.append('hasProposal', formData.hasProposal);
			submitData.append('referendumIndex', formData.referendumIndex);
			submitData.append('description', formData.description);
			submitData.append('estimatedDuration', formData.estimatedDuration);
			submitData.append('preferredDate', formData.preferredDate);
			submitData.append('email', formData.email);
			submitData.append('telegram', formData.telegram);
			submitData.append('twitter', formData.twitter);

			if (formData.supportingFile) {
				submitData.append('supportingFile', formData.supportingFile);
			}

			const { data, error } = await NextApiClientService.postAAGRequest(submitData);

			if (error) {
				throw new Error(error.message || 'Failed to submit request');
			}

			toast({
				status: ENotificationStatus.SUCCESS,
				title: t('requestSubmitted'),
				description: data?.message || t('requestSubmittedDescription')
			});

			onClose();

			setFormData({
				fullName: '',
				organization: '',
				hasProposal: 'yes',
				referendumIndex: '',
				description: '',
				estimatedDuration: '',
				preferredDate: '',
				supportingFile: null,
				email: '',
				telegram: '',
				twitter: ''
			});
			setReferendumData(null);
		} catch (error) {
			toast({
				status: ENotificationStatus.ERROR,
				title: t('submissionFailed'),
				description: error instanceof Error ? error.message : t('submissionFailedDescription')
			});
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<Dialog
			open={isOpen}
			onOpenChange={onClose}
		>
			<DialogContent className='max-h-[90vh] max-w-screen-md overflow-y-auto p-4 text-wallet_btn_text sm:p-6'>
				<DialogHeader>
					<DialogTitle className='text-xl font-bold'>{t('title')}</DialogTitle>
				</DialogHeader>

				<form
					onSubmit={handleSubmit}
					className='space-y-6'
				>
					<div className='grid grid-cols-1 gap-4'>
						<div className='space-y-2'>
							<Label htmlFor='fullName'>{t('fullName')}</Label>
							<Input
								id='fullName'
								name='fullName'
								type='text'
								placeholder={t('typeHere')}
								className='text-text_primary'
								value={formData.fullName}
								onChange={handleInputChange}
								required
							/>
						</div>
						<div className='space-y-2'>
							<Label htmlFor='organization'>{t('organization')}</Label>
							<Input
								id='organization'
								name='organization'
								type='text'
								placeholder={t('typeHere')}
								className='text-text_primary'
								value={formData.organization}
								onChange={handleInputChange}
							/>
						</div>
					</div>

					<div className='space-y-2'>
						<Label>{t('hasProposal')}</Label>
						<div className='flex items-center gap-4'>
							<Label className='flex cursor-pointer items-center gap-2'>
								<input
									type='radio'
									name='hasProposal'
									value='yes'
									checked={formData.hasProposal === 'yes'}
									onChange={handleInputChange}
									className='accent-text_pink'
								/>
								<span>{t('yes')}</span>
							</Label>
							<Label className='flex cursor-pointer items-center gap-2'>
								<input
									type='radio'
									name='hasProposal'
									value='no'
									checked={formData.hasProposal === 'no'}
									onChange={handleInputChange}
									className='accent-text_pink'
								/>
								<span>{t('no')}</span>
							</Label>
						</div>
					</div>

					<div className='space-y-2'>
						<Label htmlFor='referendumIndex'>{t('referendumIndex')}</Label>
						<Input
							id='referendumIndex'
							name='referendumIndex'
							type='text'
							placeholder={t('referendumPlaceholder')}
							className='text-text_primary'
							value={formData.referendumIndex}
							onChange={handleInputChange}
						/>
						{referendumData && (
							<div className={`rounded-md p-2 text-sm ${referendumData.error ? 'border border-red-200 bg-red-50 text-red-600' : 'bg-bg_light_pink text-text_pink'}`}>
								{referendumData.loading ? (
									<span>{t('loadingProposal')}</span>
								) : referendumData.error ? (
									<span>{referendumData.error}</span>
								) : (
									<div className='flex items-center justify-between'>
										<span className='font-medium'>
											#{referendumData.id} {referendumData.title}
										</span>
										<Link
											href={`/referenda/${referendumData.id}`}
											target='_blank'
											rel='noopener noreferrer'
											className='flex items-center gap-1 text-text_pink hover:underline'
										>
											{t('viewProposal')} <ExternalLink size={16} />
										</Link>
									</div>
								)}
							</div>
						)}
					</div>

					<div className='space-y-2'>
						<Label htmlFor='description'>{t('description')}</Label>
						<textarea
							id='description'
							name='description'
							rows={4}
							className='flex w-full resize-none rounded-lg border border-border_grey bg-transparent px-2 py-2 text-base text-text_primary shadow-sm transition-colors placeholder:text-placeholder focus-visible:border-text_pink focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring'
							placeholder={t('typeHere')}
							value={formData.description}
							onChange={handleInputChange}
						/>
					</div>

					<div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
						<div className='space-y-2'>
							<Label htmlFor='estimatedDuration'>{t('estimatedDuration')}</Label>
							<select
								id='estimatedDuration'
								name='estimatedDuration'
								className='flex w-full rounded-lg border border-border_grey bg-transparent px-2 py-2 text-base shadow-sm focus-visible:border-text_pink focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring'
								value={formData.estimatedDuration}
								onChange={handleInputChange}
							>
								<option value=''>{t('selectDuration')}</option>
								<option value='15 mins'>{t('duration15')}</option>
								<option value='30 mins'>{t('duration30')}</option>
								<option value='45 mins'>{t('duration45')}</option>
							</select>
						</div>
						<div className='space-y-2'>
							<Label htmlFor='preferredDate'>{t('preferredDate')}</Label>
							<Input
								id='preferredDate'
								name='preferredDate'
								type='date'
								min={new Date().toISOString().split('T')[0]}
								value={formData.preferredDate}
								onChange={handleInputChange}
							/>
						</div>
					</div>

					<div className='space-y-2'>
						<div className='flex items-center justify-between'>
							<Label htmlFor='supportingFile'>{t('supportingMaterials')}</Label>
							<span className='flex items-center gap-1 text-sm'>
								{t('uploadFile')}
								<Image
									src={FileUploadIcon}
									alt='AAG Logo'
									width={24}
									height={24}
									className={`h-4 w-4 ${userPreferences.theme === ETheme.DARK ? 'darkIcon' : ''}`}
								/>
							</span>
						</div>

						<div className='relative'>
							<input
								id='supportingFile'
								name='supportingFile'
								type='file'
								accept='.pdf,.doc,.docx,.ppt,.pptx'
								onChange={handleFileChange}
								className='absolute inset-0 cursor-pointer opacity-0'
							/>
							<div className='flex w-full items-center justify-between rounded-lg border border-border_grey bg-transparent px-4 py-2 text-base'>
								<span>{formData.supportingFile ? formData.supportingFile.name : t('upload')}</span>
							</div>
						</div>

						<p className='text-sm'>{t('acceptedFormats')}</p>
					</div>

					<div className='space-y-2'>
						<div className='flex items-center gap-2'>
							<Label className='font-semibold'>{t('socials')}</Label>
							<Info className='h-4 w-4' />
						</div>

						<div className='space-y-4'>
							<div className='grid grid-cols-[auto_1fr] items-center gap-4'>
								<div className='flex min-w-28 items-center gap-2'>
									<div className='flex h-10 w-10 items-center justify-center rounded-full bg-social_green'>
										<Mail
											className='text-btn_primary_text'
											size={18}
										/>
									</div>
									<span className='font-medium'>{t('email')}</span>
								</div>

								<div className='flex items-center justify-between rounded-md border border-border_grey px-4 py-2'>
									<input
										id='email'
										name='email'
										type='email'
										placeholder={t('emailPlaceholder')}
										value={formData.email}
										onChange={handleInputChange}
										className='w-full border-none bg-transparent text-text_primary focus:outline-none focus:ring-0'
									/>
								</div>
							</div>

							<div className='grid grid-cols-[auto_1fr] items-center gap-4'>
								<div className='flex min-w-28 items-center gap-2'>
									<div className='flex h-10 w-10 items-center justify-center rounded-full bg-social_green'>
										<Send
											className='text-btn_primary_text'
											size={18}
										/>
									</div>
									<span className='font-medium'>{t('telegram')}</span>
								</div>

								<div className='flex items-center justify-between rounded-md border border-border_grey px-4 py-2'>
									<input
										id='telegram'
										name='telegram'
										type='text'
										placeholder={t('telegramPlaceholder')}
										value={formData.telegram}
										onChange={handleInputChange}
										className='w-full border-none bg-transparent text-text_primary focus:outline-none focus:ring-0'
									/>
								</div>
							</div>

							<div className='grid grid-cols-[auto_1fr] items-center gap-4'>
								<div className='flex min-w-28 items-center gap-2'>
									<div className='flex h-10 w-10 items-center justify-center rounded-full bg-social_green'>
										<Twitter
											className='text-btn_primary_text'
											size={18}
										/>
									</div>
									<span className='font-medium'>{t('twitter')}</span>
								</div>

								<div className='flex items-center justify-between rounded-md border border-border_grey px-4 py-2'>
									<input
										id='twitter'
										name='twitter'
										type='text'
										placeholder={t('twitterPlaceholder')}
										value={formData.twitter}
										onChange={handleInputChange}
										className='w-full border-none bg-transparent text-text_primary focus:outline-none focus:ring-0'
									/>
								</div>
							</div>
						</div>
					</div>

					<DialogFooter className='gap-3 pt-4'>
						<Button
							type='button'
							variant='outline'
							onClick={onClose}
							disabled={isSubmitting}
							className='border-bg_pink text-text_pink'
						>
							{t('cancel')}
						</Button>
						<Button
							type='submit'
							disabled={isSubmitting}
							className='bg-bg_pink text-btn_primary_text hover:bg-bg_pink/90'
						>
							{isSubmitting ? t('submitting') : t('submit')}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}

export default RequestToPresentModal;
