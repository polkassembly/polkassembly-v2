// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Button } from '../Button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../Dialog/Dialog';
import SwitchWalletOrAddress from './SwitchWalletOrAddress';

export default function AddressRelationsPickerBtn() {
	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button
					size='sm'
					className='ml-auto'
				>
					Switch
				</Button>
			</DialogTrigger>
			<DialogContent className='max-w-xl p-3 sm:p-6'>
				<DialogHeader className='text-xl font-semibold text-text_primary'>
					<DialogTitle>Switch Wallet</DialogTitle>
				</DialogHeader>
				<SwitchWalletOrAddress small />
			</DialogContent>
		</Dialog>
	);
}
