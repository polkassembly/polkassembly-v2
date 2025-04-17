// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { useEffect, useRef, useState } from 'react';
import { BN, BN_THOUSAND, BN_ZERO } from '@polkadot/util';
import { EEnactment } from '@/_shared/types';
import { usePolkadotApiService } from '@/hooks/usePolkadotApiService';
import { ChevronDown } from 'lucide-react';
import { NETWORKS_DETAILS } from '@/_shared/_constants/networks';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { RadioGroup, RadioGroupItem } from '../../RadioGroup/RadioGroup';
import InputNumber from '../ManualExtrinsic/Params/InputNumber';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../../Collapsible';
import { Separator } from '../../Separator';
import BalanceInput from '../../BalanceInput/BalanceInput';

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
	const network = getCurrentNetwork();

	const { apiService } = usePolkadotApiService();
	const [enactment, setEnactment] = useState<EEnactment>(selectedEnactment);

	const ref = useRef<HTMLDivElement>(null);

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
		<Collapsible
			ref={ref}
			onOpenChange={(open) => open && ref.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
			className='rounded-lg border border-border_grey bg-page_background p-2 max-sm:text-sm sm:p-4'
		>
			<CollapsibleTrigger className='w-full'>
				<div className='flex w-full items-center justify-between gap-x-2'>
					<p className='font-medium text-text_primary'>Advanced</p>
					<ChevronDown className='h-4 w-4' />
				</div>
			</CollapsibleTrigger>
			<CollapsibleContent>
				<Separator className='my-4' />
				<div className='flex flex-col gap-y-2'>
					<p className='text-xs text-wallet_btn_text sm:text-sm'>Enactment Blocks</p>
					<RadioGroup
						className='flex items-center gap-x-4'
						onValueChange={(e) => {
							setEnactment(e as EEnactment);
							onEnactmentChange(e as EEnactment);
						}}
						value={enactment}
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
								</div>
							);
						})}
					</RadioGroup>
					<InputNumber
						onChange={(value) => onEnactmentValueChange({ ...advancedDetails, [enactment]: new BN(value) })}
						defaultValue={advancedDetails[`${enactment}`].toString()}
						className='bg-bg_modal'
					/>
					<p className='mt-2 text-sm text-wallet_btn_text'>Submission Deposit</p>
					<BalanceInput
						disabled
						defaultValue={NETWORKS_DETAILS[`${network}`].submissionDeposit || BN_ZERO}
						className='bg-bg_modal'
					/>
				</div>
			</CollapsibleContent>
		</Collapsible>
	);
}

export default EnactmentForm;
