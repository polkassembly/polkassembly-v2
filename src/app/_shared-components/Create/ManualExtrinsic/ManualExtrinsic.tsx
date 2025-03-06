// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { useCallback, useMemo, useState } from 'react';
import { SubmittableExtrinsic } from '@polkadot/api/types';
import { usePolkadotApiService } from '@/hooks/usePolkadotApiService';
import { useUserPreferences } from '@/hooks/useUserPreferences';
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
