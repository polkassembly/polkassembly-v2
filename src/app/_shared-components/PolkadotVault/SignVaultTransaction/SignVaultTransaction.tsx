// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { usePolkadotApiService } from '@/hooks/usePolkadotApiService';
import { usePolkadotVault } from '@/hooks/usePolkadotVault';
import { QrDisplayPayload, QrScanSignature } from '@polkadot/react-qr';
import { isHex } from '@polkadot/util';
import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { AlertCircle } from 'lucide-react';
import Image from 'next/image';
import CameraIcon from '@assets/icons/camera.svg';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../Dialog/Dialog';
import { Alert, AlertDescription } from '../../Alert';

function SignVaultTransaction() {
	const t = useTranslations();
	const { open, setOpenTransactionModal, qrAddress, qrPayload, qrResolve, isQrHashed } = usePolkadotVault();

	const { apiService } = usePolkadotApiService();

	const [cameraAccessError, setCameraAccessError] = useState<string>();

	const [genesisHash, setGenesisHash] = useState<string>('');

	useEffect(() => {
		const fetchGenesisHash = async () => {
			const hash = await apiService?.getGenesisHash();
			if (hash) {
				setGenesisHash(hash);
			}
		};
		fetchGenesisHash();
	}, [apiService]);

	let qrId = 0;

	return (
		<Dialog
			open={open}
			onOpenChange={setOpenTransactionModal}
		>
			<DialogContent className='max-w-3xl p-4 sm:p-6'>
				<DialogHeader>
					<DialogTitle>{t('PolkadotVault.signTransaction')}</DialogTitle>
				</DialogHeader>
				{open && (
					<div className='flex flex-col gap-y-3'>
						<ul className='list-disc pl-4 text-sm text-wallet_btn_text'>
							<li>{t('PolkadotVault.openVaultAppInYourPhone')}</li>
							<li>{t('PolkadotVault.scanTheQRHere')}</li>
							<li>{t('PolkadotVault.scanTheSignatureQRInYourApp')}</li>
						</ul>
						<div className='flex gap-x-4'>
							<div className='flex-1 rounded-xl bg-white p-4'>
								<QrDisplayPayload
									className='h-full w-full'
									cmd={isQrHashed ? 1 : 2}
									address={qrAddress}
									genesisHash={genesisHash || ''}
									payload={qrPayload}
								/>
							</div>
							<div className='flex-1 rounded-xl p-4'>
								{cameraAccessError ? (
									<div className='flex h-full w-full items-center justify-center rounded-lg bg-page_background p-4'>
										<Image
											src={CameraIcon}
											alt='camera'
											width={222}
											height={222}
										/>
									</div>
								) : (
									<QrScanSignature
										className='h-full w-full'
										onScan={(data) => {
											if (data && data.signature && isHex(data.signature) && qrResolve) {
												qrResolve({
													// eslint-disable-next-line no-plusplus
													id: ++qrId,
													signature: data.signature
												});
											}
										}}
										onError={(error) => {
											setCameraAccessError(error.message);
										}}
									/>
								)}
							</div>
						</div>
						{cameraAccessError && (
							<Alert
								variant='info'
								className='flex items-center gap-x-3'
							>
								<AlertCircle className='h-4 w-4' />
								<AlertDescription>{cameraAccessError}</AlertDescription>
							</Alert>
						)}
					</div>
				)}
			</DialogContent>
		</Dialog>
	);
}

export default SignVaultTransaction;
