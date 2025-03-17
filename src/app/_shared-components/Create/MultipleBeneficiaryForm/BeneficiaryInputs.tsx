// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Minus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { BN } from '@polkadot/util';
import { useEffect, useState } from 'react';
import { IBeneficiary } from '@/_shared/types';
import { usePolkadotApiService } from '@/hooks/usePolkadotApiService';
import { dayjs } from '@shared/_utils/dayjsInit';
import { getBlocksPerDay } from '@/app/_client-utils/getBlocksPerDay';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import AddressInput from '../../AddressInput/AddressInput';
import BalanceInput from '../../BalanceInput/BalanceInput';
import { Button } from '../../Button';
import { Switch } from '../../Switch';
import InputNumber from '../ManualExtrinsic/Params/InputNumber';

function BeneficiaryInputs({
	beneficiaries,
	onBeneficiaryChange,
	onAmountChange,
	onValidFromChange,
	onRemoveBeneficiary,
	multiAsset,
	stagedPayment
}: {
	beneficiaries: IBeneficiary[];
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

	const [switchStagedPayment, setSwitchStagedPayment] = useState(false);
	const [blockHeight, setBlockHeight] = useState<BN>();
	const [errorInValidFrom, setErrorInValidFrom] = useState<string>();
	const [payoutDate, setPayoutDate] = useState<Date>();

	useEffect(() => {
		const getCurrentBlockNumber = async () => {
			const height = await apiService?.getCurrentBlockHeight();
			if (height) {
				setBlockHeight(height);
			}
		};
		getCurrentBlockNumber();
	}, [apiService]);

	const handleValidFromChange = (value: number) => {
		if (blockHeight && value > blockHeight.toNumber()) {
			const blocksPerDay = getBlocksPerDay(network);
			const diffInBlocks = value - blockHeight.toNumber();
			const totalDays = Math.floor(diffInBlocks / blocksPerDay);
			const date = dayjs().add(totalDays, 'day').toDate();

			if (!date) {
				onValidFromChange({ validFrom: new BN(value), isInvalid: true });
				setErrorInValidFrom(t('CreateTreasuryProposal.invalidBlockHeight'));
				return;
			}

			onValidFromChange({ validFrom: new BN(value), isInvalid: false });
			setErrorInValidFrom('');
			setPayoutDate(date);
		} else {
			onValidFromChange({ validFrom: undefined, isInvalid: true });
			setPayoutDate(undefined);
			setErrorInValidFrom(t('CreateTreasuryProposal.enterFutureBlockHeight'));
		}
	};

	return (
		<div className='flex w-full flex-col gap-y-2'>
			<div className='flex items-end gap-x-2'>
				<div className='flex-1'>
					<p className='mb-1 text-sm text-wallet_btn_text'>{t('CreateTreasuryProposal.beneficiary')}</p>
					<AddressInput
						className='flex-1'
						onChange={(value) => onBeneficiaryChange({ beneficiary: value })}
					/>
				</div>
				<BalanceInput
					multiAsset={multiAsset}
					label={t('CreateTreasuryProposal.amount')}
					onChange={({ value, assetId }) => onAmountChange({ amount: value, assetId })}
				/>
			</div>
			{stagedPayment && (
				<div>
					<div className='mb-1 flex w-full items-center justify-end gap-x-2'>
						<span className='text-sm text-wallet_btn_text'>{t('CreateTreasuryProposal.addValidFrom')}</span>
						<Switch
							checked={switchStagedPayment}
							onCheckedChange={(checked) => {
								setSwitchStagedPayment(checked);
								setPayoutDate(undefined);
								setErrorInValidFrom('');
								onValidFromChange({ validFrom: undefined, isInvalid: false });
							}}
						/>
					</div>
					{switchStagedPayment && (
						<div>
							<p className='mb-1 text-sm text-wallet_btn_text'>{t('CreateTreasuryProposal.validFrom')}</p>
							<InputNumber onChange={(value) => handleValidFromChange(value)} />
							{payoutDate && <p className='text-sm text-wallet_btn_text'>Valid From: {dayjs(payoutDate).format("Do MMM 'YY")}</p>}
							{errorInValidFrom && <p className='text-sm text-failure'>{errorInValidFrom}</p>}
						</div>
					)}
				</div>
			)}
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
