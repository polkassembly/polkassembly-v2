// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

/* eslint-disable @typescript-eslint/no-explicit-any */

import { EEnactment, EPostOrigin, IBeneficiaryInput, ENotificationStatus, IBeneficiary, ENetwork, EAssets, EReactQueryKeys } from '@/_shared/types';
import { Button } from '@/app/_shared-components/Button';
import { usePolkadotApiService } from '@/hooks/usePolkadotApiService';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { BN, BN_HUNDRED, BN_ONE, BN_ZERO } from '@polkadot/util';
import { useMemo, useState } from 'react';
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
import { dayjs } from '@shared/_utils/dayjsInit';
import SwitchWalletOrAddress from '@/app/_shared-components/SwitchWalletOrAddress/SwitchWalletOrAddress';
import AddressRelationsPicker from '@/app/_shared-components/AddressRelationsPicker/AddressRelationsPicker';
import { usePolkadotVault } from '@/hooks/usePolkadotVault';
import { NextApiClientService } from '@/app/_client-services/next_api_client_service';
import { useQuery } from '@tanstack/react-query';
import { convertAssetToUSD } from '@/app/_client-utils/convertAssetToUSD';
import { decimalToBN } from '@/_shared/_utils/decimalToBN';
import { NATIVE_TOKEN_PRICE_FOR_TRACKS } from '@/_shared/_constants/nativeTokenPriceForTracks';

const calculateNativeTokenEquivalent = ({
	beneficiaries,
	network,
	currentTokenPrice,
	dedTokenUsdPrice
}: {
	beneficiaries: IBeneficiary[];
	network: ENetwork;
	currentTokenPrice?: string;
	dedTokenUsdPrice?: string;
}) => {
	if (!beneficiaries?.length || !network) return BN_ZERO;

	return beneficiaries.reduce((acc, beneficiary) => {
		if (!beneficiary.assetId) {
			return acc.add(new BN(beneficiary.amount));
		}

		const nativeTokenDecimals = NETWORKS_DETAILS[`${network}`].tokenDecimals;

		const nativeTokenUsdPrice = network === ENetwork.POLKADOT ? decimalToBN(NATIVE_TOKEN_PRICE_FOR_TRACKS) : currentTokenPrice ? decimalToBN(currentTokenPrice) : null;

		const assetSymbol = NETWORKS_DETAILS[`${network}`].supportedAssets[`${beneficiary.assetId}`]?.symbol;

		const assetUsdPrice = convertAssetToUSD({
			amount: beneficiary.amount,
			asset: assetSymbol as Exclude<EAssets, EAssets.MYTH>,
			network,
			currentTokenPrice,
			dedTokenUsdPrice
		});

		const nativeTokenBN =
			nativeTokenUsdPrice?.value && nativeTokenUsdPrice?.value.gt(BN_ZERO)
				? assetUsdPrice
						.mul(new BN(10).pow(new BN(nativeTokenDecimals)))
						.mul(new BN(10).pow(new BN(nativeTokenUsdPrice?.decimals || 0)))
						.div(nativeTokenUsdPrice.value)
				: BN_ZERO;

		return acc.add(nativeTokenBN);
	}, BN_ZERO);
};

function TreasuryProposalAssethub({ onSuccess }: { onSuccess: (proposalId: number) => void }) {
	const t = useTranslations();

	const { apiService } = usePolkadotApiService();
	const network = getCurrentNetwork();
	const { userPreferences } = useUserPreferences();

	const [beneficiaries, setBeneficiaries] = useState<IBeneficiaryInput[]>([{ address: '', amount: BN_ZERO.toString(), id: dayjs().get('milliseconds').toString() }]);
	const [selectedTrack, setSelectedTrack] = useState<{ name: EPostOrigin; trackId: number }>();
	const [selectedEnactment, setSelectedEnactment] = useState<EEnactment>(EEnactment.After_No_Of_Blocks);
	const [advancedDetails, setAdvancedDetails] = useState<{ [key in EEnactment]: BN }>({ [EEnactment.At_Block_No]: BN_ONE, [EEnactment.After_No_Of_Blocks]: BN_HUNDRED });

	const { toast } = useToast();
	const [loading, setLoading] = useState(false);

	const { setVaultQrState } = usePolkadotVault();
	const getTokensUsdPrice = async () => {
		const to = new Date();
		const from = new Date();
		from.setHours(to.getHours() - 2);
		const { data, error } = await NextApiClientService.getTreasuryStats({ from, to });
		if (error) {
			throw new Error(error.message);
		}
		return { nativeTokenUsdPrice: data?.[0]?.nativeTokenUsdPrice, dedTokenUsdPrice: data?.[0]?.dedTokenUsdPrice };
	};

	const { data: tokensUsdPrice } = useQuery({
		queryKey: [EReactQueryKeys.TOKENS_USD_PRICE],
		queryFn: getTokensUsdPrice,
		retry: false
	});

	const tx = useMemo(() => {
		if (!apiService) return null;

		return apiService.getTreasurySpendExtrinsic({ beneficiaries });
	}, [apiService, beneficiaries]);

	const totalNativeTokenAmount = useMemo(() => {
		return calculateNativeTokenEquivalent({ beneficiaries, network, currentTokenPrice: tokensUsdPrice?.nativeTokenUsdPrice, dedTokenUsdPrice: tokensUsdPrice?.dedTokenUsdPrice });
	}, [beneficiaries, network, tokensUsdPrice]);

	const preimageDetails = useMemo(() => apiService && tx && apiService.getPreimageTxDetails({ extrinsicFn: tx as any }), [apiService, tx]);

	const notePreimageTx = useMemo(() => apiService && tx && apiService.getNotePreimageTx({ extrinsicFn: tx as any }), [apiService, tx]);

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
		() => apiService && notePreimageTx && submitProposalTx && apiService.getBatchAllTx([notePreimageTx, submitProposalTx] as any),
		[apiService, notePreimageTx, submitProposalTx]
	);

	const createProposal = async () => {
		if (!apiService || !userPreferences.selectedAccount?.address || !userPreferences.wallet || !tx || !selectedTrack) {
			return;
		}

		setLoading(true);

		await apiService.createProposal({
			address: userPreferences.selectedAccount?.address,
			selectedAccount: userPreferences.selectedAccount,
			wallet: userPreferences.wallet,
			setVaultQrState,
			extrinsicFn: tx as any,
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
		<div className='flex w-full flex-1 flex-col gap-y-2 overflow-hidden sm:gap-y-4'>
			<div className='flex flex-1 flex-col gap-y-3 overflow-y-auto sm:gap-y-4'>
				<SwitchWalletOrAddress
					small
					customAddressSelector={
						<AddressRelationsPicker
							withBalance
							showTransferableBalance
						/>
					}
				/>
				<MultipleBeneficiaryForm
					beneficiaries={beneficiaries}
					onChange={setBeneficiaries}
					multiAsset
					stagedPayment
				/>

				<SelectTrack
					selectedTrack={selectedTrack}
					onChange={setSelectedTrack}
					isTreasury
					requestedAmount={totalNativeTokenAmount}
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
					extrinsicFn={[batchCallTx as any]}
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
						!beneficiaries.length ||
						beneficiaries.some((b) => !ValidatorService.isValidSubstrateAddress(b.address) || !ValidatorService.isValidAmount(b.amount) || b.isInvalid) ||
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

export default TreasuryProposalAssethub;
