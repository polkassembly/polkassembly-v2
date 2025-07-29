// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { usePolkadotApiService } from '@/hooks/usePolkadotApiService';
import { usePolkadotVault } from '@/hooks/usePolkadotVault';
import { QrDisplayPayload, QrScanSignature } from '@polkadot/react-qr';
import { isHex } from '@polkadot/util';
import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../Dialog/Dialog';

function SignVaultTransaction() {
	const t = useTranslations();
	const { open, setOpenTransactionModal, qrAddress, qrPayload, qrResolve, isQrHashed } = usePolkadotVault();

	const { apiService } = usePolkadotApiService();

	const genesisHash = useMemo(() => {
		return apiService?.getGenesisHash();
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
							/>
						</div>
					</div>
				)}
			</DialogContent>
		</Dialog>
	);
}

export default SignVaultTransaction;
