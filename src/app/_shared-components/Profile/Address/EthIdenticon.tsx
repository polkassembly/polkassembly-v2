// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import Jazzicon from 'react-jazzicon';

function EthIdenticon({ address, size }: { address: string; size: number }) {
	return (
		<Jazzicon
			diameter={size}
			seed={parseInt(address.slice(2, 10), 16)}
		/>
	);
}

export default EthIdenticon;
