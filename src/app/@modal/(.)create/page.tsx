// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@ui/Dialog/Dialog';
import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import CreateComponent, { CreateRef } from '@/app/create/Components/Create';
import { useTranslations } from 'next-intl';
import { ENetwork, EProposalStep } from '@/_shared/types';
import { NETWORKS_DETAILS } from '@/_shared/_constants/networks';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { ChevronLeft } from 'lucide-react';

function CreateModal() {
	const router = useRouter();
	const t = useTranslations();
	const network = getCurrentNetwork();
	const [step, setStep] = useState<EProposalStep>();
	const createRef = useRef<CreateRef>(null);

	const handleOpenChange = () => {
		router.back();
	};

	const titles = {
		create: t('CreateProposal.create'),
		[EProposalStep.CREATE_PREIMAGE]: t('CreateProposal.createPreimage'),
		[EProposalStep.EXISTING_PREIMAGE]: t('CreateProposal.existingPreimage'),
		[EProposalStep.CREATE_TREASURY_PROPOSAL]: `${t('CreateProposal.spend')} ${NETWORKS_DETAILS[network as ENetwork]?.tokenSymbol} ${t('CreateProposal.from')} ${NETWORKS_DETAILS[network as ENetwork]?.name} ${t('CreateProposal.Treasury')}`,
		[EProposalStep.CREATE_USDX_PROPOSAL]: t('CreateProposal.usdxProposal'),
		[EProposalStep.CREATE_CANCEL_REF_PROPOSAL]: t('CreateProposal.cancelReferendum'),
		[EProposalStep.CREATE_KILL_REF_PROPOSAL]: t('CreateProposal.killReferendum'),
		[EProposalStep.CREATE_BOUNTY]: t('CreateProposal.createBounty')
	};

	const goBack = () => {
		createRef.current?.setStep(undefined);
	};

	return (
		<Dialog
			defaultOpen
			open
			onOpenChange={handleOpenChange}
		>
			<DialogContent className='max-w-screen-md p-4 sm:p-6'>
				<DialogHeader>
					<DialogTitle className='flex items-center gap-x-2'>
						{step && (
							<button
								type='button'
								className='text-text_primary'
								onClick={goBack}
							>
								<ChevronLeft />
							</button>
						)}
						{titles[step || 'create']}
					</DialogTitle>
				</DialogHeader>
				<div className='flex max-h-[80vh] w-full flex-col overflow-y-auto sm:px-4'>
					<CreateComponent
						ref={createRef}
						isModal
						onStepChange={setStep}
					/>
				</div>
			</DialogContent>
		</Dialog>
	);
}

export default CreateModal;
