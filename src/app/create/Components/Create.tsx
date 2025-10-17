// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import ManualExtrinsic from '@/app/_shared-components/Create/ManualExtrinsic/ManualExtrinsic';
import { useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { useUser } from '@/hooks/useUser';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { NETWORKS_DETAILS } from '@/_shared/_constants/networks';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { ChevronLeft, ChevronRight, Pencil } from 'lucide-react';
import DiscussionIcon from '@assets/icons/create-discussion.svg';
import QuickActionsIcon from '@assets/icons/quick-actions-icon.svg';
import PreimageIcon from '@assets/icons/create-preimage.svg';
import ExistingPreimageIcon from '@assets/icons/create-existing.svg';
import TreasuryProposalIcon from '@assets/icons/create-treasury.svg';
import UsdcUsdtProposalIcon from '@assets/icons/create-assethub.svg';
import CancelReferendumIcon from '@assets/icons/create-cancel.svg';
import KillReferendumIcon from '@assets/icons/create-kill.svg';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Separator } from '@/app/_shared-components/Separator';
import { ENetwork, EProposalStep } from '@/_shared/types';
import NewPreimageIcon from '@assets/icons/new-preimage-icon.svg';
import AlreadyPreimageExistIcon from '@assets/icons/already-preimage-exist-icon.svg';
import SpendAssethubIcon from '@assets/icons/spend-assethub-icon.svg';
import CreateTreasuryIcon from '@assets/icons/create-treasury-icon.svg';
import KillReferendaIcon from '@assets/icons/kill-referenda-icon.svg';
import CancelReferendaIcon from '@assets/icons/cancel-referenda-icon.svg';
import { useSearchParams, useRouter } from 'next/navigation';
import { useSuccessModal } from '@/hooks/useSuccessModal';
import { LoadingSpinner } from '@/app/_shared-components/LoadingSpinner';
import TreasuryProposalLocal from './TreasuryProposaLocal/TreasuryProposalLocal';
import TreasuryProposalAssethub from './TreasuryProposalAssethub/TreasuryProposalAssethub';
import CancelReferendum from './CancelReferendum/CancelReferendum';
import KillReferendum from './KillReferendum/KillReferendum';
import ExistingPreimage from './ExistingPreimage/ExistingPreimage';
import CreateBounty from './CreateBounty/CreateBounty';

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
			className='flex flex-1 items-center gap-x-2 rounded-lg bg-create_option_bg px-2 py-1 text-text_primary transition-all duration-200 ease-in hover:bg-bg_pink/10 hover:text-text_pink sm:px-4 sm:py-2'
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
		<div className='flex items-center gap-x-2 sm:gap-x-4'>
			{iconComponent}
			{component}
		</div>
	);
}

function SuccessModalContent({ proposalId }: { proposalId: number }) {
	const t = useTranslations();

	return (
		<div className='flex flex-col items-center gap-y-4'>
			<p className='text-xl font-semibold text-text_primary'>{t('CreateProposal.Congratulations')}</p>
			<p className='flex items-center gap-x-2 text-sm font-medium text-wallet_btn_text'>
				<Link
					href={`/referenda/${proposalId}?created=true`}
					className='text-base font-semibold text-text_pink underline'
				>
					{t('CreateProposal.proposal')} #{proposalId}
				</Link>{' '}
				{t('CreateProposal.createdSuccessfully')}
			</p>
			<div className='flex items-center gap-x-2'>
				<p className='text-sm font-medium text-wallet_btn_text'>{t('CreateProposal.redirectingToProposal')}</p>
				<LoadingSpinner size='small' />
			</div>
			<Link
				href={`/referenda/${proposalId}?created=true`}
				className='flex w-full items-center justify-center gap-x-2 rounded-lg bg-bg_pink p-3 text-sm font-medium text-white hover:bg-bg_pink/90'
			>
				<Pencil className='h-4 w-4' />
				{t('CreateProposal.addContextToProposal')}
			</Link>
		</div>
	);
}

