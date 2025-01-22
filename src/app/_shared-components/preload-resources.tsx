// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import ReactDOM from 'react-dom';

// Declare `require.context` for TypeScript
declare const require: {
	context: (
		path: string,
		recursive: boolean,
		regex: RegExp
	) => {
		keys: () => string[];
		<T>(id: string): T;
	};
};

export function PreloadResources() {
	// Dynamically import all assets from the @assets folder
	const assetsContext = require.context('../../_assets', false, /\.(svg|png|jpg|jpeg|gif)$/);

	// Iterate through the assets and preload them
	assetsContext.keys().forEach((asset: string) => {
		const assetPath = assetsContext(asset);
		ReactDOM.preload(assetPath as string, { as: 'image' });
	});

	return null;
}
