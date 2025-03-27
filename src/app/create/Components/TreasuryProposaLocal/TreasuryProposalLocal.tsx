// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { EEnactment, IBeneficiaryInput, NotificationType } from '@/_shared/types';
import { Button } from '@/app/_shared-components/Button';
import { Form } from '@/app/_shared-components/Form';
import { usePolkadotApiService } from '@/hooks/usePolkadotApiService';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { BN, BN_HUNDRED, BN_ONE, BN_ZERO } from '@polkadot/util';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { useToast } from '@/hooks/useToast';
import { ValidatorService } from '@/_shared/_services/validator_service';
import MultipleBeneficiaryForm from '@/app/_shared-components/Create/MultipleBeneficiaryForm/MultipleBeneficiaryForm';
import SelectTrack from '@/app/_shared-components/Create/SelectTrack/SelectTrack';
import EnactmentForm from '@/app/_shared-components/Create/EnactmentForm/EnactmentForm';
import PreimageDetailsView from '@/app/_shared-components/Create/PreimageDetailsView/PreimageDetailsView';
import { Separator } from '@/app/_shared-components/Separator';
import TxFeesDetailsView from '@/app/_shared-components/Create/TxFeesDetailsView/TxFeesDetailsView';
import { NETWORKS_DETAILS } from '@/_shared/_constants/networks';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { formatBnBalance } from '@/app/_client-utils/formatBnBalance';
import { dayjs } from '@shared/_utils/dayjsInit';
import SwitchWalletOrAddress from '@/app/_shared-components/SwitchWalletOrAddress/SwitchWalletOrAddress';

function TreasuryProposalLocal() {
	const t = useTranslations();
	const formatter = new Intl.NumberFormat('en-US', { notation: 'compact' });

	const { apiService } = usePolkadotApiService();
	const network = getCurrentNetwork();
	const { userPreferences } = useUserPreferences();
	const [totalAmount, setTotalAmount] = useState<BN>(BN_ZERO);
	const [beneficiaries, setBeneficiaries] = useState<IBeneficiaryInput[]>([{ address: '', amount: BN_ZERO.toString(), assetId: null, id: dayjs().get('milliseconds').toString() }]);
	const [selectedTrack, setSelectedTrack] = useState<string>('');
	const [selectedEnactment, setSelectedEnactment] = useState<EEnactment>(EEnactment.After_No_Of_Blocks);
	const [advancedDetails, setAdvancedDetails] = useState<{ [key in EEnactment]: BN }>({ [EEnactment.At_Block_No]: BN_ONE, [EEnactment.After_No_Of_Blocks]: BN_HUNDRED });

	const formData = useForm();
	const { toast } = useToast();
	const [loading, setLoading] = useState(false);

	const tx = useMemo(() => {
		if (!apiService) return null;

		return apiService.getTreasurySpendLocalExtrinsic({ beneficiaries });
	}, [apiService, beneficiaries]);

	const preimageDetails = useMemo(() => apiService && tx && apiService.getPreimageTxDetails({ extrinsicFn: tx }), [apiService, tx]);

	const notePreimageTx = useMemo(() => apiService && tx && apiService.getNotePreimageTx({ extrinsicFn: tx }), [apiService, tx]);

	const submitProposalTx = useMemo(
		() =>
			apiService &&
			preimageDetails &&
			apiService.getSubmitProposalTx({
				track: selectedTrack,
				preimageHash: preimageDetails.preimageHash,
				preimageLength: preimageDetails.preimageLength,
				enactment: selectedEnactment,
				enactmentValue: advancedDetails[`${selectedEnactment}`]
			}),
		[apiService, selectedTrack, preimageDetails, selectedEnactment, advancedDetails]
	);

	useEffect(() => {
		setTotalAmount(beneficiaries.reduce((acc, curr) => acc.add(new BN(curr.amount)), BN_ZERO));
	}, [beneficiaries]);

	const createProposal = async ({ preimageHash, preimageLength }: { preimageHash: string; preimageLength: number }) => {
		if (!apiService || !userPreferences.address?.address || !preimageHash || !preimageLength) {
			setLoading(false);
			return;
		}

		apiService.createProposal({
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
				window.location.href = `/referenda/${postId}?created=true`;
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
			!tx ||
			!apiService ||
			totalAmount.isZero() ||
			!beneficiaries.length ||
			beneficiaries.some((b) => !ValidatorService.isValidSubstrateAddress(b.address) || !ValidatorService.isValidAmount(b.amount)) ||
			!userPreferences.address?.address ||
			!preimageDetails
		)
			return;

		setLoading(true);

		await apiService.notePreimage({
			address: userPreferences.address.address,
			extrinsicFn: tx,
			onSuccess: () => {
				toast({
					title: t('CreateTreasuryProposal.preimageNotedSuccessfully'),
					description: t('CreateTreasuryProposal.preimageNotedSuccessfullyDescription'),
					status: NotificationType.SUCCESS
				});
				createProposal({ preimageHash: preimageDetails.preimageHash, preimageLength: preimageDetails.preimageLength });
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
					<SwitchWalletOrAddress />
					<MultipleBeneficiaryForm
						beneficiaries={beneficiaries}
						onChange={(value) => setBeneficiaries(value)}
					/>
					<div className='flex items-center justify-between gap-x-2 rounded-lg border border-border_grey bg-page_background p-4 font-medium text-text_primary'>
						<span>Requested Amount</span>
						<span>
							{formatter.format(Number(formatBnBalance(totalAmount, { withThousandDelimitor: false }, network)))} {NETWORKS_DETAILS[`${network}`].tokenSymbol}
						</span>
					</div>

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

				{preimageDetails && (
					<PreimageDetailsView
						preimageHash={preimageDetails.preimageHash}
						preimageLength={preimageDetails.preimageLength}
					/>
				)}

				{notePreimageTx && submitProposalTx && (
					<TxFeesDetailsView
						extrinsicFn={[notePreimageTx, submitProposalTx]}
						extraFees={[
							{ name: t('TxFees.preimageDeposit'), value: NETWORKS_DETAILS[`${network}`].preimageBaseDeposit || BN_ZERO },
							{ name: t('TxFees.submissionDeposit'), value: NETWORKS_DETAILS[`${network}`].submissionDeposit || BN_ZERO }
						]}
					/>
				)}

				<Separator />

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
