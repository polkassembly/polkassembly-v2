// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { useForm } from 'react-hook-form';
import WritePost from '@/app/_shared-components/Create/WritePost/WritePost';
import { EOffChainPostTopic, EProposalType, IWritePostFormFields } from '@/_shared/types';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { NextApiClientService } from '@/app/_client-services/next_api_client_service';
import { useRouter } from 'next/navigation';
import { Form } from '@/app/_shared-components/Form';
import ErrorMessage from '@/app/_shared-components/ErrorMessage';
import { Button } from '@/app/_shared-components/Button';
import Link from 'next/link';
import { useUser } from '@/hooks/useUser';
import HeaderLabel from '../HeaderLabel';
import classes from './CreateDiscussion.module.scss';

function CreateDiscussion() {
	const formData = useForm<IWritePostFormFields>();

	const { user } = useUser();

	const t = useTranslations();
	const [loading, setLoading] = useState(false);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const router = useRouter();

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
			return;
		}

		formData.reset();
		setLoading(false);
		// redirect to the discussion page
		router.push(`/post/${data.data.index}`);
	};

	return (
		<div className={classes.container}>
			<div className={classes.header}>
				<HeaderLabel />
			</div>
			<div className='px-6 py-6 sm:px-12'>
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
							{t('Create.toCreate')}
						</p>
					) : (
						<>
							{errorMessage && <ErrorMessage errorMessage={errorMessage} />}
							<Form {...formData}>
								<form onSubmit={formData.handleSubmit(handleCreateDiscussionPost)}>
									<WritePost formData={formData} />
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
