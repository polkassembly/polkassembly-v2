// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { EWallet, EFeature } from '@/_shared/types';
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
	showTransferableBalance?: boolean;
	showVotingBalance?: boolean;
	showLinkedAccountBadge?: boolean;
	action?: EFeature;
}

function SwitchWalletOrAddress({
	small = false,
	withBalance = false,
	onWalletChange,
	onAddressChange,
	disabled = false,
	customAddressSelector,
	withRadioSelect,
	showTransferableBalance = false,
	showVotingBalance = false,
	showPeopleChainBalance = false,
	onRadioSelect,
	showLinkedAccountBadge = false,
	action
}: Props) {
	return (
		<>
			<WalletButtons
				small={small}
				onWalletChange={onWalletChange}
				disabled={disabled}
				action={action}
			/>
			{customAddressSelector || (
				<AddressDropdown
					withBalance={withBalance}
					onChange={onAddressChange}
					disabled={disabled}
					withRadioSelect={withRadioSelect}
					onRadioSelect={onRadioSelect}
					showPeopleChainBalance={showPeopleChainBalance}
					showTransferableBalance={showTransferableBalance}
					showVotingBalance={showVotingBalance}
					showLinkedAccountBadge={showLinkedAccountBadge}
				/>
			)}
		</>
	);
}

export default SwitchWalletOrAddress;
