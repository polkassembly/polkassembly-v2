// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { memo, useEffect, useState } from 'react';
import Image from 'next/image';
import { Dialog, DialogContent } from '@/app/_shared-components/Dialog/Dialog';
import Klara from '@assets/delegation/klara/klara.svg';
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
		persona?: 'friendly' | 'technical' | 'formal' | 'concise' | 'others';
		selectedStrategy?: string;
		includeComment?: boolean;
	};
}

function DelegateXSetupDialog({ open, onOpenChange, isEditMode = false, initialStep = 1, initialData = {} }: DelegateXSetupDialogProps) {
	const [step, setStep] = useState<number>(initialStep);
	const [signature, setSignature] = useState(initialData.signature || '');
	const [contact, setContact] = useState(initialData.contact || '');
	const [persona, setPersona] = useState<'friendly' | 'technical' | 'formal' | 'concise' | 'others'>(initialData.persona || 'friendly');
	const [selectedStrategy, setSelectedStrategy] = useState(initialData.selectedStrategy || 'aggressive-innovator');
	const [openSuccess, setOpenSuccess] = useState(false);
	const [openEdit, setOpenEdit] = useState(false);
	const [includeComment, setIncludeComment] = useState(initialData.includeComment ?? true);
	const [personaTab, setPersonaTab] = useState<'prompt' | 'preview'>('prompt');
	const [currentEditMode, setCurrentEditMode] = useState(isEditMode);

	useEffect(() => {
		if (open && !currentEditMode) {
			setStep(1);
			setCurrentEditMode(false);
		} else if (open && currentEditMode) {
			setStep(initialStep);
		}
	}, [open, currentEditMode, initialStep]);

	const handleComplete = () => {
		if (currentEditMode) {
			onOpenChange(false);
		} else {
			onOpenChange(false);
			setOpenSuccess(true);
		}
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
				onOpenChange={onOpenChange}
			>
				<DialogContent className='mx-4 rounded-xl p-0 sm:mx-auto md:max-w-4xl'>
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

					<div className='flex w-full flex-col gap-6 px-6 py-5'>
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
							/>
						)}

						{step === 5 && (
							<ConfirmationStep
								onConfirm={handleComplete}
								displayName={initialData.displayName || ''}
								selectedStrategy={selectedStrategy}
								isEditMode={currentEditMode}
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
					setCurrentEditMode(true);
					setStep(3);
					onOpenChange(true);
				}}
				onEditPersonality={() => {
					setOpenEdit(false);
					setCurrentEditMode(true);
					setStep(4);
					onOpenChange(true);
				}}
			/>
		</>
	);
}

export default memo(DelegateXSetupDialog);
