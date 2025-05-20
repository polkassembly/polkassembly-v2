// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Metadata } from 'next';
import { OPENGRAPH_METADATA } from '@/_shared/_constants/opengraphMetadata';
import { getNetworkFromHeaders } from '@/app/api/_api-utils/getNetworkFromHeaders';
import { getGeneratedContentMetadata } from '@/_shared/_utils/generateContentMetadata';
import classes from './SetIdentity.module.scss';
import SetIdentity from '../_shared-components/SetIdentity/SetIdentity';
import HeaderTitle from './HeaderTitle';
import { Separator } from '../_shared-components/Separator';

export async function generateMetadata(): Promise<Metadata> {
	const network = await getNetworkFromHeaders();
	const { title } = OPENGRAPH_METADATA;

	return getGeneratedContentMetadata({
		title: `${title} - Set Identity`,
		description: 'Set your identity on Polkassembly',
		network,
		url: `https://${network}.polkassembly.io/set-identity`,
		imageAlt: 'Polkassembly Set Identity'
	});
}

async function SetIdentityPage() {
	return (
		<div className={classes.rootClass}>
			<div className='mx-auto w-full max-w-3xl rounded-2xl bg-bg_modal p-3 shadow-lg sm:p-6'>
				<HeaderTitle />
				<Separator className='my-4' />
				<SetIdentity />
			</div>
		</div>
	);
}

export default SetIdentityPage;
