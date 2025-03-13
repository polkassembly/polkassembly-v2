// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { EEnactment, IBeneficiary, NotificationType } from '@/_shared/types';
import { redirectFromServer } from '@/app/_client-utils/redirectFromServer';
import AddressDropdown from '@/app/_shared-components/AddressDropdown/AddressDropdown';
import BalanceInput from '@/app/_shared-components/BalanceInput/BalanceInput';
import { Button } from '@/app/_shared-components/Button';
import { Form } from '@/app/_shared-components/Form';
import WalletButtons from '@/app/_shared-components/WalletsUI/WalletButtons/WalletButtons';
import { usePolkadotApiService } from '@/hooks/usePolkadotApiService';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { BN, BN_HUNDRED, BN_ONE, BN_ZERO } from '@polkadot/util';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { useToast } from '@/hooks/useToast';
import { ValidatorService } from '@/_shared/_services/validator_service';
import MultipleBeneficiaryForm from '@/app/_shared-components/Create/MultipleBeneficiaryForm/MultipleBeneficiaryForm';
import SelectTrack from '@/app/_shared-components/Create/SelectTrack/SelectTrack';
import EnactmentForm from '@/app/_shared-components/Create/EnactmentForm/EnactmentForm';
import PreimageDetailsView from '@/app/_shared-components/Create/PreimageDetailsView/PreimageDetailsView';

function TreasuryProposalLocal() {
	const t = useTranslations();
	const { apiService } = usePolkadotApiService();
	const { userPreferences } = useUserPreferences();
	const [totalAmount, setTotalAmount] = useState<BN>(BN_ZERO);
	const [beneficiaries, setBeneficiaries] = useState<IBeneficiary[]>([{ address: '', amount: BN_ZERO.toString(), assetId: null }]);
	const [selectedTrack, setSelectedTrack] = useState<string>('');
	const [selectedEnactment, setSelectedEnactment] = useState<EEnactment>(EEnactment.After_No_Of_Blocks);
	const [advancedDetails, setAdvancedDetails] = useState<{ [key in EEnactment]: BN }>({ [EEnactment.At_Block_No]: BN_ONE, [EEnactment.After_No_Of_Blocks]: BN_HUNDRED });

	const [preimageDetails, setPreimageDetails] = useState<{ preimageHash: string; preimageLength: number }>({
		preimageHash: '',
		preimageLength: 0
	});

	const formData = useForm();
	const { toast } = useToast();
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		setTotalAmount(beneficiaries.reduce((acc, curr) => acc.add(new BN(curr.amount)), BN_ZERO));

		if (!apiService) return;

		const tx = apiService.getTreasurySpendLocalExtrinsic({ beneficiaries });
		if (!tx) return;

		const preImage = apiService.getPreimageTxDetails({ extrinsicFn: tx });
		if (!preImage) return;

		setPreimageDetails({ preimageHash: preImage.preimageHash, preimageLength: preImage.preimageLength });
	}, [apiService, beneficiaries]);

	const createProposal = async ({ preimageHash, preimageLength }: { preimageHash: string; preimageLength: number }) => {
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
					title: t('CreateTreasuryProposal.proposalCreatedSuccessfully'),
					description: t('CreateTreasuryProposal.proposalCreatedSuccessfullyDescription'),
					status: NotificationType.SUCCESS
				});
				redirectFromServer(`/referenda/${postId}`);
			},
			onFailed: () => {
				toast({
					title: t('CreateTreasuryProposal.proposalCreationFailed'),
					description: t('CreateTreasuryProposal.proposalCreationFailedDescription'),
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
			beneficiaries.some((b) => !ValidatorService.isValidSubstrateAddress(b.address) || !ValidatorService.isValidAmount(b.amount)) ||
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
					title: t('CreateTreasuryProposal.preimageNotedSuccessfully'),
					description: t('CreateTreasuryProposal.preimageNotedSuccessfullyDescription'),
					status: NotificationType.SUCCESS
				});
				createProposal({ preimageHash: preImage.preimageHash, preimageLength: preImage.preimageLength });
			},
			onFailed: () => {
				toast({
					title: t('CreateTreasuryProposal.preimageNoteFailed'),
					description: t('CreateTreasuryProposal.preimageNoteFailedDescription'),
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
						disabledMultiAsset
					/>
					<BalanceInput
						label={t('CreateTreasuryProposal.amount')}
						defaultValue={totalAmount}
						disabled
					/>

					<SelectTrack
						selectedTrack={selectedTrack}
						onChange={(track) => setSelectedTrack(track)}
						isTreasury
					/>

					<EnactmentForm
						selectedEnactment={selectedEnactment}
						onEnactmentChange={setSelectedEnactment}
						advancedDetails={advancedDetails}
						onEnactmentValueChange={setAdvancedDetails}
					/>
				</div>

				{preimageDetails.preimageHash && (
					<PreimageDetailsView
						preimageHash={preimageDetails.preimageHash}
						preimageLength={preimageDetails.preimageLength}
					/>
				)}

				<div className='flex justify-end'>
					<Button
						type='submit'
						isLoading={loading}
						disabled={
							totalAmount.isZero() ||
							!beneficiaries.length ||
							beneficiaries.some((b) => !ValidatorService.isValidSubstrateAddress(b.address) || !ValidatorService.isValidAmount(b.amount)) ||
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
