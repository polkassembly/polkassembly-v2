// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { CalendarRange, ChevronUp, Minus, Pencil, Trash, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { BN } from '@polkadot/util';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { IBeneficiaryInput } from '@/_shared/types';
import { usePolkadotApiService } from '@/hooks/usePolkadotApiService';
import { dayjs } from '@shared/_utils/dayjsInit';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { formatBnBalance } from '@/app/_client-utils/formatBnBalance';
import { cn } from '@/lib/utils';
import { BlockCalculationsService } from '@/app/_client-services/block_calculations_service';
import AddressInput from '../../AddressInput/AddressInput';
import BalanceInput from '../../BalanceInput/BalanceInput';
import { Button } from '../../Button';
import { Calendar } from '../../Calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../../Popover/Popover';
import Address from '../../Profile/Address/Address';

function BeneficiaryInputs({
	index,
	beneficiary,
	beneficiaries,
	onBeneficiaryChange,
	onAmountChange,
	onValidFromChange,
	onRemoveBeneficiary,
	multiAsset,
	stagedPayment
}: {
	index: number;
	beneficiary: IBeneficiaryInput;
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

	const [collapsed, setCollapsed] = useState(false);

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
		if (!payoutDate || !blockHeight) return;

		const blocksFromPayoutDate = BlockCalculationsService.getBlockHeightForDateTime({ network, time: payoutDate, currentBlockHeight: blockHeight });
		onValidFromChange({ validFrom: blocksFromPayoutDate, isInvalid: !blocksFromPayoutDate });
		setValidFrom(blocksFromPayoutDate);
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

	return collapsed ? (
		<div
			ref={ref}
			className='flex w-full items-center justify-between gap-x-2 rounded-lg border border-border_grey p-3'
		>
			{beneficiary.address ? (
				<Address
					iconSize={30}
					truncateCharLen={10}
					address={beneficiary.address}
				/>
			) : (
				<p className='text-xs text-wallet_btn_text sm:text-sm'>{t('CreatePreimage.noBeneficiarySelected')}</p>
			)}
			<div className='flex items-center gap-x-4'>
				{beneficiary.amount && (
					<div className='flex items-center rounded bg-[#9FB8F930] px-2 py-1 text-sm text-text_primary'>
						<p>{formatBnBalance(beneficiary.amount, { withUnit: true, numberAfterComma: 2 }, network, beneficiary.assetId)}</p>
						{payoutDate && (
							<p className='flex items-center gap-x-2'>
								,
								<p className='flex items-center gap-x-1'>
									<CalendarRange className='h-4 w-4' />
									{dayjs(payoutDate).format('MM/DD/YYYY')}
								</p>
							</p>
						)}
					</div>
				)}
				<div className='flex items-center gap-x-1'>
					{beneficiaries.length > 1 && (
						<Button
							variant='ghost'
							size='icon'
							className='text-wallet_btn_text'
							onClick={onRemoveBeneficiary}
						>
							<Trash className='h-4 w-4' />
						</Button>
					)}
					<Button
						variant='ghost'
						size='icon'
						className='text-wallet_btn_text'
						onClick={() => setCollapsed(false)}
					>
						<Pencil className='h-4 w-4' />
					</Button>
				</div>
			</div>
		</div>
	) : (
		<div
			ref={ref}
			className='flex w-full items-start gap-x-2 rounded-lg border border-border_grey p-3 pb-6'
		>
			<div className='flex w-full flex-col gap-y-3'>
				<AddressInput
					className='w-full'
					onChange={(value) => onBeneficiaryChange({ beneficiary: value })}
				/>
				<div className='relative flex w-full items-start gap-x-2 pl-12'>
					<div className='absolute left-4 top-0 h-[23px] w-8 rounded-bl-lg border-b-2 border-l-2 border-dashed border-border_grey'>
						<div className='absolute -bottom-1.5 -right-1.5 z-20 h-3 w-3 rounded-full bg-border_grey' />
					</div>
					<div className={stagedPayment ? 'w-1/2' : 'w-full'}>
						<BalanceInput
							multiAsset={multiAsset}
							onChange={({ value, assetId }) => onAmountChange({ amount: value, assetId })}
							showTreasuryBalance
							defaultValue={new BN(beneficiary.amount)}
							defaultAssetId={beneficiary.assetId}
						/>
					</div>
					{stagedPayment && (
						<>
							<div className='flex h-[46px] items-center text-sm text-wallet_btn_text'>{t('CreatePreimage.on')}</div>
							<div className='flex flex-1 flex-col gap-y-1'>
								<Popover>
									<PopoverTrigger className='flex w-full items-center justify-start gap-x-2 rounded-lg border border-border_grey px-2 py-2 text-sm font-normal text-text_primary sm:px-4 sm:py-3'>
										<CalendarRange size={14} />
										<p className='flex-1 text-left'>{payoutDate ? dayjs(payoutDate).format("Do MMM 'YY") : 'Immediately'}</p>
										{payoutDate && (
											<Button
												variant='ghost'
												size='icon'
												className='h-auto p-0 text-wallet_btn_text'
												onClick={() => {
													setPayoutDate(undefined);
													setValidFrom(undefined);
													onValidFromChange({ validFrom: undefined });
												}}
											>
												<X size={14} />
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
							className={cn('py-0', !multiAsset && 'mt-2')}
							leftIcon={<Minus />}
						>
							{t('CreatePreimage.removeItem')}
						</Button>
					</div>
				)}
			</div>
			<Button
				variant='ghost'
				size='icon'
				onClick={() => setCollapsed(true)}
				className='text-text_primary'
			>
				<ChevronUp className='h-4 w-4' />
			</Button>
		</div>
	);
}

export default BeneficiaryInputs;
