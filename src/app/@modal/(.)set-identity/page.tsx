// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@ui/Dialog/Dialog';
import { useRouter } from 'next/navigation';
import SetIdentity from '@/app/_shared-components/SetIdentity/SetIdentity';
import { useTranslations } from 'next-intl';

function Discussion() {
	const t = useTranslations();
	const router = useRouter();

	const handleOpenChange = () => {
		router.back();
	};

	return (
		<Dialog
			defaultOpen
			open
			onOpenChange={handleOpenChange}
		>
			<DialogContent className='max-w-xl p-6'>
				<DialogHeader>
					<DialogTitle>{t('SetIdentity.onChainIdentity')}</DialogTitle>
				</DialogHeader>
				<SetIdentity />
			</DialogContent>
		</Dialog>
	);
}

export default Discussion;
