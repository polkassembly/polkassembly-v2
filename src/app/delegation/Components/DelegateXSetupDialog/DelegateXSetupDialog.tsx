// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { memo, useEffect, useState } from 'react';
import Image from 'next/image';
import { Dialog, DialogContent } from '@/app/_shared-components/Dialog/Dialog';
import Klara from '@assets/delegation/klara/klara.svg';
import { DelegateXClientService } from '@/app/_client-services/delegate_x_client_service';
import { ClientError } from '@/app/_client-utils/clientError';
import { ERROR_CODES, ERROR_MESSAGES } from '@/_shared/_constants/errorLiterals';
import { BN } from '@polkadot/util';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { ENotificationStatus, EPostOrigin, EWallet } from '@/_shared/types';
import { useToast } from '@/hooks/useToast';
import { useTranslations } from 'next-intl';
import { usePolkadotApiService } from '@/hooks/usePolkadotApiService';
import { usePolkadotVault } from '@/hooks/usePolkadotVault';
import { NETWORKS_DETAILS } from '@/_shared/_constants/networks';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { defaultStrategies } from '@/_shared/_constants/delegatexDefaultStrategies';
import DelegateXSuccessDialog from './DelegateXSuccessDialog';
import EditDelegateXDialog from './EditDelegateXDialog';
import WelcomeStep from './components/WelcomeStep';
import CostEstimateStep from './components/CostEstimateStep';
import VotingStrategyStep from './components/VotingStrategyStep';
import PersonalityStep from './components/PersonalityStep';
import ConfirmationStep from './components/ConfirmationStep';
import StepIndicator from './components/StepIndicator';

interface DelegateXSetupDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	isEditMode?: boolean;
	initialStep?: number;
	initialData?: {
		displayName?: string;
		signature?: string;
		contact?: string;
		persona?: string;
		selectedStrategy?: string;
		includeComment?: boolean;
	};
}

