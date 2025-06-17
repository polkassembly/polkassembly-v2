// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { useForm } from 'react-hook-form';
import WritePost from '@/app/_shared-components/Create/WritePost/WritePost';
import { ENotificationStatus, EOffChainPostTopic, EProposalType, IWritePostFormFields } from '@/_shared/types';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { NextApiClientService } from '@/app/_client-services/next_api_client_service';
import { Form } from '@/app/_shared-components/Form';
import ErrorMessage from '@/app/_shared-components/ErrorMessage';
import { Button } from '@/app/_shared-components/Button';
import Link from 'next/link';
import { useUser } from '@/hooks/useUser';
import { useRouter } from 'nextjs-toploader/app';
import { useToast } from '@/hooks/useToast';
import { useSuccessModal } from '@/hooks/useSuccessModal';
import { LoadingSpinner } from '@/app/_shared-components/LoadingSpinner';
import HeaderLabel from '../HeaderLabel';
import classes from './CreateDiscussion.module.scss';

function SuccessModalContent({ proposalId }: { proposalId: number }) {
	const t = useTranslations();

	return (
		<div className='flex flex-col items-center gap-y-4'>
			<p className='text-xl font-semibold text-text_primary'>{t('CreateProposal.Congratulations')}</p>
			<p className='flex items-center gap-x-2 text-sm font-medium text-wallet_btn_text'>
				<Link
					href={`/post/${proposalId}`}
					className='text-base font-semibold text-text_pink underline'
				>
					{t('CreateProposal.discussion')} #{proposalId}
				</Link>{' '}
				{t('CreateProposal.createdSuccessfully')}
			</p>
			<div className='flex items-center gap-x-2'>
				<p className='text-sm font-medium text-wallet_btn_text'>{t('CreateProposal.redirectingToPost')}</p>
				<LoadingSpinner size='small' />
			</div>
		</div>
	);
}

function CreateDiscussion() {
	const formData = useForm<IWritePostFormFields>();

	const { user } = useUser();

	const t = useTranslations();
	const [loading, setLoading] = useState(false);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const router = useRouter();

	const { toast } = useToast();
	const { setOpenSuccessModal, setSuccessModalContent } = useSuccessModal();

	const handleCreateDiscussionPost = async (values: IWritePostFormFields) => {
		const { title, description, tags, topic, allowedCommentor } = values;
		if (!title || !description) return;

		setLoading(true);
		const { data, error } = await NextApiClientService.createOffChainPost({
			proposalType: EProposalType.DISCUSSION,
			content: description,
			title,
			allowedCommentor,
			tags,
			topic: topic || EOffChainPostTopic.GENERAL
		});

		if (error || !data || !data?.data?.index) {
			setLoading(false);
			setErrorMessage(error?.message || 'Failed to create discussion');
			toast({
				title: t('Create.discussionCreationFailed'),
				description: error?.message || t('Create.discussionCreationFailedDescription'),
				status: ENotificationStatus.ERROR
			});
			return;
		}

		formData.reset();
		toast({
			title: t('Create.discussionCreatedSuccessfully'),
			status: ENotificationStatus.SUCCESS
		});

		setSuccessModalContent(<SuccessModalContent proposalId={data.data.index} />);
		setOpenSuccessModal(true);

		// redirect to the discussion page
		router.push(`/post/${data.data.index}`);
	};

	return (
		<div className={classes.container}>
			<div className={classes.header}>
				<HeaderLabel />
			</div>
			<div className='px-4 py-4 sm:px-12'>
				<div className='relative flex flex-col gap-y-4'>
					{!user ? (
						<p className='flex items-center gap-x-1 text-center text-sm text-text_primary'>
							{t('Create.please')}
							<Link
								href='/login'
								className='text-text_pink'
							>
								{t('Create.login')}
							</Link>{' '}
							{t('Create.toCreateDiscussion')}
						</p>
					) : (
						<>
							{errorMessage && <ErrorMessage errorMessage={errorMessage} />}
							<Form {...formData}>
								<form onSubmit={formData.handleSubmit(handleCreateDiscussionPost)}>
									<WritePost
										disabled={loading}
										formData={formData}
									/>
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
							</Form>
						</>
					)}
				</div>
			</div>
		</div>
	);
}

export default CreateDiscussion;
