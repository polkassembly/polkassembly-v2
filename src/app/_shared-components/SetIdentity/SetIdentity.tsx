// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { useState } from 'react';
import { useIdentityService } from '@/hooks/useIdentityService';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { useForm } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { BN, BN_ZERO } from '@polkadot/util';
import Link from 'next/link';
import { useUser } from '@/hooks/useUser';
import { NETWORKS_DETAILS } from '@/_shared/_constants/networks';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { useQuery } from '@tanstack/react-query';
import { FIVE_MIN_IN_MILLI } from '@/app/api/_api-constants/timeConstants';
import { ArrowLeft } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { ESetIdentityStep } from '@/_shared/types';
import { Button } from '../Button';
import SetIdentityFees from './SetIdentityFees/SetIdentityFees';
import RequestJudgement from './RequestJudgement/RequestJudgement';
import IdentitySuccessScreen from './IdentitySuccessScreen/IdentitySuccessScreen';
import TeleportToPeopleChain from '../TeleportFunds/TeleportToPeopleChain';
import SetIdentityForm from './SetIdentityForm/SetIdentityForm';

interface ISetIdentityFormFields {
	displayName: string;
	legalName?: string;
	email: string;
	twitter?: string;
	matrix?: string;
}

function SetIdentity() {
	const t = useTranslations();
	const { user } = useUser();
	const { userPreferences } = useUserPreferences();

	const network = getCurrentNetwork();

	const formData = useForm<ISetIdentityFormFields>();

	const { identityService } = useIdentityService();

	const searchParams = useSearchParams();

	const open = searchParams.get('open');

	const [step, setStep] = useState<ESetIdentityStep>(
		open && Object.values(ESetIdentityStep).includes(open as ESetIdentityStep) ? (open as unknown as ESetIdentityStep) : ESetIdentityStep.GAS_FEE
	);

	const fetchRegistrarFees = async () => {
		if (!identityService) return null;

		const registrars = await identityService.getRegistrars();
		const { polkassemblyRegistrarIndex } = NETWORKS_DETAILS[`${network}`].peopleChainDetails;
		if (!polkassemblyRegistrarIndex) return null;

		return new BN(registrars?.[`${polkassemblyRegistrarIndex}`]?.fee);
	};

	const { data: registrarFee } = useQuery({
		queryKey: ['registrarFee', user?.id, userPreferences.selectedAccount?.address],
		queryFn: () => fetchRegistrarFees(),
		placeholderData: (previousData) => previousData,
		staleTime: FIVE_MIN_IN_MILLI,
		retry: false,
		refetchOnMount: false,
		refetchOnWindowFocus: false
	});

	if (!user) {
		return (
			<p className='flex items-center gap-x-1 text-center text-sm text-text_primary'>
				{t('SetIdentity.please')}
				<Link
					href='/login'
					className='text-text_pink'
				>
					{t('SetIdentity.login')}
				</Link>{' '}
				{t('SetIdentity.toSet')}
			</p>
		);
	}

	return step === ESetIdentityStep.GAS_FEE ? (
		<SetIdentityFees
			onNext={() => setStep(ESetIdentityStep.SET_IDENTITY_FORM)}
			onRequestJudgement={() => setStep(ESetIdentityStep.REQUEST_JUDGEMENT)}
			registrarFee={registrarFee || BN_ZERO}
		/>
	) : step === ESetIdentityStep.IDENTITY_SUCCESS && userPreferences.selectedAccount?.address ? (
		<IdentitySuccessScreen
			address={userPreferences.selectedAccount.address}
			email={formData.getValues('email')}
			displayName={formData.getValues('displayName')}
			legalName={formData.getValues('legalName')}
			twitter={formData.getValues('twitter')}
			matrix={formData.getValues('matrix')}
			onNext={() => setStep(ESetIdentityStep.REQUEST_JUDGEMENT)}
		/>
	) : step === ESetIdentityStep.REQUEST_JUDGEMENT ? (
		<RequestJudgement onSetIdentity={() => setStep(ESetIdentityStep.SET_IDENTITY_FORM)} />
	) : step === ESetIdentityStep.TELEPORT_TO_PEOPLE_CHAIN ? (
		<div className='flex flex-1 flex-col gap-y-4'>
			<div>
				<Button
					variant='ghost'
					size='sm'
					className='text-sm text-text_primary'
					leftIcon={<ArrowLeft />}
					onClick={() => setStep(ESetIdentityStep.SET_IDENTITY_FORM)}
				>
					{t('SetIdentity.setIdentity')}
				</Button>
			</div>
			<TeleportToPeopleChain
				onSuccess={() => {
					setStep(ESetIdentityStep.SET_IDENTITY_FORM);
				}}
			/>
		</div>
	) : (
		<SetIdentityForm
			registrarFee={registrarFee || BN_ZERO}
			onTeleport={() => setStep(ESetIdentityStep.TELEPORT_TO_PEOPLE_CHAIN)}
			onSuccess={() => setStep(ESetIdentityStep.IDENTITY_SUCCESS)}
		/>
	);
}

export default SetIdentity;
