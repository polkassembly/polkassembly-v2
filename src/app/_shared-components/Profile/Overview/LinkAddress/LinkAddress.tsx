// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { WEB3_AUTH_SIGN_MESSAGE } from '@/_shared/_constants/signMessage';
import { EWallet } from '@/_shared/types';
import { AuthClientService } from '@/app/_client-services/auth_client_service';
import AddressDropdown from '@/app/_shared-components/AddressDropdown/AddressDropdown';
import { Button } from '@/app/_shared-components/Button';
import { Separator } from '@/app/_shared-components/Separator';
import WalletButtons from '@/app/_shared-components/WalletsUI/WalletButtons/WalletButtons';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { useWalletService } from '@/hooks/useWalletService';
import { InjectedAccount } from '@polkadot/extension-inject/types';
import React, { useState } from 'react';

function LinkAddress({ onSuccess }: { onSuccess?: (address: string) => void }) {
	const { userPreferences } = useUserPreferences();
	const [selectedWallet, setSelectedWallet] = useState<EWallet | null>(userPreferences?.wallet || EWallet.POLKADOT);
	const [selectedAccount, setSelectedAccount] = useState<InjectedAccount | null>(userPreferences?.address || null);
	const [loading, setLoading] = useState(false);
	const walletService = useWalletService();

	const handleAddressLink = async () => {
		if (!selectedWallet || !selectedAccount || !walletService) return;
		setLoading(true);
		try {
			const signature = await walletService.signMessage({
				address: selectedAccount.address,
				data: WEB3_AUTH_SIGN_MESSAGE,
				selectedWallet
			});

			if (!signature) {
				console.log('Failed to sign message');
				setLoading(false);
				return;
			}

			const { data: confirmData, error: confirmError } = await AuthClientService.linkAddress({
				address: selectedAccount.address,
				signature,
				wallet: selectedWallet
			});

			setLoading(false);

			if (confirmData) {
				onSuccess?.(selectedAccount.address);
			}

			console.log(confirmData, confirmError);
		} catch (error) {
			console.log(error);
			setLoading(false);
		}
	};

	return (
		<div className='flex flex-col gap-y-4'>
			<WalletButtons
				small
				onWalletChange={(wallet) => setSelectedWallet(wallet)}
			/>
			<AddressDropdown onChange={(account) => setSelectedAccount(account)} />
			<Separator />
			<div className='flex justify-end'>
				<Button
					isLoading={loading}
					onClick={handleAddressLink}
				>
					Link Address
				</Button>
			</div>
		</div>
	);
}

export default LinkAddress;
