// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { formatUSDWithUnits } from '@/app/_client-utils/formatUSDWithUnits';
import Image, { StaticImageData } from 'next/image';

interface TokenValueDisplayProps {
	icon: StaticImageData;
	value: string;
	symbol: string;
}

function TokenValueDisplay({ icon, value, symbol }: TokenValueDisplayProps) {
	const formatted = formatUSDWithUnits(value);

	return (
		<div className='flex items-center gap-1'>
			<Image
				src={icon}
				alt={symbol}
				width={16}
				height={16}
			/>
			<span className='text-sm text-btn_secondary_text'>
				{formatted} {symbol}
			</span>
		</div>
	);
}

export default TokenValueDisplay;
