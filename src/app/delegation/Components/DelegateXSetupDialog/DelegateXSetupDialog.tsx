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
import { EConvictionAmount, ENotificationStatus, EPostOrigin, EWallet, IDelegateXAccount } from '@/_shared/types';
import { useToast } from '@/hooks/useToast';
import { useTranslations } from 'next-intl';
import { usePolkadotApiService } from '@/hooks/usePolkadotApiService';
import { usePolkadotVault } from '@/hooks/usePolkadotVault';
import { NETWORKS_DETAILS } from '@/_shared/_constants/networks';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { defaultStrategies } from '@/_shared/_constants/delegatexDefaultStrategies';
import { inputToBn } from '@/app/_client-utils/inputToBn';
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
		selectedStrategy?: string;
		includeComment?: boolean;
		votingPower?: string;
		prompt?: string;
	};
	networkSymbol?: string;
	onSuccess?: (delegateXAccount: IDelegateXAccount) => void;
}

function DelegateXSetupDialog({ open, onOpenChange, isEditMode = false, initialStep = 1, initialData = {}, networkSymbol, onSuccess }: DelegateXSetupDialogProps) {
	const [step, setStep] = useState<number>(initialStep);
	const { apiService } = usePolkadotApiService();
	const { setVaultQrState } = usePolkadotVault();
	const [signature, setSignature] = useState(initialData.signature || '');
	const [contact, setContact] = useState(initialData.contact || '');
	const [prompt, setPrompt] = useState<string>(initialData.prompt || '');
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
			setPrompt(initialData.prompt || '');
			setSelectedStrategy(initialData.selectedStrategy || '');
			setIncludeComment(initialData.includeComment ?? true);
			setVotingPower(initialData.votingPower || '');
		} else if (open && !isEditMode && !currentEditMode && !isEditingFromDialog) {
			setStep(1);
			setCurrentEditMode(false);
			setSignature('');
			setContact('');
			setPrompt('');
			setSelectedStrategy('');
			setIncludeComment(true);
			setVotingPower('');
		}
	}, [open, isEditMode, initialStep, currentEditMode, isEditingFromDialog]);

	const handleComplete = async () => {
		setIsLoading(true);

		let data;
		let error;

		if (currentEditMode) {
			const updatePayload: {
				strategyId?: string;
				contactLink?: string;
				signatureLink?: string;
				includeComment?: boolean;
				votingPower?: string;
				prompt?: string;
			} = {};

			if (initialStep === 3 && selectedStrategy) {
				updatePayload.strategyId = selectedStrategy;
			}

			if (initialStep === 4) {
				updatePayload.contactLink = contact;
				updatePayload.signatureLink = signature || '';
				updatePayload.includeComment = includeComment;
				updatePayload.prompt = prompt;
				if (votingPower) {
					updatePayload.votingPower = votingPower;
				}
			}

			const result = await DelegateXClientService.updateDelegateXAccount(updatePayload);
			data = result.data;
			error = result.error;
		} else {
			const result = await DelegateXClientService.createDelegateXAccount({
				strategyId: selectedStrategy,
				contactLink: contact,
				signatureLink: signature || '',
				includeComment: includeComment || false,
				votingPower: votingPower || new BN(0).toString(),
				prompt: prompt || ''
			});
			data = result.data;
			error = result.error;
		}

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

		const needsRedelegation = !currentEditMode || (votingPower && votingPower !== initialData.votingPower);

		if (!needsRedelegation) {
			setIsLoading(false);
			setCurrentEditMode(false);
			onOpenChange(false);
			toast({
				title: t('delegateXUpdatedSuccessfully'),
				description: t('delegateXUpdatedSuccessfullyDescription'),
				status: ENotificationStatus.SUCCESS
			});
			onSuccess?.(delegateXAccount);
			return;
		}

		// delegate user voting to the address
		await apiService?.delegateForDelegateX({
			address: userPreferences.selectedAccount?.address || '',
			wallet: userPreferences.wallet as EWallet,
			setVaultQrState,
			delegateAddress: address,
			balance: inputToBn(votingPower || '0', getCurrentNetwork()).bnValue,
			conviction: EConvictionAmount.ZERO,
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
				onSuccess?.(delegateXAccount);
			},
			onFailed: (error: string) => {
				setIsLoading(false);
				toast({
					title: t('errorCreatingDelegateX'),
					description: error,
					status: ENotificationStatus.ERROR
				});
				onOpenChange(false);
			}
		});
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
								estimatedCost={`≈ 5 ${networkSymbol}`}
								networkSymbol={networkSymbol}
							/>
						)}

						{step === 3 && (
							<VotingStrategyStep
								onNext={() => setStep(4)}
								selectedStrategy={selectedStrategy}
								strategies={defaultStrategies}
								onStrategySelect={setSelectedStrategy}
								isEditMode={currentEditMode}
								onSubmit={handleComplete}
								isLoading={isLoading}
							/>
						)}

						{step === 4 && (
							<PersonalityStep
								onNext={() => setStep(5)}
								signature={signature}
								onSignatureChange={setSignature}
								contact={contact}
								onContactChange={setContact}
								prompt={prompt}
								onPromptChange={setPrompt}
								includeComment={includeComment}
								onIncludeCommentChange={setIncludeComment}
								personaTab={personaTab}
								onPersonaTabChange={setPersonaTab}
								isEditMode={currentEditMode}
								votingPower={votingPower}
								onVotingPowerChange={setVotingPower}
								onSubmit={handleComplete}
								isLoading={isLoading}
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
								estimatedFee={`≈ 5 ${networkSymbol}`}
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
