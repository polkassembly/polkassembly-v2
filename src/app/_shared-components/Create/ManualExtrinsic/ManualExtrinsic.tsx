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
import Image from 'next/image';
import SuccessGif from '@assets/gifs/success.gif';
import { SquareArrowOutUpRight } from 'lucide-react';
import Link from 'next/link';
import { shortenAddress } from '@/_shared/_utils/shortenAddress';
import { Extrinsic } from './Extrinsic/Extrinsic';
import { Button } from '../../Button';
import PreimageDetailsView from '../PreimageDetailsView/PreimageDetailsView';
import { Separator } from '../../Separator';
import TxFeesDetailsView from '../TxFeesDetailsView/TxFeesDetailsView';
import SwitchWalletOrAddress from '../../SwitchWalletOrAddress/SwitchWalletOrAddress';
import AddressRelationsPicker from '../../AddressRelationsPicker/AddressRelationsPicker';

function ManualExtrinsic({ onSuccess }: { onSuccess: (preimageHash: string) => void }) {
	const t = useTranslations();
	const [extrinsicFn, setExtrinsicFn] = useState<SubmittableExtrinsic<'promise'> | null>();
	const { apiService } = usePolkadotApiService();
	const { userPreferences } = useUserPreferences();
	const network = getCurrentNetwork();
	const [success, setSuccess] = useState(false);

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
				setSuccess(true);
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

	if (success && extrinsicDetails?.preimageHash) {
		return (
			<div className='w-full'>
				<div className='mb-4 flex w-full justify-center'>
					<Image
						src={SuccessGif}
						alt='success'
						width={300}
						height={300}
					/>
				</div>
				<div className='flex w-full flex-col items-center gap-y-4'>
					<p className='text-xl font-semibold text-text_primary'>{t('CreatePreimage.Congratulations')}</p>
					<div className='flex items-center gap-x-2 text-sm font-medium text-wallet_btn_text'>
						{t('CreatePreimage.Preimage')}
						<Link
							href={`/preimages/${extrinsicDetails.preimageHash}`}
							target='_blank'
							className='flex items-center gap-x-2 text-base font-medium text-text_pink'
						>
							<SquareArrowOutUpRight className='h-4 w-4' />
							{shortenAddress(extrinsicDetails.preimageHash)}
						</Link>
						{t('CreatePreimage.createSuccessfully')}
					</div>
					<p className='text-sm font-medium text-wallet_btn_text'>{t('CreatePreimage.createProposalFromPreimage')}</p>
					<div className='flex items-center gap-x-2'>
						<Button
							variant='secondary'
							onClick={() => setSuccess(false)}
							className='w-32'
							size='lg'
						>
							{t('CreatePreimage.goBack')}
						</Button>
						<Button
							size='lg'
							className='w-32'
							onClick={() => onSuccess(extrinsicDetails.preimageHash)}
						>
							{t('CreatePreimage.CreateProposal')}
						</Button>
					</div>
				</div>
			</div>
		);
	}

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
