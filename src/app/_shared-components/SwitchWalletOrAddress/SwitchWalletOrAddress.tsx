'use client';

import WalletButtons from '../WalletsUI/WalletButtons/WalletButtons';
import AddressDropdown from '../AddressDropdown/AddressDropdown';

const SwitchWalletOrAddress = () => {
	return (
		<>
			<WalletButtons small />
			<AddressDropdown withBalance />
		</>
	);
};

export default SwitchWalletOrAddress;
