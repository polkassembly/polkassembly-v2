// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React from 'react';
import Header from '@ui/Preimages/Header/Header';
import ListingTable from '@/app/_shared-components/Preimages/ListingTable/ListingTable';
import { NextApiClientService } from '@/app/_client-services/next_api_client_service';
import { Metadata } from 'next';
import { OPENGRAPH_METADATA } from '@/_shared/_constants/opengraphMetadata';
import { getNetworkFromHeaders } from '@/app/api/_api-utils/getNetworkFromHeaders';
import { NETWORKS_DETAILS } from '@/_shared/_constants/networks';
import { Tabs, TabsContent } from '@/app/_shared-components/Tabs';
import { EPreImageTabs } from '@/_shared/types';
import SearchBar from '@ui/Preimages/SearchBar/SearchBar';
import UserPreimageCheck from '@ui/Preimages/UserPreimagesTab/UserPreimageCheck';
import styles from '@ui/Preimages/SearchBar/SearchBar.module.scss';

export async function generateMetadata({ params }: { params: Promise<{ hash: string }> }): Promise<Metadata> {
	const { hash } = await params;
	const network = await getNetworkFromHeaders();
	const { title, description } = OPENGRAPH_METADATA;
	const image = NETWORKS_DETAILS[`${network}`].openGraphImage?.large;
	const smallImage = NETWORKS_DETAILS[`${network}`].openGraphImage?.small;

	const preimageTitle = `Preimage ${hash}`;

	return {
		title: `${title} - ${preimageTitle}`,
		description,
		metadataBase: new URL(`https://${network}.polkassembly.io`),
		icons: [{ url: '/favicon.ico' }],
		openGraph: {
			title: `${title} - ${preimageTitle}`,
			description,
			images: [
				{
					url: image || '',
					width: 600,
					height: 600,
					alt: `Polkassembly Preimage ${hash}`
				},
				{
					url: smallImage || '',
					width: 1200,
					height: 600,
					alt: `Polkassembly Preimage ${hash}`
				}
			],
			siteName: 'Polkassembly',
			type: 'website',
			url: `https://${network}.polkassembly.io/preimages/${hash}`
		},
		twitter: {
			card: 'summary_large_image',
			title: `${title} - ${preimageTitle}`,
			description,
			images: image ? [image] : [smallImage || ''],
			site: '@polkassembly'
		}
	};
}

async function Preimages({ params }: { params: Promise<{ hash: string }> }) {
	const paramsValue = await params;
	const hash = paramsValue.hash || '';
	const { data } = await NextApiClientService.fetchPreimageByHash({ hash });

	return (
		<div className='w-full'>
			<Tabs
				className=''
				defaultValue={EPreImageTabs.ALL}
			>
				<Header data={{ totalCount: data ? 1 : 0 }} />
				<div className='mx-auto grid w-full max-w-7xl grid-cols-1 gap-5 px-4 py-5 lg:px-16'>
					<TabsContent value={EPreImageTabs.ALL}>
						<div className={`${styles.container} mb-4`}>
							<SearchBar />
						</div>
						<ListingTable
							data={data ? [data] : []}
							totalCount={data ? 1 : 0}
						/>
					</TabsContent>
					<TabsContent value={EPreImageTabs.USER}>
						<UserPreimageCheck preimage={data} />
					</TabsContent>
				</div>
			</Tabs>
		</div>
	);
}

export default Preimages;
