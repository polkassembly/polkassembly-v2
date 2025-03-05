// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { EConvictionAmount } from '@/_shared/types';
import { Slider } from '@/app/_shared-components/Slider';

function ConvictionSelector({ onConvictionChange, defaultConviction }: { onConvictionChange: (value: EConvictionAmount) => void; defaultConviction?: EConvictionAmount }) {
	return (
		<div className='w-full'>
			<Slider
				max={EConvictionAmount.SIX}
				step={1}
				defaultValue={[defaultConviction || EConvictionAmount.ZERO]}
				onValueChange={(value) => onConvictionChange(value[0] as EConvictionAmount)}
				withBottomIndicator
			/>
		</div>
	);
}

export default ConvictionSelector;
