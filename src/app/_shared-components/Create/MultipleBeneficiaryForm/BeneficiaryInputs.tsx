// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { CalendarRange, Minus, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { BN } from '@polkadot/util';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { IBeneficiaryInput } from '@/_shared/types';
import { usePolkadotApiService } from '@/hooks/usePolkadotApiService';
import { dayjs } from '@shared/_utils/dayjsInit';
import { getBlocksPerDay } from '@/app/_client-utils/getBlocksPerDay';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import AddressInput from '../../AddressInput/AddressInput';
import BalanceInput from '../../BalanceInput/BalanceInput';
import { Button } from '../../Button';
import { Calendar } from '../../Calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../../Popover/Popover';

function BeneficiaryInputs({
	index,
	beneficiaries,
	onBeneficiaryChange,
	onAmountChange,
	onValidFromChange,
	onRemoveBeneficiary,
	multiAsset,
	stagedPayment
}: {
	index: number;
	beneficiaries: IBeneficiaryInput[];
	onBeneficiaryChange: ({ beneficiary }: { beneficiary: string }) => void;
	onAmountChange: ({ amount, assetId }: { amount: BN; assetId: string | null }) => void;
	onValidFromChange: ({ validFrom, isInvalid }: { validFrom?: BN; isInvalid?: boolean }) => void;
	onRemoveBeneficiary: () => void;
	multiAsset?: boolean;
	stagedPayment?: boolean;
}) {
	const t = useTranslations();
	const { apiService } = usePolkadotApiService();
	const network = getCurrentNetwork();

	const [blockHeight, setBlockHeight] = useState<BN>();
	const [payoutDate, setPayoutDate] = useState<Date>();
	const [validFrom, setValidFrom] = useState<BN>();

	const ref = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const getCurrentBlockNumber = async () => {
			const height = await apiService?.getCurrentBlockHeight();
			if (height) {
				setBlockHeight(height);
			}
		};
		getCurrentBlockNumber();
	}, [apiService]);

	useEffect(() => {
		if (!payoutDate) return;

		const blocksPerDay = getBlocksPerDay(network);
		const diffInBlocks = dayjs(payoutDate).diff(dayjs(), 'day') * blocksPerDay;
		const blocks = blockHeight ? blockHeight.add(new BN(diffInBlocks || 100)) : undefined;
		onValidFromChange({ validFrom: blocks, isInvalid: !blocks });
		setValidFrom(blocks);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [payoutDate, blockHeight, network]);

	useLayoutEffect(() => {
		if (ref.current && index !== 0) {
			ref.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
		}
		return () => {
			ref.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
			ref.current = null;
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<div
			ref={ref}
			className='flex w-full flex-col gap-y-2 rounded-lg border border-border_grey p-3 pb-6'
		>
			<AddressInput
				className='w-full'
				onChange={(value) => onBeneficiaryChange({ beneficiary: value })}
			/>
			<div className='relative flex w-full items-center gap-x-2 pl-12'>
				<div className='absolute left-0 left-4 top-0 h-1/2 w-8 rounded-bl-lg border-b-2 border-l-2 border-dashed border-border_grey'>
					<div className='absolute -bottom-1.5 -right-1.5 z-20 h-3 w-3 rounded-full bg-border_grey' />
				</div>
				<div className={stagedPayment ? 'w-1/2' : 'w-full'}>
					<BalanceInput
						multiAsset={multiAsset}
						onChange={({ value, assetId }) => onAmountChange({ amount: value, assetId })}
						showTreasuryBalance
					/>
				</div>
				{stagedPayment && (
					<>
						<span className='text-sm text-wallet_btn_text'>on</span>
						<div className='flex flex-1 items-center gap-x-2'>
							<Popover>
								<PopoverTrigger className='flex w-full items-center justify-start gap-x-2 rounded-lg border border-border_grey px-4 py-3 text-sm font-normal text-text_primary'>
									<CalendarRange className='h-4 w-4' />
									<p className='flex-1 text-left'>{payoutDate ? dayjs(payoutDate).format("Do MMM 'YY") : 'Immediately'}</p>
									{payoutDate && (
										<Button
											variant='ghost'
											size='icon'
											onClick={() => {
												setPayoutDate(undefined);
												setValidFrom(undefined);
												onValidFromChange({ validFrom: undefined });
											}}
										>
											<X className='h-4 w-4' />
										</Button>
									)}
								</PopoverTrigger>
								<PopoverContent className='w-auto'>
									<Calendar
										animate
										mode='single'
										selected={payoutDate}
										onSelect={setPayoutDate}
										disabled={(date) => date < new Date()}
									/>
								</PopoverContent>
							</Popover>
							{payoutDate && validFrom && (
								<div className='flex flex-1 items-center gap-x-1 text-sm text-wallet_btn_text'>
									<span>&#8776;</span>
									<span>{validFrom.toNumber()}</span>
								</div>
							)}
						</div>
					</>
				)}
			</div>
			{beneficiaries.length > 1 && (
				<div className='flex w-full justify-end text-text_pink'>
					<Button
						onClick={onRemoveBeneficiary}
						variant='ghost'
						size='sm'
						leftIcon={<Minus />}
					>
						{t('CreatePreimage.removeItem')}
					</Button>
				</div>
			)}
		</div>
	);
}

export default BeneficiaryInputs;
