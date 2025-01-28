// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import React from 'react';
import WritePost from '@/app/_shared-components/Create/WritePost/WritePost';
import { useForm } from 'react-hook-form';
import { EOffchainPostTopic, EProposalType, IWritePostFormFields } from '@/_shared/types';
import { NextApiClientService } from '@/app/_client-services/next_api_client_service';
import { ClientError } from '@/app/_client-utils/clientError';
import { OutputData } from '@editorjs/editorjs';
import { useRouter } from 'next/navigation';
import classes from './CreateDiscussion.module.scss';
import HeaderLabel from '../HeaderLable';

function CreateDiscussion({ isModal }: { isModal?: boolean }) {
	const router = useRouter();
	const formData = useForm<IWritePostFormFields>();

	const handleSubmit = async (values: IWritePostFormFields) => {
		const { data, error } = await NextApiClientService.createOffChainPostApi({
			proposalType: EProposalType.DISCUSSION,
			content: values.description as unknown as OutputData,
			title: values.title || '',
			allowedCommentor: values.allowCommentors,
			tags: values?.tags?.map((tag) => tag?.value) || [],
			topic: values.topic || EOffchainPostTopic.GENERAL
		});

		if (error) {
			throw new ClientError(error.message || 'Failed to fetch data');
		}

		if (data?.data && data.data?.index) {
			formData.reset();
			// redirect to the discussion page
			router.push(`/discussion/${data?.data?.index}`);
		}
	};
	return (
		<div className={classes.container}>
			{!isModal && (
				<div className={classes.header}>
					<HeaderLabel />
				</div>
			)}
			<div className={!isModal ? 'px-6 py-6 sm:px-12' : ''}>
				<WritePost
					formData={formData}
					handleSubmit={handleSubmit}
				/>
			</div>
		</div>
	);
}

export default CreateDiscussion;
