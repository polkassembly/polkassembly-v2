// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { useEffect } from 'react';
import { BN, BN_THOUSAND } from '@polkadot/util';
import { EEnactment } from '@/_shared/types';
import { usePolkadotApiService } from '@/hooks/usePolkadotApiService';
import { RadioGroup, RadioGroupItem } from '../../RadioGroup/RadioGroup';
import InputNumber from '../ManualExtrinsic/Params/InputNumber';

function EnactmentForm({
	selectedEnactment,
	onEnactmentChange,
	advancedDetails,
	onEnactmentValueChange
}: {
	selectedEnactment: EEnactment;
	onEnactmentChange: (enactment: EEnactment) => void;
	advancedDetails: { [key in EEnactment]: BN };
	onEnactmentValueChange: (details: { [key in EEnactment]: BN }) => void;
}) {
	const { apiService } = usePolkadotApiService();

	useEffect(() => {
		const getCurrentBlockNumber = async () => {
			const blockHeight = await apiService?.getCurrentBlockHeight();
			if (blockHeight) {
				onEnactmentValueChange({ ...advancedDetails, [EEnactment.At_Block_No]: new BN(blockHeight).add(BN_THOUSAND) });
			}
		};
		getCurrentBlockNumber();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [apiService]);

	return (
		<RadioGroup
			className='flex flex-col gap-y-2'
			onValueChange={(e) => onEnactmentChange(e as EEnactment)}
			value={selectedEnactment}
		>
			{Object.values(EEnactment).map((option) => {
				return (
					<div
						key={option}
						className='flex items-center space-x-2'
					>
						<RadioGroupItem
							value={option}
							id={option}
						/>
						<div className='capitalize'>{option.split('_').join(' ')}</div>
						<InputNumber
							onChange={(value) => onEnactmentValueChange({ ...advancedDetails, [option]: new BN(value) })}
							defaultValue={advancedDetails[`${option}`].toString()}
							className='w-fit'
						/>
					</div>
				);
			})}
		</RadioGroup>
	);
}

export default EnactmentForm;
