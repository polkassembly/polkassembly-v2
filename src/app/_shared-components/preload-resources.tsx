// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import ReactDOM from 'react-dom';

// List of all sprite files to preload
const spriteFiles = ['/icons/activityfeed.svg', '/icons/icons.svg', '/icons/logos.svg', '/icons/profile.svg', '/icons/sidebar.svg', '/icons/wallet-icons.svg'];

export function PreloadResources() {
	spriteFiles.forEach((sprite) => {
		ReactDOM.preload(sprite, { as: 'image' });
	});

	return null;
}
