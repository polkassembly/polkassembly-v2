// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import AddressDropdown from '@/app/_shared-components/AddressDropdown/AddressDropdown';
import ManualExtrinsic from '@/app/_shared-components/Create/ManualExtrinsic/ManualExtrinsic';
import { useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { useUser } from '@/hooks/useUser';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { NETWORKS_DETAILS } from '@/_shared/_constants/networks';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import DiscussionIcon from '@assets/icons/create-discussion.svg';
import PreimageIcon from '@assets/icons/create-preimage.svg';
import ExistingPreimageIcon from '@assets/icons/create-existing.svg';
import TreasuryProposalIcon from '@assets/icons/create-treasury.svg';
import UsdxProposalIcon from '@assets/icons/create-assethub.svg';
import CancelReferendumIcon from '@assets/icons/create-cancel.svg';
import KillReferendumIcon from '@assets/icons/create-kill.svg';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Separator } from '@/app/_shared-components/Separator';
import { ENetwork, EProposalStep } from '@/_shared/types';
import WalletButtons from '@/app/_shared-components/WalletsUI/WalletButtons/WalletButtons';
import TreasuryProposalLocal from './TreasuryProposaLocal/TreasuryProposalLocal';
import TreasuryProposalAssethub from './TreasuryProposalAssethub/TreasuryProposalAssethub';
import CancelReferendum from './CancelReferendum/CancelReferendum';
import KillReferendum from './KillReferendum/KillReferendum';
import ExistingPreimage from './ExistingPreimage/ExistingPreimage';

export interface CreateRef {
	setStep: (step?: EProposalStep) => void;
}

function CreateOption({
	href,
	label,
	icon,
	description,
	disabled,
	onClick,
	iconClassName
}: {
	href?: string;
	label: string;
	icon: string;
	iconClassName: string;
	description: string;
	disabled?: boolean;
	onClick?: () => void;
}) {
	const iconComponent = (
		<div className={cn('flex h-[40px] w-[40px] items-center justify-center rounded-full', iconClassName)}>
			<Image
				src={icon}
				alt='quick action icon'
				className='h-6 w-6'
			/>
		</div>
	);

	const buttonComponent = (
		<button
			type='button'
			className='flex flex-1 items-center gap-x-2 rounded-lg bg-create_option_bg px-4 py-2 text-text_primary transition-all duration-200 ease-in hover:bg-bg_pink/10 hover:text-text_pink'
			onClick={onClick}
			disabled={disabled}
		>
			<div className='flex flex-1 flex-col gap-y-1 text-left'>
				<p className='text-sm font-semibold'>{label}</p>
				<p className='text-xs font-medium text-wallet_btn_text'>{description}</p>
			</div>
			<ChevronRight className='h-5 w-5 font-semibold text-text_primary' />
		</button>
	);

	const component = href ? (
		<Link
			className='flex flex-1'
			href={href}
		>
			{buttonComponent}
		</Link>
	) : (
		buttonComponent
	);

	return (
		<div className='flex items-center gap-x-4'>
			{iconComponent}
			{component}
		</div>
	);
}

