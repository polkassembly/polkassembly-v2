// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { EEnactment, EPostOrigin, ENotificationStatus, EProposalType } from '@/_shared/types';
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
import AddressRelationsPicker from '@/app/_shared-components/AddressRelationsPicker/AddressRelationsPicker';
import { RadioGroup, RadioGroupItem } from '@/app/_shared-components/RadioGroup/RadioGroup';
import { Label } from '@/app/_shared-components/Label';
import { NextApiClientService } from '@/app/_client-services/next_api_client_service';
import { useQuery } from '@tanstack/react-query';
import { getSubstrateAddress } from '@/_shared/_utils/getSubstrateAddress';
import { Skeleton } from '@/app/_shared-components/Skeleton';
import { useDebounce } from '@/hooks/useDebounce';
import { Input } from '@/app/_shared-components/Input';
import { FIVE_MIN_IN_MILLI } from '@/app/api/_api-constants/timeConstants';

enum ECreateBountyOptions {
	BOUNTY_EXISTS = 'bountyExists',
	NEW_BOUNTY = 'newBounty'
}

function CreateBounty({ onSuccess }: { onSuccess: (proposalId: number) => void }) {
	const t = useTranslations();

	const { apiService } = usePolkadotApiService();
	const network = getCurrentNetwork();
	const { userPreferences } = useUserPreferences();

	const [bountyOption, setBountyOption] = useState<ECreateBountyOptions>(ECreateBountyOptions.NEW_BOUNTY);

	const [bountyAmount, setBountyAmount] = useState<BN>(BN_ZERO);

	const [selectedTrack, setSelectedTrack] = useState<{ name: EPostOrigin; trackId: number }>();
	const [selectedEnactment, setSelectedEnactment] = useState<EEnactment>(EEnactment.After_No_Of_Blocks);
	const [advancedDetails, setAdvancedDetails] = useState<{ [key in EEnactment]: BN }>({ [EEnactment.At_Block_No]: BN_ONE, [EEnactment.After_No_Of_Blocks]: BN_HUNDRED });

	const { toast } = useToast();
	const [loading, setLoading] = useState(false);

	const { value: bountyId, debouncedValue: debouncedBountyId, setValue: setBountyId } = useDebounce<number | undefined>(undefined, 500);

	const tx = useMemo(() => {
		if (!apiService || !debouncedBountyId) return null;

		return apiService.getApproveBountyTx({ bountyId: debouncedBountyId });
	}, [apiService, debouncedBountyId]);

	const proposeBountyTx = useMemo(() => apiService && bountyAmount && !bountyAmount.isZero() && apiService.getProposeBountyTx({ bountyAmount }), [apiService, bountyAmount]);

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

	const fetchBountyFromId = async () => {
		if (!debouncedBountyId || bountyOption === ECreateBountyOptions.NEW_BOUNTY) return null;

		const { data, error } = await NextApiClientService.fetchProposalDetails({ proposalType: EProposalType.BOUNTY, indexOrHash: debouncedBountyId.toString() });

		if (error || !data) {
			throw new Error('Failed to fetch bounty');
		}

		return data;
	};

	const {
		data: existingBountyData,
		error: existingBountyError,
		isFetching: existingBountyFetching
	} = useQuery({
		queryKey: ['bounty', debouncedBountyId],
		queryFn: () => fetchBountyFromId(),
		enabled: !!debouncedBountyId && bountyOption === ECreateBountyOptions.BOUNTY_EXISTS,
		retry: false,
		refetchOnWindowFocus: false,
		refetchOnMount: false,
		staleTime: FIVE_MIN_IN_MILLI
	});

	const canCreateProposalWithExistingBounty = useMemo(() => {
		if (!existingBountyData?.onChainInfo?.proposer || !userPreferences.selectedAccount?.address) return false;

		return getSubstrateAddress(existingBountyData.onChainInfo.proposer) === getSubstrateAddress(userPreferences.selectedAccount.address);
	}, [existingBountyData, userPreferences.selectedAccount?.address]);

	const createProposal = async (id: number) => {
		if (!apiService || !userPreferences.selectedAccount?.address || !id || !selectedTrack) {
			setLoading(false);
			toast({
				title: t('CreateTreasuryProposal.invalidParameters'),
				description: t('CreateTreasuryProposal.invalidParametersDescription'),
				status: ENotificationStatus.ERROR
			});
			return;
		}

		const proposalTx = apiService.getApproveBountyTx({ bountyId: id });

		if (!proposalTx) {
			setLoading(false);
			toast({
				title: t('CreateTreasuryProposal.proposalCreationFailed'),
				description: t('CreateTreasuryProposal.proposalCreationFailedDescription'),
				status: ENotificationStatus.ERROR
			});
			return;
		}

		setLoading(true);
		apiService.createProposal({
			address: userPreferences.selectedAccount.address,
			track: selectedTrack.name,
			extrinsicFn: proposalTx,
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

	const proposeBounty = async () => {
		if (!apiService || bountyAmount.isZero() || !userPreferences.selectedAccount?.address) {
			setLoading(false);
			return;
		}

		setLoading(true);

		await apiService.proposeBounty({
			address: userPreferences.selectedAccount.address,
			bountyAmount,
			onSuccess: (id) => {
				setBountyId(id);
				toast({
					title: t('CreateBounty.bountyProposedSuccessfully'),
					description: t('CreateBounty.bountyProposedSuccessfullyDescription'),
					status: ENotificationStatus.SUCCESS
				});
				createProposal(id);
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

	const bountyReward = useMemo(() => new BN(existingBountyData?.onChainInfo?.reward || 0), [existingBountyData]);

	return (
		<div className='flex w-full flex-1 flex-col gap-y-4 overflow-hidden'>
			<div className='flex flex-1 flex-col gap-y-3 overflow-y-auto sm:gap-y-4'>
				<SwitchWalletOrAddress
					small
					customAddressSelector={<AddressRelationsPicker withBalance />}
				/>

				<div className='flex flex-col gap-y-1'>
					<p className='text-xs text-wallet_btn_text sm:text-sm'>{t('CreateBounty.haveYouCreatedABountyAlready')}</p>
					<RadioGroup
						className='flex items-center gap-x-4'
						onValueChange={(e) => {
							setBountyOption(e as ECreateBountyOptions);
						}}
						value={bountyOption}
					>
						<div className='flex items-center space-x-2'>
							<RadioGroupItem
								value={ECreateBountyOptions.BOUNTY_EXISTS}
								id={ECreateBountyOptions.BOUNTY_EXISTS}
							/>
							<Label
								className='cursor-pointer text-sm text-wallet_btn_text'
								htmlFor={ECreateBountyOptions.BOUNTY_EXISTS}
							>
								{t('CreateBounty.yes')}
							</Label>
						</div>
						<div className='flex items-center space-x-2'>
							<RadioGroupItem
								value={ECreateBountyOptions.NEW_BOUNTY}
								id={ECreateBountyOptions.NEW_BOUNTY}
							/>
							<Label
								className='cursor-pointer text-sm text-wallet_btn_text'
								htmlFor={ECreateBountyOptions.NEW_BOUNTY}
							>
								{t('CreateBounty.no')}
							</Label>
						</div>
					</RadioGroup>
				</div>

				{bountyOption === ECreateBountyOptions.BOUNTY_EXISTS && (
					<div className='flex flex-col gap-y-1'>
						<p className='text-xs text-wallet_btn_text sm:text-sm'>{t('CreateBounty.enterBountyId')}</p>
						<Input
							className='text-sm'
							value={debouncedBountyId}
							onChange={(e) => setBountyId(Number(e.target.value))}
						/>
						{existingBountyFetching && <Skeleton className='h-6 w-full' />}
						{existingBountyError && <p className='text-sm text-failure'>{existingBountyError.message}</p>}
						{existingBountyData?.onChainInfo?.proposer &&
							userPreferences.selectedAccount?.address &&
							getSubstrateAddress(existingBountyData.onChainInfo.proposer) !== getSubstrateAddress(userPreferences.selectedAccount.address) && (
								<p className='text-sm text-failure'>{t('CreateBounty.yourAreNotTheProposer')}</p>
							)}
					</div>
				)}

				<BalanceInput
					value={bountyOption === ECreateBountyOptions.BOUNTY_EXISTS ? bountyReward : bountyAmount}
					onChange={({ value }) => setBountyAmount(value)}
					label={t('CreateBounty.bountyAmount')}
					disabled={bountyOption === ECreateBountyOptions.BOUNTY_EXISTS}
				/>

				<SelectTrack
					selectedTrack={selectedTrack}
					onChange={setSelectedTrack}
					isTreasury
					requestedAmount={bountyOption === ECreateBountyOptions.BOUNTY_EXISTS ? bountyReward : bountyAmount}
				/>

				<EnactmentForm
					selectedEnactment={selectedEnactment}
					onEnactmentChange={setSelectedEnactment}
					advancedDetails={advancedDetails}
					onEnactmentValueChange={setAdvancedDetails}
				/>
			</div>

			{preimageDetails && existingBountyData && bountyOption === ECreateBountyOptions.BOUNTY_EXISTS && (
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
					onClick={bountyOption === ECreateBountyOptions.BOUNTY_EXISTS && bountyId ? () => createProposal(bountyId) : proposeBounty}
					isLoading={loading}
					disabled={
						!userPreferences.selectedAccount?.address ||
						!selectedTrack ||
						!selectedEnactment ||
						(bountyOption === ECreateBountyOptions.NEW_BOUNTY && !proposeBountyTx) ||
						(bountyOption === ECreateBountyOptions.BOUNTY_EXISTS && (existingBountyFetching || !canCreateProposalWithExistingBounty))
					}
				>
					{bountyOption === ECreateBountyOptions.BOUNTY_EXISTS ? t('CreateBounty.createProposal') : t('CreateBounty.proposeBounty')}
				</Button>
			</div>
		</div>
	);
}

export default CreateBounty;
