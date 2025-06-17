// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { EEnactment, EPostOrigin, IBeneficiaryInput, ENotificationStatus } from '@/_shared/types';
import { Button } from '@/app/_shared-components/Button';
import { usePolkadotApiService } from '@/hooks/usePolkadotApiService';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { BN, BN_HUNDRED, BN_ONE, BN_ZERO } from '@polkadot/util';
import { useEffect, useMemo, useState } from 'react';
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
import AddressRelationsPicker from '@/app/_shared-components/AddressRelationsPicker/AddressRelationsPicker';

function TreasuryProposalLocal({ onSuccess }: { onSuccess: (proposalId: number) => void }) {
	const t = useTranslations();
	const formatter = new Intl.NumberFormat('en-US', { notation: 'compact' });

	const { apiService } = usePolkadotApiService();
	const network = getCurrentNetwork();
	const { userPreferences } = useUserPreferences();
	const [totalAmount, setTotalAmount] = useState<BN>(BN_ZERO);
	const [beneficiaries, setBeneficiaries] = useState<IBeneficiaryInput[]>([{ address: '', amount: BN_ZERO.toString(), assetId: null, id: dayjs().get('milliseconds').toString() }]);
	const [selectedTrack, setSelectedTrack] = useState<{ name: EPostOrigin; trackId: number }>();
	const [selectedEnactment, setSelectedEnactment] = useState<EEnactment>(EEnactment.After_No_Of_Blocks);
	const [advancedDetails, setAdvancedDetails] = useState<{ [key in EEnactment]: BN }>({ [EEnactment.At_Block_No]: BN_ONE, [EEnactment.After_No_Of_Blocks]: BN_HUNDRED });

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
			selectedTrack &&
			apiService.getSubmitProposalTx({
				track: selectedTrack.name,
				preimageHash: preimageDetails.preimageHash,
				preimageLength: preimageDetails.preimageLength,
				enactment: selectedEnactment,
				enactmentValue: advancedDetails[`${selectedEnactment}`]
			}),
		[apiService, selectedTrack, preimageDetails, selectedEnactment, advancedDetails]
	);

	const batchCallTx = useMemo(
		() => apiService && notePreimageTx && submitProposalTx && apiService.getBatchAllTx([notePreimageTx, submitProposalTx]),
		[apiService, notePreimageTx, submitProposalTx]
	);

	useEffect(() => {
		setTotalAmount(beneficiaries.reduce((acc, curr) => acc.add(new BN(curr.amount)), BN_ZERO));
	}, [beneficiaries]);

	const createProposal = async () => {
		if (!apiService || !userPreferences.selectedAccount?.address || !tx || !selectedTrack) {
			return;
		}

		setLoading(true);

		await apiService.createProposal({
			address: userPreferences.selectedAccount.address,
			extrinsicFn: tx,
			track: selectedTrack.name,
			enactment: selectedEnactment,
			enactmentValue: advancedDetails[`${selectedEnactment}`],
			onSuccess: (postId) => {
				toast({
					title: t('CreateTreasuryProposal.proposalCreatedSuccessfully'),
					description: t('CreateTreasuryProposal.proposalCreatedSuccessfullyDescription'),
					status: ENotificationStatus.SUCCESS
				});
				onSuccess(postId);
				window.location.href = `/referenda/${postId}?created=true`;
			},
			onFailed: () => {
				toast({
					title: t('CreateTreasuryProposal.proposalCreationFailed'),
					description: t('CreateTreasuryProposal.proposalCreationFailedDescription'),
					status: ENotificationStatus.ERROR
				});
				setLoading(false);
			}
		});
	};

	return (
		<div className='flex w-full flex-1 flex-col gap-y-4 overflow-hidden'>
			<div className='flex flex-1 flex-col gap-y-3 overflow-y-auto sm:gap-y-4'>
				<SwitchWalletOrAddress
					small
					customAddressSelector={<AddressRelationsPicker withBalance />}
				/>
				<MultipleBeneficiaryForm
					beneficiaries={beneficiaries}
					onChange={(value) => setBeneficiaries(value)}
				/>
				<div className='flex items-center justify-between gap-x-2 rounded-lg border border-border_grey bg-page_background p-2 font-medium text-text_primary max-sm:text-sm sm:p-4'>
					<span>Requested Amount</span>
					<span>
						{formatter.format(Number(formatBnBalance(totalAmount, { withThousandDelimitor: false }, network)))} {NETWORKS_DETAILS[`${network}`].tokenSymbol}
					</span>
				</div>

				<SelectTrack
					selectedTrack={selectedTrack}
					onChange={setSelectedTrack}
					isTreasury
					requestedAmount={totalAmount}
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

			{batchCallTx && (
				<TxFeesDetailsView
					extrinsicFn={[batchCallTx]}
					extraFees={[
						{ name: t('TxFees.preimageDeposit'), value: NETWORKS_DETAILS[`${network}`].preimageBaseDeposit || BN_ZERO },
						{ name: t('TxFees.submissionDeposit'), value: NETWORKS_DETAILS[`${network}`].submissionDeposit || BN_ZERO }
					]}
				/>
			)}

			<Separator />

			<div className='flex justify-end'>
				<Button
					onClick={createProposal}
					isLoading={loading}
					disabled={
						totalAmount.isZero() ||
						!beneficiaries.length ||
						beneficiaries.some((b) => !ValidatorService.isValidSubstrateAddress(b.address) || !ValidatorService.isValidAmount(b.amount)) ||
						!userPreferences.selectedAccount?.address ||
						!selectedTrack ||
						!selectedEnactment ||
						!batchCallTx
					}
				>
					{t('CreateTreasuryProposal.createProposal')}
				</Button>
			</div>
		</div>
	);
}

export default TreasuryProposalLocal;