const Create = forwardRef<CreateRef, { isModal?: boolean; onStepChange?: (step?: EProposalStep) => void }>(({ isModal = false, onStepChange }, ref) => {
	const searchParams = useSearchParams();
	const open = searchParams.get('open');
	const router = useRouter();

	const [step, setStep] = useState<EProposalStep | undefined>(open && Object.values(EProposalStep).includes(open as EProposalStep) ? (open as EProposalStep) : undefined);
	const { user } = useUser();
	const t = useTranslations();

	const { setOpenSuccessModal, setSuccessModalContent } = useSuccessModal();

	const network = getCurrentNetwork();

	const isAssetHubEnabled = Object.keys(NETWORKS_DETAILS[`${network}`]?.supportedAssets).length > 0;

	const [newPreimageHash, setNewPreimageHash] = useState<string>();

	const titles = {
		create: t('CreateProposal.quickActions'),
		[EProposalStep.CREATE_PREIMAGE]: t('CreateProposal.createPreimage'),
		[EProposalStep.EXISTING_PREIMAGE]: t('CreateProposal.existingPreimage'),
		[EProposalStep.CREATE_TREASURY_PROPOSAL]: `${t('CreateProposal.spend')} ${NETWORKS_DETAILS[network as ENetwork]?.tokenSymbol} ${t('CreateProposal.from')} ${NETWORKS_DETAILS[network as ENetwork]?.name} ${t('CreateProposal.Treasury')}`,
		[EProposalStep.CREATE_USDX_PROPOSAL]: t('CreateProposal.usdxProposal'),
		[EProposalStep.CREATE_CANCEL_REF_PROPOSAL]: t('CreateProposal.cancelReferendum'),
		[EProposalStep.CREATE_KILL_REF_PROPOSAL]: t('CreateProposal.killReferendum'),
		[EProposalStep.CREATE_BOUNTY]: t('CreateProposal.createBounty')
	};

	const stepDescriptions: Partial<Record<EProposalStep, string>> = {
		[EProposalStep.CREATE_KILL_REF_PROPOSAL]: t('CreateProposal.stepDescriptionKillReferendum'),
		[EProposalStep.CREATE_CANCEL_REF_PROPOSAL]: t('CreateProposal.stepDescriptionCancelReferendum'),
		[EProposalStep.CREATE_TREASURY_PROPOSAL]: t('CreateProposal.stepDescriptionTreasuryProposal'),
		[EProposalStep.CREATE_USDX_PROPOSAL]: t('CreateProposal.stepDescriptionUsdxProposal'),
		[EProposalStep.CREATE_PREIMAGE]: t('CreateProposal.stepDescriptionCreatePreimage')
	};

	const stepIcons: Partial<Record<EProposalStep, string>> = {
		[EProposalStep.CREATE_PREIMAGE]: NewPreimageIcon,
		[EProposalStep.EXISTING_PREIMAGE]: AlreadyPreimageExistIcon,
		[EProposalStep.CREATE_USDX_PROPOSAL]: SpendAssethubIcon,
		[EProposalStep.CREATE_TREASURY_PROPOSAL]: CreateTreasuryIcon,
		[EProposalStep.CREATE_KILL_REF_PROPOSAL]: KillReferendaIcon,
		[EProposalStep.CREATE_CANCEL_REF_PROPOSAL]: CancelReferendaIcon
	};

	// Expose setStep through the ref
	useImperativeHandle(ref, () => ({
		setStep
	}));

	useEffect(() => {
		onStepChange?.(step);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [step]);

	const onProposalCreationSuccess = (proposalId: number) => {
		if (isModal) {
			router.back();
		}

		setSuccessModalContent(<SuccessModalContent proposalId={proposalId} />);
		setOpenSuccessModal(true);
	};

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
						<div>
							<div className='flex items-center gap-x-[6px]'>
								<Image
									className='dark:darkIcon'
									alt={`${titles[step || 'create']} Icon`}
									src={stepIcons[step as EProposalStep] || QuickActionsIcon}
									width={24}
									height={24}
								/>
								{titles[step || 'create']}
							</div>

							{step && stepDescriptions[step as EProposalStep] && <span className='text-sm font-medium'>{stepDescriptions[step as EProposalStep]}</span>}
						</div>
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
						{t('Create.toCreateProposal')}
					</p>
				) : (
					<>
						{step === EProposalStep.CREATE_PREIMAGE && (
							<ManualExtrinsic
								onSuccess={(preimageHash) => {
									setStep(EProposalStep.EXISTING_PREIMAGE);
									setNewPreimageHash(preimageHash);
								}}
							/>
						)}
						{step === EProposalStep.EXISTING_PREIMAGE && (
							<ExistingPreimage
								createdPreimageHash={newPreimageHash}
								onSuccess={onProposalCreationSuccess}
							/>
						)}
						{step === EProposalStep.CREATE_TREASURY_PROPOSAL && <TreasuryProposalLocal onSuccess={onProposalCreationSuccess} />}
						{step === EProposalStep.CREATE_USDX_PROPOSAL && <TreasuryProposalAssethub onSuccess={onProposalCreationSuccess} />}
						{step === EProposalStep.CREATE_CANCEL_REF_PROPOSAL && <CancelReferendum onSuccess={onProposalCreationSuccess} />}
						{step === EProposalStep.CREATE_KILL_REF_PROPOSAL && <KillReferendum onSuccess={onProposalCreationSuccess} />}
						{step === EProposalStep.CREATE_BOUNTY && <CreateBounty onSuccess={onProposalCreationSuccess} />}
						{!step && (
							<div className='flex flex-col gap-y-4'>
								<p className='text-lg font-semibold leading-none text-text_primary'>{t('CreateProposal.trendingNow')}</p>
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
										icon={UsdcUsdtProposalIcon}
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
									label={titles[EProposalStep.CREATE_BOUNTY]}
									onClick={() => setStep(EProposalStep.CREATE_BOUNTY)}
									description={t('CreateProposal.createBountyDescription')}
									icon={UsdcUsdtProposalIcon}
									iconClassName='bg-create_usdx_bg/10'
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
								<p className='text-lg font-semibold leading-none text-text_primary'>{t('CreateTreasuryProposal.createProposal')}</p>
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
