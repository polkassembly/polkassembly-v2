// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { useCallback, useMemo, useState } from 'react';
import { SubmittableExtrinsic } from '@polkadot/api/types';
import { usePolkadotApiService } from '@/hooks/usePolkadotApiService';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { Copy } from 'lucide-react';
import { Extrinsic } from './Extrinsic/Extrinsic';
import { Button } from '../../Button';

function ManualExtrinsic() {
	const [extrinsicFn, setExtrinsicFn] = useState<SubmittableExtrinsic<'promise'> | null>();
	const { apiService } = usePolkadotApiService();
	const { userPreferences } = useUserPreferences();

	const extrinsicHash = useMemo(() => extrinsicFn && apiService?.getExtrinsicHash(extrinsicFn), [apiService, extrinsicFn]);

	const notePreimage = useCallback(async () => {
		if (!userPreferences.address?.address || !extrinsicFn) {
			return;
		}

		await apiService?.notePreimage(userPreferences.address.address, extrinsicFn);
	}, [apiService, extrinsicFn, userPreferences.address?.address]);

	return (
		<div className='flex flex-col gap-y-4'>
			<Extrinsic onChange={setExtrinsicFn} />
			{extrinsicHash && (
				<div className='flex flex-col gap-y-2 rounded-lg bg-grey_bg p-2 text-text_primary'>
					<div className='flex items-start justify-between gap-x-6'>
						<p className='whitespace-nowrap'>Preimage Hash</p>
						<div className='flex flex-wrap items-center justify-end break-all text-right'>
							{extrinsicHash.preimageHash}
							<Button
								variant='ghost'
								size='icon'
								onClick={() => navigator.clipboard.writeText(`${extrinsicHash.preimageHash}`)}
							>
								<Copy size={16} />
							</Button>
						</div>
					</div>
					<div className='flex items-center justify-between'>
						<p>Length</p>
						<p>{extrinsicHash.preimageLength}</p>
					</div>
				</div>
			)}
			<div className='flex justify-end'>
				<Button
					disabled={!extrinsicHash}
					onClick={notePreimage}
				>
					Submit
				</Button>
			</div>
		</div>
	);
}

export default ManualExtrinsic;
