// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import WalletButtons from '../WalletsUI/WalletButtons/WalletButtons';
import AddressDropdown from '../AddressDropdown/AddressDropdown';

function SwitchWalletOrAddress() {
	return (
		<>
			<WalletButtons small />
			<AddressDropdown withBalance />
		</>
	);
}

export default SwitchWalletOrAddress;
