// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { EWallet } from '@/_shared/types';
import { InjectedAccount } from '@polkadot/extension-inject/types';
import WalletButtons from '../WalletsUI/WalletButtons/WalletButtons';
import AddressDropdown from '../AddressDropdown/AddressDropdown';

interface Props {
	onWalletChange?: (wallet: EWallet | null) => void;
	onAddressChange?: ((account: InjectedAccount) => void) | undefined;
	small?: boolean;
	withBalance?: boolean;
}

function SwitchWalletOrAddress({ small = false, withBalance = false, onWalletChange, onAddressChange }: Props) {
	return (
		<>
			<WalletButtons
				small={small}
				onWalletChange={onWalletChange}
			/>
			<AddressDropdown
				withBalance={withBalance}
				onChange={onAddressChange}
			/>
		</>
	);
}

export default SwitchWalletOrAddress;
