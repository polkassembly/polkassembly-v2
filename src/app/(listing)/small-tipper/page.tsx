// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { EPostOrigin, EProposalType } from '@/_shared/types';
import ListingPage from '@ui/ListingComponent/ListingPage/ListingPage';
import { useTranslations } from 'next-intl';

function Page() {
	const t = useTranslations();
	return (
		<div>
			<ListingPage
				title={t('smallTipper')}
				description={t('smallTipperDescription')}
				proposalType={EProposalType.REFERENDUM_V2}
				origins={[EPostOrigin.SMALL_SPENDER]}
			/>
		</div>
	);
}

export default Page;
