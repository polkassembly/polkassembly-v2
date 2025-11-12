// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { useState, type ChangeEvent, type FormEvent } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/app/_shared-components/Dialog/Dialog';
import { Button } from '@/app/_shared-components/Button';
import { Input } from '@/app/_shared-components/Input';
import { Label } from '@/app/_shared-components/Label';
import { Mail, Send, Twitter, ExternalLink, CheckCircle } from 'lucide-react';
import Link from 'next/link';

interface RequestToPresentModalProps {
	isOpen: boolean;
	onClose: () => void;
}

function RequestToPresentModal({ isOpen, onClose }: RequestToPresentModalProps) {
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

	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
		const { name, value } = e.target;
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
			await new Promise<void>((resolve) => {
				setTimeout(resolve, 1000);
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
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<Dialog
			open={isOpen}
			onOpenChange={onClose}
		>
			<DialogContent className='max-h-[90vh] max-w-screen-md overflow-y-auto p-4 text-text_primary sm:p-6'>
				<DialogHeader>
					<DialogTitle className='text-xl font-bold'>Request to Present</DialogTitle>
				</DialogHeader>

				<form
					onSubmit={handleSubmit}
					className='space-y-6'
				>
					<div className='grid grid-cols-1 gap-4'>
						<div className='space-y-2'>
							<Label htmlFor='fullName'>Full Name</Label>
							<Input
								id='fullName'
								name='fullName'
								type='text'
								placeholder='Type Here'
								value={formData.fullName}
								onChange={handleInputChange}
								required
							/>
						</div>
						<div className='space-y-2'>
							<Label htmlFor='organization'>Organization/Project</Label>
							<Input
								id='organization'
								name='organization'
								type='text'
								placeholder='Type Here'
								value={formData.organization}
								onChange={handleInputChange}
							/>
						</div>
					</div>

					<div className='space-y-2'>
						<Label>Do you have a proposal live?</Label>
						<div className='flex items-center gap-4'>
							<Label className='flex cursor-pointer items-center gap-2'>
								<input
									type='radio'
									name='hasProposal'
									value='yes'
									checked={formData.hasProposal === 'yes'}
									onChange={handleInputChange}
									className='accent-pink-600'
								/>
								<span>Yes</span>
							</Label>
							<Label className='flex cursor-pointer items-center gap-2'>
								<input
									type='radio'
									name='hasProposal'
									value='no'
									checked={formData.hasProposal === 'no'}
									onChange={handleInputChange}
									className='accent-pink-600'
								/>
								<span>No</span>
							</Label>
						</div>
					</div>

					<div className='space-y-2'>
						<Label htmlFor='referendumIndex'>Paste URL or Enter Referendum Index</Label>
						<Input
							id='referendumIndex'
							name='referendumIndex'
							type='text'
							placeholder='e.g., 1462'
							value={formData.referendumIndex}
							onChange={handleInputChange}
						/>
						{formData.referendumIndex && (
							<div className='flex items-center justify-between rounded-md bg-pink-50 p-2 text-sm text-pink-700'>
								<span className='font-medium'>#{formData.referendumIndex} Vehicle Data on Asset Hub (We&apos;re All Gonna Own It)</span>
								<Link
									href='/'
									target='_blank'
									rel='noopener noreferrer'
									className='flex items-center gap-1 text-pink-600 hover:underline'
								>
									View Proposal <ExternalLink size={16} />
								</Link>
							</div>
						)}
					</div>

					<div className='space-y-2'>
						<Label htmlFor='description'>Description & Objectives</Label>
						<textarea
							id='description'
							name='description'
							rows={4}
							className='flex w-full resize-none rounded-lg border border-border_grey bg-transparent px-2 py-2 text-base shadow-sm transition-colors placeholder:text-placeholder focus-visible:border-text_pink focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring'
							placeholder='Type Here'
							value={formData.description}
							onChange={handleInputChange}
						/>
					</div>

					<div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
						<div className='space-y-2'>
							<Label htmlFor='estimatedDuration'>Estimated Duration</Label>
							<select
								id='estimatedDuration'
								name='estimatedDuration'
								className='flex w-full rounded-lg border border-border_grey bg-transparent px-2 py-2 text-base shadow-sm focus-visible:border-text_pink focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring'
								value={formData.estimatedDuration}
								onChange={handleInputChange}
							>
								<option value=''>Select Duration</option>
								<option value='15 mins'>15 mins</option>
								<option value='30 mins'>30 mins</option>
								<option value='45 mins'>45 mins</option>
							</select>
						</div>
						<div className='space-y-2'>
							<Label htmlFor='preferredDate'>Preferred Date</Label>
							<Input
								id='preferredDate'
								name='preferredDate'
								type='date'
								value={formData.preferredDate}
								onChange={handleInputChange}
							/>
						</div>
					</div>

					<div className='space-y-2'>
						<div className='flex items-center justify-between'>
							<Label htmlFor='supportingFile'>Supporting Materials</Label>
							<span className='flex items-center gap-1 text-sm text-gray-500'>
								Upload File
								<svg
									xmlns='http://www.w3.org/2000/svg'
									fill='none'
									viewBox='0 0 24 24'
									strokeWidth={2}
									stroke='currentColor'
									className='h-4 w-4 text-gray-500'
								>
									<path
										strokeLinecap='round'
										strokeLinejoin='round'
										d='M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5-5m0 0l5 5m-5-5v12'
									/>
								</svg>
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
							<div className='flex w-full items-center justify-between rounded-lg border border-border_grey bg-transparent px-4 py-2 text-base text-gray-500'>
								<span>Upload</span>
							</div>
						</div>

						<p className='text-sm text-gray-500'>Accepted formats: PDF, DOC, DOCX, PPT, PPTX (Max 10MB)</p>
					</div>

					<div className='space-y-2'>
						<div className='flex items-center gap-2'>
							<Label className='font-semibold text-gray-700'>Socials</Label>
							<span className='cursor-help text-sm text-gray-400'>ℹ️</span>
						</div>

						<div className='space-y-4'>
							<div className='grid grid-cols-[auto_1fr] items-center gap-4'>
								<div className='flex min-w-28 items-center gap-2'>
									<div className='flex h-10 w-10 items-center justify-center rounded-full bg-green-500'>
										<Mail
											className='text-white'
											size={18}
										/>
									</div>
									<span className='font-medium text-gray-700'>Email</span>
								</div>

								<div className='flex items-center justify-between rounded-md border border-gray-300 px-4 py-2'>
									<input
										id='email'
										name='email'
										type='email'
										placeholder='janedoe123@gmail.com'
										value={formData.email}
										onChange={handleInputChange}
										className='w-full border-none bg-transparent text-gray-800 focus:outline-none focus:ring-0'
									/>
									<div className='flex items-center gap-1 whitespace-nowrap pl-3 text-sm font-medium text-green-500'>
										<CheckCircle size={16} /> Verified
									</div>
								</div>
							</div>

							<div className='grid grid-cols-[auto_1fr] items-center gap-4'>
								<div className='flex min-w-28 items-center gap-2'>
									<div className='flex h-10 w-10 items-center justify-center rounded-full bg-green-500'>
										<Send
											className='text-white'
											size={18}
										/>
									</div>
									<span className='font-medium text-gray-700'>TG</span>
								</div>

								<div className='flex items-center justify-between rounded-md border border-gray-300 px-4 py-2'>
									<input
										id='telegram'
										name='telegram'
										type='text'
										placeholder='@janedoe'
										value={formData.telegram}
										onChange={handleInputChange}
										className='w-full border-none bg-transparent text-gray-800 focus:outline-none focus:ring-0'
									/>
								</div>
							</div>

							<div className='grid grid-cols-[auto_1fr] items-center gap-4'>
								<div className='flex min-w-28 items-center gap-2'>
									<div className='flex h-10 w-10 items-center justify-center rounded-full bg-green-500'>
										<Twitter
											className='text-white'
											size={18}
										/>
									</div>
									<span className='font-medium text-gray-700'>Twitter</span>
								</div>

								<div className='flex items-center justify-between rounded-md border border-gray-300 px-4 py-2'>
									<input
										id='twitter'
										name='twitter'
										type='text'
										placeholder='@janedoe'
										value={formData.twitter}
										onChange={handleInputChange}
										className='w-full border-none bg-transparent text-gray-800 focus:outline-none focus:ring-0'
									/>
									<div className='flex items-center gap-1 whitespace-nowrap pl-3 text-sm font-medium text-green-500'>
										<CheckCircle size={16} /> Verified
									</div>
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
							className='border-pink-500 text-pink-600 hover:bg-pink-50'
						>
							Cancel
						</Button>
						<Button
							type='submit'
							disabled={isSubmitting}
							className='bg-pink-600 text-white hover:bg-pink-700'
						>
							{isSubmitting ? 'Submitting...' : 'Submit'}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}

export default RequestToPresentModal;
