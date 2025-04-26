// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { WEB3_AUTH_SIGN_MESSAGE } from '@/_shared/_constants/signMessage';
import { EWallet } from '@/_shared/types';
import { AuthClientService } from '@/app/_client-services/auth_client_service';
import { Button } from '@/app/_shared-components/Button';
import { Separator } from '@/app/_shared-components/Separator';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { useWalletService } from '@/hooks/useWalletService';
import { InjectedAccount } from '@polkadot/extension-inject/types';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import SwitchWalletOrAddress from '@/app/_shared-components/SwitchWalletOrAddress/SwitchWalletOrAddress';
import classes from './LinkAddress.module.scss';

function LinkAddress({ onSuccess }: { onSuccess?: (address: string) => void }) {
	const t = useTranslations();
	const { userPreferences } = useUserPreferences();
	const [selectedWallet, setSelectedWallet] = useState<EWallet | null>(userPreferences?.wallet || EWallet.POLKADOT);
	const [selectedAccount, setSelectedAccount] = useState<InjectedAccount | null>(userPreferences?.selectedAccount || null);
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

			const { data, error } = await AuthClientService.linkAddress({
				address: selectedAccount.address,
				signature,
				wallet: selectedWallet
			});

			setLoading(false);

			if (data && !error) {
				onSuccess?.(selectedAccount.address);
			}
		} catch (error) {
			console.log(error);
			setLoading(false);
		}
	};

	return (
		<div className={classes.wrapper}>
			<SwitchWalletOrAddress
				small
				onWalletChange={(wallet) => setSelectedWallet(wallet)}
				onAddressChange={(account) => setSelectedAccount(account)}
			/>
			<Separator />
			<div className={classes.footer}>
				<Button
					isLoading={loading}
					onClick={handleAddressLink}
				>
					{t('Profile.linkAddress')}
				</Button>
			</div>
		</div>
	);
}

export default LinkAddress;
