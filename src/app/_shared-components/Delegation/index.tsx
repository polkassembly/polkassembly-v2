// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { IoMdClose } from 'react-icons/io';
import styles from './Delegation.module.scss';
import { Button } from '../Button';

function Delegation() {
	return (
		<div className={styles.delegation}>
			<h1 className={styles.delegation_title}>Delegation</h1>
			<div className='mt-5 rounded-lg bg-bg_modal px-6 py-4'>
				<div className='flex items-center justify-between'>
					<p className='text-xl font-semibold text-btn_secondary_text'>How to Delegate on Polkassembly</p>
					<div className='flex items-center gap-5'>
						<Button>Become a Delegate</Button>
						<IoMdClose className='cursor-pointer text-2xl text-wallet_btn_text' />
					</div>
				</div>
			</div>
		</div>
	);
}

export default Delegation;