function DelegateXSetupDialog({ open, onOpenChange, isEditMode = false, initialStep = 1, initialData = {} }: DelegateXSetupDialogProps) {
	const [step, setStep] = useState<number>(initialStep);
	const { apiService } = usePolkadotApiService();
	const { setVaultQrState } = usePolkadotVault();
	const [signature, setSignature] = useState(initialData.signature || '');
	const [contact, setContact] = useState(initialData.contact || '');
	const [persona, setPersona] = useState<string>(initialData.persona || '');
	const [selectedStrategy, setSelectedStrategy] = useState(initialData.selectedStrategy || '');
	const [openSuccess, setOpenSuccess] = useState(false);
	const [openEdit, setOpenEdit] = useState(false);
	const [includeComment, setIncludeComment] = useState(initialData.includeComment ?? true);
	const [personaTab, setPersonaTab] = useState<'prompt' | 'preview'>('prompt');
	const [currentEditMode, setCurrentEditMode] = useState(isEditMode);
	const [isEditingFromDialog, setIsEditingFromDialog] = useState(false);
	const [votingPower, setVotingPower] = useState<string>('');
	const [isLoading, setIsLoading] = useState(false);
	const { userPreferences } = useUserPreferences();
	const { toast } = useToast();
	const t = useTranslations();
	useEffect(() => {
		if (open && isEditMode) {
			setStep(initialStep);
			setCurrentEditMode(true);
			setSignature(initialData.signature || '');
			setContact(initialData.contact || '');
			setPersona(initialData.persona || '');
			setSelectedStrategy(initialData.selectedStrategy || '');
			setIncludeComment(initialData.includeComment ?? true);
			setVotingPower('');
		} else if (open && !isEditMode && !currentEditMode && !isEditingFromDialog) {
			setStep(1);
			setCurrentEditMode(false);
			setSignature('');
			setContact('');
			setPersona('');
			setSelectedStrategy('');
			setIncludeComment(true);
			setVotingPower('');
		}
	}, [open, isEditMode, initialStep, currentEditMode, isEditingFromDialog]);

	const handleComplete = async () => {
		setIsLoading(true);

		// call api to create delegate x account
		const { data, error } = await DelegateXClientService.createDelegateXAccount({
			strategyId: selectedStrategy,
			contactLink: contact,
			signatureLink: signature || '',
			includeComment: includeComment || false,
			votingPower: new BN(0).toString()
		});
		if (error || !data) {
			setIsLoading(false);
			throw new ClientError(ERROR_CODES.CLIENT_ERROR, ERROR_MESSAGES[ERROR_CODES.CLIENT_ERROR]);
		}

		if (!data?.success) {
			setIsLoading(false);
			throw new ClientError(ERROR_CODES.CLIENT_ERROR, ERROR_MESSAGES[ERROR_CODES.CLIENT_ERROR]);
		}

		const { delegateXAccount } = data;

		const { address } = delegateXAccount;
		console.log('delegateXAccount', delegateXAccount);
		// delegate user voting to the address
		await apiService?.delegateForDelegateX({
			address: userPreferences.selectedAccount?.address || '',
			wallet: userPreferences.wallet as EWallet,
			setVaultQrState,
			delegateAddress: address,
			balance: new BN(votingPower || 0),
			conviction: 0,
			tracks: Object.keys(NETWORKS_DETAILS[`${getCurrentNetwork()}`].trackDetails)
				.map((track) => NETWORKS_DETAILS[`${getCurrentNetwork()}`].trackDetails[track as EPostOrigin]?.trackId)
				.filter((id): id is number => id !== undefined),
			onSuccess: () => {
				setIsLoading(false);
				if (currentEditMode) {
					setCurrentEditMode(false);
					onOpenChange(false);
				} else {
					onOpenChange(false);
					setOpenSuccess(true);
				}
				toast({
					title: t('delegateXCreatedSuccessfully'),
					description: t('delegateXCreatedSuccessfullyDescription'),
					status: ENotificationStatus.SUCCESS
				});
			},
			onFailed: (error: string) => {
				setIsLoading(false);
				toast({
					title: t('errorCreatingDelegateX'),
					description: error,
					status: ENotificationStatus.ERROR
				});
			}
		});
		if (currentEditMode) {
			setCurrentEditMode(false);
			onOpenChange(false);
		} else {
			onOpenChange(false);
			setOpenSuccess(true);
		}
	};

	const handleDialogClose = (isOpen: boolean) => {
		if (!isOpen) {
			setCurrentEditMode(false);
			setIsEditingFromDialog(false);
		}
		onOpenChange(isOpen);
	};

	const getStepCount = () => {
		if (currentEditMode) {
			return 1;
		}
		return 5;
	};

	const getCurrentStepNumber = () => {
		if (currentEditMode) {
			return 1;
		}
		return step;
	};

	return (
		<>
			<Dialog
				open={open}
				onOpenChange={handleDialogClose}
			>
				<DialogContent className='max-h-[90vh] w-[95vw] rounded-xl p-0 sm:mx-auto md:max-w-4xl'>
					<div className='flex items-center justify-between gap-3 border-b border-border_grey px-4 py-3'>
						<div className='flex items-center gap-2'>
							<Image
								src={Klara}
								alt='Klara'
								width={28}
								height={28}
							/>
							<span className='text-xl font-semibold'>DelegateX</span>
							<span className='text-xs text-btn_secondary_text'>Powered by</span>
							<span className='rounded-full bg-delegation_bgcard p-1 px-2 text-xs'>CyberGov</span>
						</div>
					</div>

					<div className='flex w-full flex-col gap-4 px-4 py-4 sm:gap-6 sm:px-6 sm:py-5'>
						<StepIndicator
							currentStep={getCurrentStepNumber()}
							totalSteps={getStepCount()}
							isEditMode={currentEditMode}
						/>

						{step === 1 && (
							<WelcomeStep
								onNext={() => setStep(2)}
								isEditMode={currentEditMode}
							/>
						)}

						{step === 2 && (
							<CostEstimateStep
								onNext={() => setStep(3)}
								isEditMode={currentEditMode}
							/>
						)}

						{step === 3 && (
							<VotingStrategyStep
								onNext={() => setStep(4)}
								selectedStrategy={selectedStrategy}
								strategies={defaultStrategies}
								onStrategySelect={setSelectedStrategy}
								isEditMode={currentEditMode}
							/>
						)}

						{step === 4 && (
							<PersonalityStep
								onNext={() => setStep(5)}
								signature={signature}
								onSignatureChange={setSignature}
								contact={contact}
								onContactChange={setContact}
								persona={persona}
								onPersonaChange={setPersona}
								includeComment={includeComment}
								onIncludeCommentChange={setIncludeComment}
								personaTab={personaTab}
								onPersonaTabChange={setPersonaTab}
								isEditMode={currentEditMode}
								votingPower={votingPower}
								onVotingPowerChange={setVotingPower}
							/>
						)}

						{step === 5 && (
							<ConfirmationStep
								onConfirm={handleComplete}
								displayName={signature || initialData.displayName || ''}
								selectedStrategy={selectedStrategy}
								isEditMode={currentEditMode}
								votingPower={votingPower}
								isLoading={isLoading}
							/>
						)}
					</div>
				</DialogContent>
			</Dialog>
			<DelegateXSuccessDialog
				open={openSuccess}
				onOpenChange={setOpenSuccess}
				onViewDashboard={() => setOpenSuccess(false)}
				onEditBot={() => {
					setOpenSuccess(false);
					setOpenEdit(true);
				}}
			/>
			<EditDelegateXDialog
				open={openEdit}
				onOpenChange={setOpenEdit}
				onUndelegate={() => {
					// TODO: trigger on-chain undelegate
					setOpenEdit(false);
				}}
				onEditStrategy={() => {
					setOpenEdit(false);
					setIsEditingFromDialog(true);
					setCurrentEditMode(true);
					setStep(3);
					onOpenChange(true);
				}}
				onEditPersonality={() => {
					setOpenEdit(false);
					setIsEditingFromDialog(true);
					setCurrentEditMode(true);
					setStep(4);
					onOpenChange(true);
				}}
			/>
		</>
	);
}

export default memo(DelegateXSetupDialog);
