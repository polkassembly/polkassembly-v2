// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { useCallback, useMemo, useState } from 'react';
import { SubmittableExtrinsic } from '@polkadot/api/types';
import { usePolkadotApiService } from '@/hooks/usePolkadotApiService';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { useToast } from '@/hooks/useToast';
import { NotificationType } from '@/_shared/types';
import { useTranslations } from 'next-intl';
import { Extrinsic } from './Extrinsic/Extrinsic';
import { Button } from '../../Button';
import PreimageDetailsView from '../PreimageDetailsView/PreimageDetailsView';

function ManualExtrinsic() {
	const t = useTranslations();
	const [extrinsicFn, setExtrinsicFn] = useState<SubmittableExtrinsic<'promise'> | null>();
	const { apiService } = usePolkadotApiService();
	const { userPreferences } = useUserPreferences();

	const { toast } = useToast();

	const [isLoading, setIsLoading] = useState(false);

	const extrinsicDetails = useMemo(() => extrinsicFn && apiService?.getPreimageTxDetails({ extrinsicFn }), [apiService, extrinsicFn]);

	const notePreimage = useCallback(async () => {
		if (!userPreferences.address?.address || !extrinsicFn) {
			return;
		}

		setIsLoading(true);

		await apiService?.notePreimage({
			address: userPreferences.address.address,
			extrinsicFn,
			onSuccess: () => {
				setIsLoading(false);
				toast({
					status: NotificationType.SUCCESS,
					title: t('CreatePreimage.preimageNotedSuccessfully'),
					description: t('CreatePreimage.preimageNotedSuccessfullyDescription')
				});
			},
			onFailed: () => {
				setIsLoading(false);
				toast({
					status: NotificationType.ERROR,
					title: t('CreatePreimage.preimageNoteFailed'),
					description: t('CreatePreimage.preimageNoteFailedDescription')
				});
			}
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [apiService, extrinsicFn, userPreferences.address?.address]);

	return (
		<div className='flex flex-1 flex-col gap-y-4 overflow-hidden'>
			<div className='flex-1 overflow-y-auto'>
				<Extrinsic onChange={setExtrinsicFn} />
			</div>
			{extrinsicDetails && (
				<PreimageDetailsView
					preimageHash={extrinsicDetails.preimageHash}
					preimageLength={extrinsicDetails.preimageLength}
				/>
			)}
			<div className='flex justify-end'>
				<Button
					disabled={!extrinsicDetails?.preimageHash}
					onClick={notePreimage}
					isLoading={isLoading}
				>
					Submit
				</Button>
			</div>
		</div>
	);
}

export default ManualExtrinsic;
