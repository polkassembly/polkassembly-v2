// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import React, { useEffect, useState } from 'react';
import { ENetwork } from '@shared/types';
import { PolkadotApiService } from '@/app/_client-services/polkadot_api_service';
import classes from './Navbar.module.scss';
import RpcSwitch from './RpcSwitch/RpcSwitch';

function Navbar() {
	const [apiService, setApiService] = useState<PolkadotApiService | null>(null);

	useEffect(() => {
		(async () => {
			try {
				const service = await PolkadotApiService.Init(ENetwork.ROCOCO);
				setApiService(service);
			} catch (error) {
				console.error('Failed to initialize PolkadotApiService:', error);
			}
		})();
	}, []);

	if (!apiService) {
		return (
			<nav className={classes.navbar}>
				<p>Polkassembly</p>
				<p>..</p>
			</nav>
		);
	}

	return (
		<nav className={classes.navbar}>
			<div className={classes.header}>
				<p>Polkassembly</p>
				<RpcSwitch apiService={apiService} />
			</div>
		</nav>
	);
}

export default Navbar;
