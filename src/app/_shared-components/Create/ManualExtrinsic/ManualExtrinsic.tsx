// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { useCallback, useMemo, useState } from 'react';
import { SubmittableExtrinsic } from '@polkadot/api/types';
import { usePolkadotApiService } from '@/hooks/usePolkadotApiService';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { useToast } from '@/hooks/useToast';
import { ENotificationStatus } from '@/_shared/types';
import { useTranslations } from 'next-intl';
import { BN_ZERO } from '@polkadot/util';
import { NETWORKS_DETAILS } from '@/_shared/_constants/networks';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { Extrinsic } from './Extrinsic/Extrinsic';
import { Button } from '../../Button';
import PreimageDetailsView from '../PreimageDetailsView/PreimageDetailsView';
import { Separator } from '../../Separator';
import TxFeesDetailsView from '../TxFeesDetailsView/TxFeesDetailsView';
import SwitchWalletOrAddress from '../../SwitchWalletOrAddress/SwitchWalletOrAddress';
import AddressRelationsPicker from '../../AddressRelationsPicker/AddressRelationsPicker';

function ManualExtrinsic() {
	const t = useTranslations();
	const [extrinsicFn, setExtrinsicFn] = useState<SubmittableExtrinsic<'promise'> | null>();
	const { apiService } = usePolkadotApiService();
	const { userPreferences } = useUserPreferences();
	const network = getCurrentNetwork();

	const { toast } = useToast();

	const [isLoading, setIsLoading] = useState(false);

	const extrinsicDetails = useMemo(() => (extrinsicFn ? apiService?.getPreimageTxDetails({ extrinsicFn }) : null), [apiService, extrinsicFn]);

	const notePreimageTx = useMemo(() => apiService?.getNotePreimageTx({ extrinsicFn }), [apiService, extrinsicFn]);

	const notePreimage = useCallback(async () => {
		if (!userPreferences.selectedAccount?.address || !extrinsicFn) {
			return;
		}

		setIsLoading(true);

		await apiService?.notePreimage({
			address: userPreferences.selectedAccount.address,
			extrinsicFn,
			onSuccess: () => {
				setIsLoading(false);
				toast({
					status: ENotificationStatus.SUCCESS,
					title: t('CreatePreimage.preimageNotedSuccessfully'),
					description: t('CreatePreimage.preimageNotedSuccessfullyDescription')
				});
			},
			onFailed: () => {
				setIsLoading(false);
				toast({
					status: ENotificationStatus.ERROR,
					title: t('CreatePreimage.preimageNoteFailed'),
					description: t('CreatePreimage.preimageNoteFailedDescription')
				});
			}
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [apiService, extrinsicFn, userPreferences.selectedAccount?.address]);

	return (
		<div className='flex flex-1 flex-col gap-y-4 overflow-hidden'>
			<div className='flex flex-1 flex-col gap-y-4 overflow-y-auto'>
				<SwitchWalletOrAddress
					small
					customAddressSelector={<AddressRelationsPicker withBalance />}
				/>
				<Extrinsic onChange={setExtrinsicFn} />
			</div>
			{extrinsicDetails && (
				<PreimageDetailsView
					preimageHash={extrinsicDetails.preimageHash}
					preimageLength={extrinsicDetails.preimageLength}
				/>
			)}
			{notePreimageTx && extrinsicDetails && (
				<TxFeesDetailsView
					extrinsicFn={[notePreimageTx]}
					extraFees={[{ name: 'Preimage Deposit', value: NETWORKS_DETAILS[`${network}`].preimageBaseDeposit || BN_ZERO }]}
				/>
			)}
			<Separator />
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
