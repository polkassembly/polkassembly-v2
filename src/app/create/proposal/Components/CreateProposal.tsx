// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import AddressDropdown from '@/app/_shared-components/AddressDropdown/AddressDropdown';
import ManualExtrinsic from '@/app/_shared-components/Create/ManualExtrinsic/ManualExtrinsic';
import { useState } from 'react';
import { Button } from '@/app/_shared-components/Button';
import { useUser } from '@/hooks/useUser';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import TreasuryProposalLocal from './TreasuryProposal/TreasuryProposalLocal';

enum EProposalStep {
	CREATE_PREIMAGE = 'CREATE_PREIMAGE',
	CREATE_PROPOSAL = 'CREATE_PROPOSAL'
}

function CreateProposal() {
	const [step, setStep] = useState<EProposalStep>();
	const { user } = useUser();
	const t = useTranslations();

	return (
		<div className='flex h-full flex-1 flex-col gap-y-4'>
			{!user ? (
				<p className='flex items-center gap-x-1 text-center text-sm text-text_primary'>
					{t('Create.please')}
					<Link
						href='/login'
						className='text-text_pink'
					>
						{t('Create.login')}
					</Link>{' '}
					{t('Create.toCreate')}
				</p>
			) : step === EProposalStep.CREATE_PREIMAGE ? (
				<>
					<AddressDropdown withBalance />
					<ManualExtrinsic />
				</>
			) : step === EProposalStep.CREATE_PROPOSAL ? (
				<TreasuryProposalLocal />
			) : (
				<div className='flex flex-col gap-y-4'>
					<Button
						variant='outline'
						size='lg'
						className='flex w-full items-center justify-start p-2'
						onClick={() => setStep(EProposalStep.CREATE_PREIMAGE)}
					>
						Create Preimage
					</Button>
					<Button
						variant='outline'
						size='lg'
						className='flex w-full items-center justify-start p-2'
						onClick={() => setStep(EProposalStep.CREATE_PROPOSAL)}
					>
						Create Treasury Proposal
					</Button>
				</div>
			)}
		</div>
	);
}

export default CreateProposal;
