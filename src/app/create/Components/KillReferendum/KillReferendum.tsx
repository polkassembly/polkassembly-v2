// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { BN, BN_HUNDRED, BN_ONE, BN_ZERO } from '@polkadot/util';
import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { EEnactment, EPostOrigin, EProposalType, ENotificationStatus } from '@/_shared/types';
import { Button } from '@/app/_shared-components/Button';
import { usePolkadotApiService } from '@/hooks/usePolkadotApiService';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { useToast } from '@/hooks/useToast';
import EnactmentForm from '@/app/_shared-components/Create/EnactmentForm/EnactmentForm';
import PreimageDetailsView from '@/app/_shared-components/Create/PreimageDetailsView/PreimageDetailsView';
import InputNumber from '@/app/_shared-components/Create/ManualExtrinsic/Params/InputNumber';
import { NextApiClientService } from '@/app/_client-services/next_api_client_service';
import { useQuery } from '@tanstack/react-query';
import { FIVE_MIN_IN_MILLI } from '@/app/api/_api-constants/timeConstants';
import { Skeleton } from '@/app/_shared-components/Skeleton';
import { canVote } from '@/_shared/_utils/canVote';
import { useDebounce } from '@/hooks/useDebounce';
import { Separator } from '@/app/_shared-components/Separator';
import TxFeesDetailsView from '@/app/_shared-components/Create/TxFeesDetailsView/TxFeesDetailsView';
import { NETWORKS_DETAILS } from '@/_shared/_constants/networks';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import Link from 'next/link';
import { SquareArrowOutUpRight, TriangleAlert } from 'lucide-react';
import SwitchWalletOrAddress from '@/app/_shared-components/SwitchWalletOrAddress/SwitchWalletOrAddress';
import { ValidatorService } from '@/_shared/_services/validator_service';
import AddressRelationsPicker from '@/app/_shared-components/AddressRelationsPicker/AddressRelationsPicker';

function KillReferendum({ onSuccess }: { onSuccess: (proposalId: number) => void }) {
	const t = useTranslations();

	const network = getCurrentNetwork();
	const { apiService } = usePolkadotApiService();
	const { userPreferences } = useUserPreferences();
	const [selectedEnactment, setSelectedEnactment] = useState<EEnactment>(EEnactment.After_No_Of_Blocks);
	const [advancedDetails, setAdvancedDetails] = useState<{ [key in EEnactment]: BN }>({ [EEnactment.At_Block_No]: BN_ONE, [EEnactment.After_No_Of_Blocks]: BN_HUNDRED });

	const { debouncedValue: debouncedReferendumId, setValue: setReferendumId, value: referendumId } = useDebounce<number | undefined>(undefined, 500);

	const { toast } = useToast();
	const [loading, setLoading] = useState(false);

	const fetchProposalDetails = async (refId?: number) => {
		if (!refId) return null;

		const { data, error } = await NextApiClientService.fetchProposalDetails({ proposalType: EProposalType.REFERENDUM_V2, indexOrHash: refId.toString() });

		if (error) {
			throw new Error(error.message || 'Failed to fetch data');
		}
		return data;
	};
	const { data, isFetching, error } = useQuery({
		queryKey: ['referendum', debouncedReferendumId],
		queryFn: ({ queryKey }) => fetchProposalDetails(Number(queryKey[1])),
		placeholderData: (previousData) => previousData,
		staleTime: FIVE_MIN_IN_MILLI,
		enabled: !!debouncedReferendumId,
		retry: false,
		retryOnMount: false,
		refetchOnWindowFocus: false
	});

	const tx = useMemo(() => {
		if (!apiService || !data || !data.index) return null;

		return apiService.getKillReferendumExtrinsic({ referendumId: data.index });
	}, [apiService, data]);

	const preimageDetails = useMemo(() => apiService && tx && apiService.getPreimageTxDetails({ extrinsicFn: tx }), [apiService, tx]);

	const notePreimageTx = useMemo(() => apiService && tx && apiService.getNotePreimageTx({ extrinsicFn: tx }), [apiService, tx]);

	const submitProposalTx = useMemo(
		() =>
			apiService &&
			preimageDetails &&
			apiService.getSubmitProposalTx({
				track: EPostOrigin.REFERENDUM_KILLER,
				preimageHash: preimageDetails.preimageHash,
				preimageLength: preimageDetails.preimageLength,
				enactment: selectedEnactment,
				enactmentValue: advancedDetails[`${selectedEnactment}`]
			}),
		[apiService, preimageDetails, selectedEnactment, advancedDetails]
	);

	const batchCallTx = useMemo(
		() => apiService && notePreimageTx && submitProposalTx && apiService.getBatchAllTx([notePreimageTx, submitProposalTx]),
		[apiService, notePreimageTx, submitProposalTx]
	);

	const createProposal = async () => {
		if (!apiService || !userPreferences.selectedAccount?.address || !tx) {
			return;
		}

		setLoading(true);

		apiService.createProposal({
			address: userPreferences.selectedAccount.address,
			track: EPostOrigin.REFERENDUM_KILLER,
			extrinsicFn: tx,
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
			<div className='flex flex-1 flex-col gap-y-4 overflow-y-auto'>
				<SwitchWalletOrAddress
					small
					customAddressSelector={<AddressRelationsPicker withBalance />}
				/>
				<div className='flex flex-col gap-y-2'>
					<p className='text-sm text-wallet_btn_text'>{t('KillCancelReferendum.referendumId')}</p>
					<InputNumber
						onChange={setReferendumId}
						placeholder={t('KillCancelReferendum.referendumIdDescription')}
						value={referendumId}
					/>
					{isFetching ? (
						<Skeleton className='h-4 w-full' />
					) : (
						data &&
						(canVote(data?.onChainInfo?.status) ? (
							<div className='flex items-center gap-x-4 rounded-lg bg-bg_pink/10 px-4 py-2 text-sm font-medium text-text_primary'>
								<span>#{data.index}</span>
								<span className='flex-1 truncate'>{data.title}</span>
								<Link
									href={`/referenda/${data.index}`}
									target='_blank'
									className='flex items-center gap-x-2 text-sm font-medium text-text_pink'
								>
									<SquareArrowOutUpRight className='h-4 w-4' />
									{t('KillCancelReferendum.viewReferendum')}
								</Link>
							</div>
						) : (
							<div className='flex items-center justify-center gap-x-2 rounded-lg bg-warning/10 p-2 text-sm font-medium text-warning'>
								<TriangleAlert />
								{t('KillCancelReferendum.thisReferendumIsNotOngoing')}
							</div>
						))
					)}
					{error && <div className='flex items-center gap-x-4 rounded-lg bg-failure/10 p-2 text-sm font-medium text-failure'>{error.message}</div>}
				</div>

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
						!userPreferences.selectedAccount?.address ||
						!selectedEnactment ||
						!data ||
						!ValidatorService.isValidNumber(data.index) ||
						!canVote(data?.onChainInfo?.status) ||
						!batchCallTx
					}
				>
					{t('CreateTreasuryProposal.createProposal')}
				</Button>
			</div>
		</div>
	);
}

export default KillReferendum;
