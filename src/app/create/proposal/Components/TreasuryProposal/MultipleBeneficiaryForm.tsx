// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Plus, Trash } from 'lucide-react';
import { useTranslations } from 'next-intl';
import AddressInput from '@/app/_shared-components/AddressInput/AddressInput';
import { Button } from '@/app/_shared-components/Button';
import BalanceInput from '@/app/_shared-components/BalanceInput/BalanceInput';
import { BN, BN_ZERO } from '@polkadot/util';
import { IBeneficiary } from '@/_shared/types';

function MultipleBeneficiaryForm({ onChange, beneficiaries }: { onChange: (beneficiary: IBeneficiary[]) => void; beneficiaries: IBeneficiary[] }) {
	const t = useTranslations();

	const handleBeneficiaryChange = (beneficiary: string, index: number) => {
		const newArray = [...beneficiaries];
		newArray[`${index}`].address = beneficiary;
		onChange(newArray);
	};

	const handleAmountChange = (amount: BN, index: number) => {
		const newArray = [...beneficiaries];
		newArray[`${index}`].amount = amount.toString();
		onChange(newArray);
	};

	const addBeneficiary = () => {
		onChange([...beneficiaries, { address: '', amount: BN_ZERO.toString(), assetId: null }]);
	};

	const removeBeneficiary = (index: number) => {
		onChange(beneficiaries.filter((_, i) => i !== index));
	};

	return (
		<div className='flex flex-col gap-y-4'>
			<div className='flex flex-col gap-y-6'>
				{beneficiaries.map((_, index) => (
					<div
						className='flex items-end gap-x-2'
						// eslint-disable-next-line react/no-array-index-key
						key={index}
					>
						<div className='flex-1'>
							<p className='mb-1 text-sm text-wallet_btn_text'>{t('CreateTreasuryProposal.beneficiary')}</p>
							<AddressInput
								className='flex-1'
								onChange={(value) => handleBeneficiaryChange(value, index)}
							/>
						</div>
						<BalanceInput
							label={t('CreateTreasuryProposal.amount')}
							onChange={(value) => handleAmountChange(value, index)}
						/>
						{index > 0 && (
							<Button
								onClick={() => removeBeneficiary(index)}
								variant='secondary'
								size='icon'
								disabled={beneficiaries.length < 2}
							>
								<Trash className='h-4 w-4' />
							</Button>
						)}
					</div>
				))}
			</div>
			<div className='flex items-center justify-end gap-x-2 text-text_pink'>
				<Button
					onClick={addBeneficiary}
					variant='ghost'
					size='sm'
					leftIcon={<Plus />}
				>
					{t('CreatePreimage.addItem')}
				</Button>
			</div>
		</div>
	);
}

export default MultipleBeneficiaryForm;
