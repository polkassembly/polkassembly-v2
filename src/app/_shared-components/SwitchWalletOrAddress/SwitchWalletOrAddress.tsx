// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { EWallet } from '@/_shared/types';
import { InjectedAccount } from '@polkadot/extension-inject/types';
import { ReactNode } from 'react';
import WalletButtons from '../WalletsUI/WalletButtons/WalletButtons';
import AddressDropdown from '../AddressDropdown/AddressDropdown';

interface Props {
	onWalletChange?: (wallet: EWallet | null) => void;
	onAddressChange?: ((account: InjectedAccount) => void) | undefined;
	small?: boolean;
	withBalance?: boolean;
	disabled?: boolean;
	customAddressSelector?: ReactNode; // this pattern is to avoid cyclic dependencies
	withRadioSelect?: boolean;
	onRadioSelect?: (address: string) => void;
	showPeopleChainBalance?: boolean;
}

function SwitchWalletOrAddress({
	small = false,
	withBalance = false,
	onWalletChange,
	onAddressChange,
	disabled = false,
	customAddressSelector,
	withRadioSelect,
	showPeopleChainBalance = false,
	onRadioSelect
}: Props) {
	return (
		<>
			<WalletButtons
				small={small}
				onWalletChange={onWalletChange}
				disabled={disabled}
			/>
			{customAddressSelector || (
				<AddressDropdown
					withBalance={withBalance}
					onChange={onAddressChange}
					disabled={disabled}
					withRadioSelect={withRadioSelect}
					onRadioSelect={onRadioSelect}
					showPeopleChainBalance={showPeopleChainBalance}
				/>
			)}
		</>
	);
}

export default SwitchWalletOrAddress;
