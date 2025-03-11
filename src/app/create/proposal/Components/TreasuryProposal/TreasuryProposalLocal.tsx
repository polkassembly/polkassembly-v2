// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NETWORKS_DETAILS } from '@/_shared/_constants/networks';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { EEnactment, IBeneficiaryAmount, IWritePostFormFields, NotificationType } from '@/_shared/types';
import { redirectFromServer } from '@/app/_client-utils/redirectFromServer';
import AddressDropdown from '@/app/_shared-components/AddressDropdown/AddressDropdown';
import BalanceInput from '@/app/_shared-components/BalanceInput/BalanceInput';
import { Button } from '@/app/_shared-components/Button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/app/_shared-components/DropdownMenu';
import { Form } from '@/app/_shared-components/Form';
import InputNumber from '@/app/_shared-components/Create/ManualExtrinsic/Params/InputNumber';
import { RadioGroup, RadioGroupItem } from '@/app/_shared-components/RadioGroup/RadioGroup';
import WalletButtons from '@/app/_shared-components/WalletsUI/WalletButtons/WalletButtons';
import { usePolkadotApiService } from '@/hooks/usePolkadotApiService';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { BN, BN_HUNDRED, BN_ONE, BN_THOUSAND, BN_ZERO } from '@polkadot/util';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { useToast } from '@/hooks/useToast';
import { getSubstrateAddress } from '@/_shared/_utils/getSubstrateAddress';
import MultipleBeneficiaryForm from './MultipleBeneficiaryForm';

