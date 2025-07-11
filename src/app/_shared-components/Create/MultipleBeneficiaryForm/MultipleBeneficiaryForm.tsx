// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { PlusCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { BN, BN_ZERO } from '@polkadot/util';
import { Button } from '@/app/_shared-components/Button';
import { IBeneficiaryInput } from '@/_shared/types';
import { dayjs } from '@shared/_utils/dayjsInit';
import BeneficiaryInputs from './BeneficiaryInputs';

function MultipleBeneficiaryForm({
	onChange,
	beneficiaries,
	multiAsset,
	stagedPayment
}: {
	onChange: (beneficiary: IBeneficiaryInput[]) => void;
	beneficiaries: IBeneficiaryInput[];
	multiAsset?: boolean;
	stagedPayment?: boolean;
}) {
	const t = useTranslations();

	const handleBeneficiaryChange = ({ beneficiary, index }: { beneficiary: string; index: number }) => {
		const newArray = [...beneficiaries];
		newArray[`${index}`].address = beneficiary;
		onChange(newArray);
	};

	const handleAmountChange = ({ amount, assetId, index }: { amount: BN; assetId: string | null; index: number }) => {
		const newArray = [...beneficiaries];
		newArray[`${index}`].amount = amount.toString();
		newArray[`${index}`].assetId = assetId;
		onChange(newArray);
	};

	const handleValidFromChange = ({ validFrom, isInvalid, index }: { validFrom?: BN; isInvalid?: boolean; index: number }) => {
		const newArray = [...beneficiaries];
		newArray[`${index}`].validFromBlock = validFrom ? validFrom.toString() : undefined;
		newArray[`${index}`].isInvalid = isInvalid;
		onChange(newArray);
	};

	const addBeneficiary = () => {
		onChange([...beneficiaries, { address: '', amount: BN_ZERO.toString(), assetId: null, id: dayjs().get('milliseconds').toString() }]);
	};

	const removeBeneficiary = (index: number) => {
		const newArray = [...beneficiaries];
		newArray.splice(index, 1);
		onChange(newArray);
	};

	return (
		<div className='flex flex-col gap-y-1'>
			<p className='text-xs text-wallet_btn_text sm:text-sm'>{t('CreatePreimage.beneficiary')}</p>
			<div className='flex flex-col gap-y-6'>
				{beneficiaries.map((b, index) => (
					<BeneficiaryInputs
						key={b.id}
						index={index}
						beneficiaries={beneficiaries}
						onBeneficiaryChange={({ beneficiary }) => handleBeneficiaryChange({ beneficiary, index })}
						onAmountChange={({ amount, assetId }) => handleAmountChange({ amount, assetId, index })}
						onValidFromChange={({ validFrom, isInvalid }) => handleValidFromChange({ validFrom, isInvalid, index })}
						onRemoveBeneficiary={() => removeBeneficiary(index)}
						multiAsset={multiAsset}
						stagedPayment={stagedPayment}
						beneficiary={b}
					/>
				))}
			</div>
			<div className='flex justify-end text-text_pink'>
				<Button
					onClick={addBeneficiary}
					variant='ghost'
					size='sm'
					leftIcon={<PlusCircle />}
				>
					{t('CreatePreimage.addItem')}
				</Button>
			</div>
		</div>
	);
}

export default MultipleBeneficiaryForm;
