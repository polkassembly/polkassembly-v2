// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { EProposalType, IPost, IErrorResponse } from '@/_shared/types';
import { NextApiClientService } from '@/app/_client-services/next_api_client_service';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/app/_shared-components/Dialog';
import PostDetails from '@/app/_shared-components/PostDetails/PostDetails';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';

function Referenda({ params }: { params: Promise<{ index: string }> }) {
	const router = useRouter();
	const [data, setData] = useState<IPost | null>(null);
	const [error, setError] = useState<IErrorResponse | null>(null);
	const [index, setIndex] = useState<string>('');
	const t = useTranslations();

	useEffect(() => {
		const fetchData = async () => {
			const { index: paramIndex } = await params;
			setIndex(paramIndex);
			const result = await NextApiClientService.fetchProposalDetailsApi(EProposalType.REFERENDUM_V2, paramIndex);
			if (result.error) {
				setError(result.error);
			} else {
				setData(result.data);
			}
		};
		fetchData();
	}, [params]);

	if (error || !data) return <div className='text-center text-text_primary'>{error?.message}</div>;

	const handleOpenChange = () => {
		router.back();
	};

	return (
		<Dialog
			defaultOpen
			open
			onOpenChange={handleOpenChange}
		>
			<DialogContent className='h-[80vh] max-w-5xl overflow-y-auto'>
				<DialogHeader>
					<DialogTitle>
						<p>{t('ListingTab.Referenda')}</p>
					</DialogTitle>
				</DialogHeader>
				<PostDetails
					index={index}
					postData={data}
				/>
			</DialogContent>
		</Dialog>
	);
}

export default Referenda;
