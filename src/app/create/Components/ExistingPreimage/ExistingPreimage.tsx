// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { EEnactment, NotificationType } from '@/_shared/types';
import { Button } from '@/app/_shared-components/Button';
import { Form } from '@/app/_shared-components/Form';
import { usePolkadotApiService } from '@/hooks/usePolkadotApiService';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { BN, BN_HUNDRED, BN_ONE, BN_ZERO } from '@polkadot/util';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { useToast } from '@/hooks/useToast';
import SelectTrack from '@/app/_shared-components/Create/SelectTrack/SelectTrack';
import EnactmentForm from '@/app/_shared-components/Create/EnactmentForm/EnactmentForm';
import { useDebounce } from '@/hooks/useDebounce';
import InputText from '@/app/_shared-components/Create/ManualExtrinsic/Params/InputText';
import { ValidatorService } from '@/_shared/_services/validator_service';
import { Separator } from '@/app/_shared-components/Separator';
import TxFeesDetailsView from '@/app/_shared-components/Create/TxFeesDetailsView/TxFeesDetailsView';
import { NETWORKS_DETAILS } from '@/_shared/_constants/networks';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';

function ExistingPreimage() {
	const t = useTranslations();
	const network = getCurrentNetwork();
	const { apiService } = usePolkadotApiService();
	const { userPreferences } = useUserPreferences();
	const [selectedTrack, setSelectedTrack] = useState<string>('');
	const [selectedEnactment, setSelectedEnactment] = useState<EEnactment>(EEnactment.After_No_Of_Blocks);
	const [advancedDetails, setAdvancedDetails] = useState<{ [key in EEnactment]: BN }>({ [EEnactment.At_Block_No]: BN_ONE, [EEnactment.After_No_Of_Blocks]: BN_HUNDRED });

	const { value: preimageHash, debouncedValue: debouncedPreimageHash, setValue: setPreimageHash } = useDebounce('', 500);
	const [preimageLength, setPreimageLength] = useState(0);
	const [isValidPreimageHash, setIsValidPreimageHash] = useState(false);

	const submitProposalTx = useMemo(() => {
		if (!apiService) return null;

		return apiService.getSubmitProposalTx({
			track: selectedTrack,
			preimageHash: debouncedPreimageHash,
			preimageLength,
			enactment: selectedEnactment,
			enactmentValue: advancedDetails[`${selectedEnactment}`]
		});
	}, [apiService, selectedEnactment, selectedTrack, debouncedPreimageHash, preimageLength, advancedDetails]);

	const formData = useForm();
	const { toast } = useToast();
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		if (!apiService || !debouncedPreimageHash || !ValidatorService.isValidPreimageHash(debouncedPreimageHash)) return;

		const fetchPreimageLength = async () => {
			const length = await apiService.getPreimageLengthFromPreimageHash({ preimageHash: debouncedPreimageHash });
			if (!length) {
				setIsValidPreimageHash(false);
				return;
			}
			setPreimageLength(length);
			setIsValidPreimageHash(true);
		};

		fetchPreimageLength();
	}, [apiService, debouncedPreimageHash]);

	const createProposal = async () => {
		if (
			!apiService ||
			!userPreferences.address?.address ||
			!debouncedPreimageHash ||
			!preimageLength ||
			!selectedTrack ||
			!selectedEnactment ||
			!isValidPreimageHash ||
			!ValidatorService.isValidPreimageHash(preimageHash)
		) {
			return;
		}

		setLoading(true);

		apiService.createProposal({
			address: userPreferences.address.address,
			track: selectedTrack,
			preimageHash: debouncedPreimageHash,
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

	return (
		<Form {...formData}>
			<form
				onSubmit={formData.handleSubmit(createProposal)}
				className='flex w-full flex-1 flex-col gap-y-4 overflow-hidden'
			>
				<div className='flex flex-1 flex-col gap-y-4 overflow-y-auto'>
					<div className='flex flex-col gap-y-1'>
						<p className='flex items-center justify-between text-sm text-wallet_btn_text'>
							{t('CreateProposal.preimageHash')}
							<span className='text-xs font-medium text-text_primary'>
								{t('CreateProposal.preimageLength')} {preimageLength || '--'}
							</span>
						</p>
						<InputText
							onChange={setPreimageHash}
							placeholder={t('CreateProposal.preimageHashDescription')}
							value={preimageHash}
						/>
					</div>

					<SelectTrack
						selectedTrack={selectedTrack}
						onChange={(track) => setSelectedTrack(track)}
					/>

					<EnactmentForm
						selectedEnactment={selectedEnactment}
						onEnactmentChange={setSelectedEnactment}
						advancedDetails={advancedDetails}
						onEnactmentValueChange={setAdvancedDetails}
					/>

					<TxFeesDetailsView
						extrinsicFn={[submitProposalTx]}
						extraFees={[{ name: t('TxFees.submissionDeposit'), value: NETWORKS_DETAILS[`${network}`].submissionDeposit || BN_ZERO }]}
					/>
				</div>

				<Separator />

				<div className='flex justify-end'>
					<Button
						type='submit'
						isLoading={loading}
						disabled={
							!userPreferences.address?.address ||
							!selectedTrack ||
							!selectedEnactment ||
							!preimageLength ||
							!isValidPreimageHash ||
							!ValidatorService.isValidPreimageHash(preimageHash)
						}
					>
						{t('CreateTreasuryProposal.createProposal')}
					</Button>
				</div>
			</form>
		</Form>
	);
}

export default ExistingPreimage;
