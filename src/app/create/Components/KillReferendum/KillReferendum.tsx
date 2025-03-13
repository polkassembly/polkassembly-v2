// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { BN, BN_HUNDRED, BN_ONE } from '@polkadot/util';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { EEnactment, EPostOrigin, EProposalType, NotificationType } from '@/_shared/types';
import { redirectFromServer } from '@/app/_client-utils/redirectFromServer';
import AddressDropdown from '@/app/_shared-components/AddressDropdown/AddressDropdown';
import { Button } from '@/app/_shared-components/Button';
import { Form } from '@/app/_shared-components/Form';
import WalletButtons from '@/app/_shared-components/WalletsUI/WalletButtons/WalletButtons';
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

function KillReferendum() {
	const t = useTranslations();
	const { apiService } = usePolkadotApiService();
	const { userPreferences } = useUserPreferences();
	const [selectedEnactment, setSelectedEnactment] = useState<EEnactment>(EEnactment.After_No_Of_Blocks);
	const [advancedDetails, setAdvancedDetails] = useState<{ [key in EEnactment]: BN }>({ [EEnactment.At_Block_No]: BN_ONE, [EEnactment.After_No_Of_Blocks]: BN_HUNDRED });

	const [referendumId, setReferendumId] = useState<string>();

	const [preimageDetails, setPreimageDetails] = useState<{ preimageHash: string; preimageLength: number }>({
		preimageHash: '',
		preimageLength: 0
	});

	const formData = useForm();
	const { toast } = useToast();
	const [loading, setLoading] = useState(false);

	const fetchProposalDetails = async (refId?: string) => {
		if (!refId) return null;

		const { data, error } = await NextApiClientService.fetchProposalDetails({ proposalType: EProposalType.REFERENDUM_V2, indexOrHash: refId });

		if (error) {
			throw new Error(error.message || 'Failed to fetch data');
		}
		return data;
	};
	const { data, isFetching, error } = useQuery({
		queryKey: ['referendum', referendumId],
		queryFn: ({ queryKey }) => fetchProposalDetails(queryKey[1]),
		placeholderData: (previousData) => previousData,
		staleTime: FIVE_MIN_IN_MILLI
	});

	useEffect(() => {
		if (!apiService || !data || !data.index || !canVote(data?.onChainInfo?.status, data?.onChainInfo?.preparePeriodEndsAt)) return;

		const tx = apiService.getKillReferendumExtrinsic({ referendumId: data.index.toString() });
		if (!tx) return;

		const preImage = apiService.getPreimageTxDetails({ extrinsicFn: tx });
		if (!preImage) return;

		setPreimageDetails({ preimageHash: preImage.preimageHash, preimageLength: preImage.preimageLength });
	}, [apiService, data]);

	const createProposal = async ({ preimageHash, preimageLength }: { preimageHash: string; preimageLength: number }) => {
		if (!apiService || !userPreferences.address?.address || !preimageHash || !preimageLength) {
			setLoading(false);
			return;
		}

		apiService.createTreasuryProposal({
			address: userPreferences.address.address,
			track: EPostOrigin.REFERENDUM_KILLER,
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
		if (!apiService || !userPreferences.address?.address || !data || !data.index || !canVote(data?.onChainInfo?.status, data?.onChainInfo?.preparePeriodEndsAt)) return;

		const tx = apiService.getCancelReferendumExtrinsic({ referendumId: data.index.toString() });
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

					<div className='flex flex-col gap-y-2'>
						<p className='text-sm text-wallet_btn_text'>{t('KillCancelReferendum.referendumId')}</p>
						<InputNumber
							onChange={setReferendumId}
							disabled={isFetching}
							placeholder={t('KillCancelReferendum.referendumIdDescription')}
						/>
						{isFetching && <Skeleton className='h-4 w-full' />}
						{data &&
							(canVote(data?.onChainInfo?.status, data?.onChainInfo?.preparePeriodEndsAt) ? (
								<div className='rounded bg-grey_bg p-2 text-sm text-text_primary'>{data.title}</div>
							) : (
								<div className='rounded bg-grey_bg p-2 text-sm text-text_primary'>{t('KillCancelReferendum.thisReferendumIsNotOngoing')}</div>
							))}
						{error && <div className='rounded bg-grey_bg p-2 text-sm text-text_primary'>{error.message}</div>}
					</div>

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
							!userPreferences.address?.address || !selectedEnactment || !data || !data.index || !canVote(data?.onChainInfo?.status, data?.onChainInfo?.preparePeriodEndsAt)
						}
					>
						{t('CreateTreasuryProposal.createProposal')}
					</Button>
				</div>
			</form>
		</Form>
	);
}

export default KillReferendum;
