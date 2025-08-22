// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { IVaultScannedAddress } from '@/_shared/types';
import { QrScanAddress } from '@polkadot/react-qr';
import { useTranslations } from 'next-intl';
import React, { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import CameraIcon from '@assets/icons/camera.svg';
import Image from 'next/image';
import { Alert, AlertDescription } from '../../Alert';

function AddVaultAddress({ onScan, onError }: { onScan: (scanned: IVaultScannedAddress) => void; onError: (error: Error) => void }) {
	const t = useTranslations();
	const network = getCurrentNetwork();

	const [cameraAccessError, setCameraAccessError] = useState<string>();

	return (
		<div className='flex flex-col gap-y-3'>
			<ul className='list-disc pl-4 text-sm text-wallet_btn_text'>
				<li>{t('AddressDropdown.scanYourAddressQrDescription1')}</li>
				<li>{t('AddressDropdown.scanYourAddressQrDescription2', { network })}</li>
			</ul>
			{cameraAccessError ? (
				<div className='flex flex-col gap-y-3'>
					<div className='flex w-full items-center justify-center rounded-lg bg-page_background p-4'>
						<Image
							src={CameraIcon}
							alt='camera'
							width={222}
							height={222}
						/>
					</div>
					<Alert
						variant='info'
						className='flex items-center gap-x-3'
					>
						<AlertCircle className='h-4 w-4' />
						<AlertDescription>{cameraAccessError}</AlertDescription>
					</Alert>
				</div>
			) : (
				<QrScanAddress
					isEthereum={false}
					onError={(error) => {
						setCameraAccessError(error.message);
						onError(error);
					}}
					onScan={onScan}
				/>
			)}
		</div>
	);
}

export default AddVaultAddress;
