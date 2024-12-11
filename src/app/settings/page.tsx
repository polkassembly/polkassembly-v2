// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React from 'react';
import SettingsComponent from './Components/Settings';

async function Settings() {
	return (
		<div className='flex h-full w-full items-center justify-center'>
			<SettingsComponent />
		</div>
	);
}

export default Settings;
