// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { useTranslations } from 'next-intl';
import { Copy } from 'lucide-react';
import { shortenAddress } from '@/_shared/_utils/shortenAddress';
import { Button } from '../../Button';

function PreimageDetailsView({ preimageHash, preimageLength }: { preimageHash: string; preimageLength: number }) {
	const t = useTranslations();

	return (
		<div className='flex flex-col gap-y-4 rounded-lg border border-border_grey bg-page_background p-4 text-text_primary'>
			<div className='flex items-start justify-between gap-x-6'>
				<p className='whitespace-nowrap'>{t('CreatePreimage.preimageHash')}</p>
				<div className='flex flex-wrap items-center justify-end break-all text-right text-sm'>
					<Button
						type='button'
						variant='ghost'
						size='icon'
						onClick={() => navigator.clipboard.writeText(`${preimageHash}`)}
					>
						<Copy size={12} />
					</Button>
					{shortenAddress(preimageHash, 10)}
				</div>
			</div>
			<div className='flex items-center justify-between'>
				<p>{t('CreatePreimage.length')}</p>
				<p className='text-sm'>{preimageLength}</p>
			</div>
		</div>
	);
}

export default PreimageDetailsView;