const Create = forwardRef<CreateRef, { isModal?: boolean; onStepChange?: (step?: EProposalStep) => void }>(({ isModal = false, onStepChange }, ref) => {
	const [step, setStep] = useState<EProposalStep>();
	const { user } = useUser();
	const t = useTranslations();

	const network = getCurrentNetwork();

	const isAssetHubEnabled = Object.keys(NETWORKS_DETAILS[`${network}`]?.supportedAssets).length > 0;

	const titles = {
		create: t('CreateProposal.create'),
		[EProposalStep.CREATE_PREIMAGE]: t('CreateProposal.createPreimage'),
		[EProposalStep.EXISTING_PREIMAGE]: t('CreateProposal.existingPreimage'),
		[EProposalStep.CREATE_TREASURY_PROPOSAL]: `${t('CreateProposal.spend')} ${NETWORKS_DETAILS[network as ENetwork]?.tokenSymbol} ${t('CreateProposal.from')} ${NETWORKS_DETAILS[network as ENetwork]?.name} ${t('CreateProposal.Treasury')}`,
		[EProposalStep.CREATE_USDX_PROPOSAL]: t('CreateProposal.usdxProposal'),
		[EProposalStep.CREATE_CANCEL_REF_PROPOSAL]: t('CreateProposal.cancelReferendum'),
		[EProposalStep.CREATE_KILL_REF_PROPOSAL]: t('CreateProposal.killReferendum')
	};

	// Expose setStep through the ref
	useImperativeHandle(ref, () => ({
		setStep
	}));

	useEffect(() => {
		onStepChange?.(step);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [step]);

	return (
		<>
			{!isModal && (
				<>
					<div className='mb-4 flex items-center gap-x-2 text-xl font-semibold text-text_primary'>
						{step && (
							<button
								type='button'
								className='text-text_primary'
								onClick={() => setStep(undefined)}
							>
								<ChevronLeft />
							</button>
						)}
						{titles[step || 'create']}
					</div>
					<Separator className='my-4' />
				</>
			)}
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
				) : (
					<>
						{step && (
							<>
								<WalletButtons small />
								<AddressDropdown withBalance />
							</>
						)}
						{step === EProposalStep.CREATE_PREIMAGE && <ManualExtrinsic />}
						{step === EProposalStep.EXISTING_PREIMAGE && <ExistingPreimage />}
						{step === EProposalStep.CREATE_TREASURY_PROPOSAL && <TreasuryProposalLocal />}
						{step === EProposalStep.CREATE_USDX_PROPOSAL && <TreasuryProposalAssethub />}
						{step === EProposalStep.CREATE_CANCEL_REF_PROPOSAL && <CancelReferendum />}
						{step === EProposalStep.CREATE_KILL_REF_PROPOSAL && <KillReferendum />}
						{!step && (
							<div className='flex flex-col gap-y-4'>
								<p className='text-lg font-semibold leading-none text-text_primary'>{t('CreateProposal.quickActions')}</p>
								<CreateOption
									href='/create/discussion'
									label={t('CreateProposal.createDiscussion')}
									icon={DiscussionIcon}
									iconClassName='bg-create_discussion_bg/10'
									description={t('CreateProposal.createDiscussionDescription')}
								/>
								{isAssetHubEnabled && (
									<CreateOption
										label={titles[EProposalStep.CREATE_USDX_PROPOSAL]}
										onClick={() => setStep(EProposalStep.CREATE_USDX_PROPOSAL)}
										description={t('CreateProposal.usdxProposalDescription')}
										icon={UsdxProposalIcon}
										iconClassName='bg-create_usdx_bg/10'
									/>
								)}
								<CreateOption
									label={titles[EProposalStep.CREATE_TREASURY_PROPOSAL]}
									onClick={() => setStep(EProposalStep.CREATE_TREASURY_PROPOSAL)}
									description={`${t('CreateProposal.createTreasuryProposalDescription')} ${NETWORKS_DETAILS[network as ENetwork]?.name}`}
									icon={TreasuryProposalIcon}
									iconClassName='bg-create_treasury_bg/10'
								/>
								<CreateOption
									label={titles[EProposalStep.CREATE_CANCEL_REF_PROPOSAL]}
									onClick={() => setStep(EProposalStep.CREATE_CANCEL_REF_PROPOSAL)}
									description={t('CreateProposal.cancelReferendumDescription')}
									icon={CancelReferendumIcon}
									iconClassName='bg-create_cancel_bg/10'
								/>
								<CreateOption
									label={titles[EProposalStep.CREATE_KILL_REF_PROPOSAL]}
									onClick={() => setStep(EProposalStep.CREATE_KILL_REF_PROPOSAL)}
									description={t('CreateProposal.killReferendumDescription')}
									icon={KillReferendumIcon}
									iconClassName='bg-create_kill_bg/10'
								/>
								<Separator />
								<p className='text-lg font-semibold leading-none text-text_primary'>{t('CreateProposal.submitProposal')}</p>
								<CreateOption
									label={titles[EProposalStep.CREATE_PREIMAGE]}
									onClick={() => setStep(EProposalStep.CREATE_PREIMAGE)}
									description={t('CreateProposal.createPreimageDescription')}
									icon={PreimageIcon}
									iconClassName='bg-create_preimage_bg/10'
								/>
								<CreateOption
									label={titles[EProposalStep.EXISTING_PREIMAGE]}
									onClick={() => setStep(EProposalStep.EXISTING_PREIMAGE)}
									description={t('CreateProposal.existingPreimageDescription')}
									icon={ExistingPreimageIcon}
									iconClassName='bg-create_existing_bg/10'
								/>
							</div>
						)}
					</>
				)}
			</div>
		</>
	);
});

Create.displayName = 'Create';

export default Create;
