// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import React, { useState } from 'react';
import { Button } from '@/app/_shared-components/Button';
import { Input } from '@/app/_shared-components/Input';
import { Label } from '@/app/_shared-components/Label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/app/_shared-components/Dialog/Dialog';
import { NextApiClientService } from '@/app/_client-services/next_api_client_service';

interface KlaraFeedbackFormProps {
	userId?: string;
	conversationId?: string;
	messageId?: string;
	isDislike?: boolean;
}

export default function KlaraFeedbackForm({ userId, conversationId, messageId, isDislike = false }: Readonly<KlaraFeedbackFormProps>) {
	const [formData, setFormData] = useState({
		firstName: '',
		lastName: '',
		email: '',
		feedbackText: ''
	});

	const [isSubmitting, setIsSubmitting] = useState(false);
	const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
	const [errorMessage, setErrorMessage] = useState('');
	const [showSuccessModal, setShowSuccessModal] = useState(false);

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value
		}));
	};

	const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
	React.useEffect(() => {
		return () => {
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
			}
		};
	}, []);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsSubmitting(true);
		setErrorMessage('');

		try {
			await NextApiClientService.submitKlaraFeedback({
				firstName: formData.firstName,
				lastName: formData.lastName,
				email: formData.email,
				feedbackText: formData.feedbackText,
				userId: userId || '',
				conversationId: conversationId || '',
				messageId: messageId || '',
				rating: isDislike ? 1 : 5, // Set rating to 1 for dislike, 5 for like
				feedbackType: 'form_submission',
				queryText: '',
				responseText: ''
			});

			setSubmitStatus('success');
			setShowSuccessModal(true);

			// Clear form data on success
			setFormData({
				firstName: '',
				lastName: '',
				email: '',
				feedbackText: ''
			});

			// Auto-close modal after 10 seconds
			timeoutRef.current = setTimeout(() => {
				setShowSuccessModal(false);
				// Try to close the tab if it was opened in a new window
				if (window.opener) {
					window.close();
				}
			}, 10000);
		} catch (error) {
			console.error('Feedback submission error:', error);
			setSubmitStatus('error');
			setErrorMessage('Failed to submit feedback. Please try again.');
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleCloseModal = () => {
		setShowSuccessModal(false);
		// Try to close the tab if it was opened in a new window
		if (window.opener) {
			window.close();
		}
	};

	return (
		<div className='min-h-screen bg-page_background'>
			{/* Header */}
			<div className='bg-gradient-to-r from-red-500 to-pink-500 py-8 text-white'>
				<div className='mx-auto max-w-2xl px-4'>
					<h1 className='mb-2 text-2xl font-bold'>Please drop your contact info*</h1>
					{isDislike && <p className='text-sm opacity-90'>Since you have disliked it, please provide a review here</p>}
					<div className='mt-4 text-sm opacity-75'>
						<p>🚀 Klara Feedback Form - Help us improve your experience</p>
					</div>
				</div>
			</div>

			{/* Form */}
			<div className='mx-auto max-w-2xl px-4 py-8'>
				<div className='rounded-lg bg-bg_modal p-8 shadow-lg'>
					<form
						onSubmit={handleSubmit}
						className='space-y-6'
					>
						{/* First Name */}
						<div>
							<Label
								htmlFor='firstName'
								className='mb-2 block text-sm font-medium text-text_primary'
							>
								First name <span className='text-failure'>*</span>
							</Label>
							<Input
								type='text'
								id='firstName'
								name='firstName'
								value={formData.firstName}
								onChange={handleInputChange}
								required
								placeholder='Jane'
							/>
						</div>

						{/* Last Name */}
						<div>
							<Label
								htmlFor='lastName'
								className='mb-2 block text-sm font-medium text-text_primary'
							>
								Last name <span className='text-failure'>*</span>
							</Label>
							<Input
								type='text'
								id='lastName'
								name='lastName'
								value={formData.lastName}
								onChange={handleInputChange}
								required
								placeholder='Smith'
							/>
						</div>

						{/* Email */}
						<div>
							<Label
								htmlFor='email'
								className='mb-2 block text-sm font-medium text-text_primary'
							>
								Email <span className='text-failure'>*</span>
							</Label>
							<Input
								type='email'
								id='email'
								name='email'
								value={formData.email}
								onChange={handleInputChange}
								required
								placeholder='name@example.com'
							/>
						</div>

						{/* Feedback Text */}
						<div>
							<Label
								htmlFor='feedbackText'
								className='mb-2 block text-sm font-medium text-text_primary'
							>
								Additional Feedback
							</Label>
							<textarea
								id='feedbackText'
								name='feedbackText'
								value={formData.feedbackText}
								onChange={handleInputChange}
								rows={5}
								className='flex w-full resize-none rounded-lg border border-border_grey bg-transparent px-2 py-2 text-base shadow-sm transition-colors placeholder:text-placeholder focus-visible:border-text_pink focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 max-sm:text-sm sm:px-4 sm:py-3 md:text-sm'
								placeholder='Please share your thoughts, suggestions, or issues you encountered...'
							/>
						</div>

						{/* Error Message */}
						{submitStatus === 'error' && (
							<div className='rounded-md border border-red-200 bg-red-50 p-4'>
								<p className='text-red-800'>{errorMessage}</p>
							</div>
						)}

						{/* Submit Button */}
						<div className='flex justify-center pt-6'>
							<Button
								type='submit'
								disabled={isSubmitting}
								isLoading={isSubmitting}
								loadingText='Submitting...'
								className='px-12 py-4 text-lg'
								variant='default'
							>
								OK
							</Button>
						</div>
					</form>
				</div>
			</div>

			{/* Footer */}
			<div className='bg-bg_modal py-6'>
				<div className='text-text_secondary mx-auto max-w-2xl px-4 text-center text-sm'>
					<p>Thank you for helping us improve Klara! Your feedback is valuable to us.</p>
				</div>
			</div>

			{/* Success Modal */}
			<Dialog
				open={showSuccessModal}
				onOpenChange={setShowSuccessModal}
			>
				<DialogContent className='max-w-md p-6'>
					<DialogHeader>
						<DialogTitle className='text-center text-2xl font-bold text-text_primary'>Thank You!</DialogTitle>
						<DialogDescription className='text-text_secondary text-center'>Your feedback has been submitted successfully.</DialogDescription>
					</DialogHeader>
					<div className='flex flex-col items-center space-y-4'>
						<div className='text-6xl text-green-600'>✓</div>
						<p className='text-center text-sm text-placeholder'>This modal will close automatically in a few seconds...</p>
						<Button
							onClick={handleCloseModal}
							className='w-full'
							variant='default'
						>
							Close
						</Button>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
}
