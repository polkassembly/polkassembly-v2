// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { EEnactment, EPostOrigin, ENotificationStatus } from '@/_shared/types';
import { Button } from '@/app/_shared-components/Button';
import { usePolkadotApiService } from '@/hooks/usePolkadotApiService';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { BN, BN_HUNDRED, BN_ONE, BN_ZERO } from '@polkadot/util';
import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useToast } from '@/hooks/useToast';
import SelectTrack from '@/app/_shared-components/Create/SelectTrack/SelectTrack';
import EnactmentForm from '@/app/_shared-components/Create/EnactmentForm/EnactmentForm';
import PreimageDetailsView from '@/app/_shared-components/Create/PreimageDetailsView/PreimageDetailsView';
import { Separator } from '@/app/_shared-components/Separator';
import TxFeesDetailsView from '@/app/_shared-components/Create/TxFeesDetailsView/TxFeesDetailsView';
import { NETWORKS_DETAILS } from '@/_shared/_constants/networks';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import SwitchWalletOrAddress from '@/app/_shared-components/SwitchWalletOrAddress/SwitchWalletOrAddress';
import BalanceInput from '@/app/_shared-components/BalanceInput/BalanceInput';

function CreateBounty() {
	const t = useTranslations();

	const { apiService } = usePolkadotApiService();
	const network = getCurrentNetwork();
	const { userPreferences } = useUserPreferences();
	const [bountyAmount, setBountyAmount] = useState<BN>(BN_ZERO);

	const [selectedTrack, setSelectedTrack] = useState<{ name: EPostOrigin; trackId: number }>();
	const [selectedEnactment, setSelectedEnactment] = useState<EEnactment>(EEnactment.After_No_Of_Blocks);
	const [advancedDetails, setAdvancedDetails] = useState<{ [key in EEnactment]: BN }>({ [EEnactment.At_Block_No]: BN_ONE, [EEnactment.After_No_Of_Blocks]: BN_HUNDRED });

	const { toast } = useToast();
	const [loading, setLoading] = useState(false);

	const [bountyId, setBountyId] = useState<number>();

	const tx = useMemo(() => {
		if (!apiService || !bountyId) return null;

		return apiService.getApproveBountyTx({ bountyId });
	}, [apiService, bountyId]);

	const proposeBountyTx = useMemo(() => apiService && apiService.getProposeBountyTx({ bountyAmount }), [apiService, bountyAmount]);

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
		() => apiService && notePreimageTx && submitProposalTx && apiService.getBatchCallTx([notePreimageTx, submitProposalTx]),
		[apiService, notePreimageTx, submitProposalTx]
	);

	const createProposal = async () => {
		if (!apiService || !userPreferences.address?.address || !tx || !selectedTrack) {
			return;
		}

		setLoading(true);

		apiService.createProposal({
			address: userPreferences.address.address,
			track: selectedTrack.name,
			extrinsicFn: tx,
			enactment: selectedEnactment,
			enactmentValue: advancedDetails[`${selectedEnactment}`],
			onSuccess: (postId) => {
				toast({
					title: t('CreateTreasuryProposal.proposalCreatedSuccessfully'),
					description: t('CreateTreasuryProposal.proposalCreatedSuccessfullyDescription'),
					status: ENotificationStatus.SUCCESS
				});
				window.location.href = `/bounty/${postId}?created=true`;
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

	const proposeBounty = async () => {
		if (!apiService || bountyAmount.isZero() || !userPreferences.address?.address) {
			setLoading(false);
			return;
		}

		setLoading(true);

		await apiService.proposeBounty({
			address: userPreferences.address.address,
			bountyAmount,
			onSuccess: (id) => {
				setBountyId(id);
				toast({
					title: t('CreateBounty.bountyProposedSuccessfully'),
					description: t('CreateBounty.bountyProposedSuccessfullyDescription'),
					status: ENotificationStatus.SUCCESS
				});
				createProposal();
			},
			onFailed: () => {
				toast({
					title: t('CreateBounty.bountyProposalFailed'),
					description: t('CreateBounty.bountyProposalFailedDescription'),
					status: ENotificationStatus.ERROR
				});
				setLoading(false);
			}
		});
	};

	return (
		<div className='flex w-full flex-1 flex-col gap-y-4 overflow-hidden'>
			<div className='flex flex-1 flex-col gap-y-3 overflow-y-auto sm:gap-y-4'>
				<SwitchWalletOrAddress />
				<BalanceInput
					defaultValue={bountyAmount}
					onChange={({ value }) => setBountyAmount(value)}
					label={t('CreateBounty.bountyAmount')}
				/>

				<SelectTrack
					selectedTrack={selectedTrack}
					onChange={setSelectedTrack}
					isTreasury
					requestedAmount={bountyAmount}
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

			{proposeBountyTx && (
				<TxFeesDetailsView
					extrinsicFn={bountyId ? (batchCallTx ? [batchCallTx] : []) : [proposeBountyTx]}
					extraFees={[
						{ name: t('TxFees.preimageDeposit'), value: NETWORKS_DETAILS[`${network}`].preimageBaseDeposit || BN_ZERO },
						{ name: t('TxFees.submissionDeposit'), value: NETWORKS_DETAILS[`${network}`].submissionDeposit || BN_ZERO }
					]}
				/>
			)}

			<Separator />

			<div className='flex justify-end'>
				<Button
					onClick={proposeBounty}
					isLoading={loading}
					disabled={bountyAmount.isZero() || !userPreferences.address?.address || !selectedTrack || !selectedEnactment || !batchCallTx}
				>
					{t('CreateBounty.proposeBounty')}
				</Button>
			</div>
		</div>
	);
}

export default CreateBounty;