function TreasuryProposalLocal() {
	const t = useTranslations();
	const { apiService } = usePolkadotApiService();
	const { userPreferences } = useUserPreferences();
	const [totalAmount, setTotalAmount] = useState<BN>(BN_ZERO);
	const [beneficiaries, setBeneficiaries] = useState<IBeneficiaryAmount[]>([{ address: '', amount: BN_ZERO }]);
	const [selectedTrack, setSelectedTrack] = useState<string>('');
	const [selectedEnactment, setSelectedEnactment] = useState<EEnactment>(EEnactment.After_No_Of_Blocks);
	const [advancedDetails, setAdvancedDetails] = useState<{ [key in EEnactment]: BN }>({ [EEnactment.At_Block_No]: BN_ONE, [EEnactment.After_No_Of_Blocks]: BN_HUNDRED });

	// eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
	const [preimageDetails, setPreimageDetails] = useState<{ preimageHash: string; preimageLength: number }>({
		preimageHash: '',
		preimageLength: 0
	});

	const formData = useForm<IWritePostFormFields>();
	const network = getCurrentNetwork();
	const { toast } = useToast();
	const [loading, setLoading] = useState(false);

	const trackArr: string[] = [];

	if (network) {
		Object.entries(NETWORKS_DETAILS?.[`${network}`].trackDetails).forEach(([key, value]) => {
			if (value.group === 'Treasury') {
				trackArr.push(key);
			}
		});
	}

	useEffect(() => {
		setTotalAmount(beneficiaries.reduce((acc, curr) => acc.add(curr.amount), BN_ZERO));
	}, [beneficiaries]);

	useEffect(() => {
		const getCurrentBlockNumber = async () => {
			const blockNumber = await apiService?.getCurrentBlockNumber();
			if (blockNumber) {
				setAdvancedDetails({ ...advancedDetails, [EEnactment.At_Block_No]: blockNumber.add(BN_THOUSAND) });
			}
		};
		getCurrentBlockNumber();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [apiService]);

	const createProposal = async (preimageHash: string, preimageLength: number) => {
		if (!apiService || !userPreferences.address?.address || !preimageHash || !preimageLength) {
			setLoading(false);
			return;
		}

		apiService.createTreasuryProposal({
			address: userPreferences.address.address,
			track: selectedTrack,
			preimageHash,
			preimageLength,
			enactment: selectedEnactment,
			enactmentValue: advancedDetails[`${selectedEnactment}`],
			onSuccess: (postId) => {
				toast({
					title: 'Proposal created successfully',
					description: 'The proposal has been created successfully',
					status: NotificationType.SUCCESS
				});
				redirectFromServer(`/referenda/${postId}`);
			},
			onFailed: () => {
				toast({
					title: 'Failed to create proposal',
					description: 'There was an error while creating the proposal',
					status: NotificationType.ERROR
				});
				setLoading(false);
			}
		});
	};

	const createPreimage = async () => {
		if (
			!apiService ||
			totalAmount.isZero() ||
			!beneficiaries.length ||
			beneficiaries.some((b) => !getSubstrateAddress(b.address) || b.amount.isZero()) ||
			!userPreferences.address?.address
		)
			return;

		const tx = apiService.getTreasurySpendLocalExtrinsic({ beneficiaries });
		if (!tx) return;

		setLoading(true);

		const preImage = apiService.getPreimageTxDetails({ extrinsicFn: tx });

		if (!preImage) {
			setLoading(false);
			return;
		}

		setPreimageDetails({ preimageHash: preImage.preimageHash, preimageLength: preImage.preimageLength });

		await apiService.notePreimage({
			address: userPreferences.address.address,
			extrinsicFn: tx,
			onSuccess: () => {
				toast({
					title: 'Preimage noted successfully',
					description: 'The preimage has been noted successfully',
					status: NotificationType.SUCCESS
				});
				createProposal(preImage.preimageHash, preImage.preimageLength);
			},
			onFailed: () => {
				toast({
					title: 'Failed to note preimage',
					description: 'There was an error while noting the preimage',
					status: NotificationType.ERROR
				});
				setLoading(false);
			}
		});
	};

	return (
		<Form {...formData}>
			<form
				onSubmit={formData.handleSubmit(createPreimage)}
				className='flex w-full flex-1 flex-col gap-y-4 overflow-hidden'
			>
				<div className='flex flex-1 flex-col gap-y-4 overflow-y-auto'>
					<WalletButtons small />
					<AddressDropdown withBalance />

					<MultipleBeneficiaryForm
						beneficiaries={beneficiaries}
						onChange={(value) => setBeneficiaries(value)}
					/>
					<BalanceInput
						label={t('CreateTreasuryProposal.amount')}
						defaultValue={totalAmount}
						disabled
					/>

					<div className='flex flex-col gap-y-1'>
						<p>{t('CreateTreasuryProposal.track')}</p>
						<DropdownMenu>
							<DropdownMenuTrigger className='flex w-full items-center gap-x-2 rounded border border-border_grey px-4 py-2'>{selectedTrack || 'Select Track'}</DropdownMenuTrigger>
							<DropdownMenuContent>
								{trackArr.map((track) => (
									<DropdownMenuItem
										key={track}
										onClick={() => setSelectedTrack(track)}
									>
										{track.split(/(?=[A-Z])/).join(' ')}
									</DropdownMenuItem>
								))}
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
					<RadioGroup
						className='flex flex-col gap-y-2'
						onValueChange={(e) => setSelectedEnactment(e as EEnactment)}
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
										onChange={(value) => setAdvancedDetails({ ...advancedDetails, [option]: new BN(value) })}
										defaultValue={advancedDetails[`${option}`].toString()}
										className='w-fit'
									/>
								</div>
							);
						})}
					</RadioGroup>
				</div>

				<div className='flex justify-end'>
					<Button
						type='submit'
						isLoading={loading}
						disabled={
							totalAmount.isZero() ||
							!beneficiaries.length ||
							beneficiaries.some((b) => !getSubstrateAddress(b.address) || b.amount.isZero()) ||
							!userPreferences.address?.address ||
							!selectedTrack ||
							!selectedEnactment
						}
					>
						{t('CreateTreasuryProposal.createProposal')}
					</Button>
				</div>
			</form>
		</Form>
	);
}

export default TreasuryProposalLocal;
