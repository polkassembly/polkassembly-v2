// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { memo } from 'react';
import Image from 'next/image';
import { Button } from '@/app/_shared-components/Button';
import { ArrowRight } from 'lucide-react';
import { Switch } from '@/app/_shared-components/Switch';
import QuestionIcon from '@assets/delegation/question.svg';
import styles from '../DelegateXSetupDialog.module.scss';

type PersonaType = 'friendly' | 'technical' | 'formal' | 'concise' | 'others';

interface PersonalityStepProps {
	onNext: () => void;
	signature: string;
	onSignatureChange: (value: string) => void;
	contact: string;
	onContactChange: (value: string) => void;
	persona: PersonaType;
	onPersonaChange: (value: PersonaType) => void;
	includeComment: boolean;
	onIncludeCommentChange: (value: boolean) => void;
	personaTab: 'prompt' | 'preview';
	onPersonaTabChange: (tab: 'prompt' | 'preview') => void;
	isEditMode?: boolean;
}

const personaOptions = [
	{ value: 'friendly' as PersonaType, label: 'Friendly & Approachable' },
	{ value: 'technical' as PersonaType, label: 'Technical & Detailed' },
	{ value: 'formal' as PersonaType, label: 'Formal & Traditional' },
	{ value: 'concise' as PersonaType, label: 'Professional & Concise' },
	{ value: 'others' as PersonaType, label: 'Others' }
];

function PersonalityStep({
	onNext,
	signature,
	onSignatureChange,
	contact,
	onContactChange,
	persona,
	onPersonaChange,
	includeComment,
	onIncludeCommentChange,
	personaTab,
	onPersonaTabChange,
	isEditMode = false
}: PersonalityStepProps) {
	return (
		<div className='space-y-4'>
			<div className='rounded-lg bg-delegation_bgcard p-4'>
				<div className='text-text_primary'>
					<div className='flex gap-2'>
						<Switch
							checked={includeComment}
							onCheckedChange={onIncludeCommentChange}
						/>
						<div className='mb-2 flex items-center gap-2'>
							<p className='font-semibold text-text_primary'>{isEditMode ? 'Update Comment Settings' : 'Include Comment with Vote'}</p>
							<Image
								src={QuestionIcon}
								alt='Question Icon'
								width={16}
								height={16}
							/>
						</div>
					</div>
				</div>

				<div>
					{includeComment && (
						<>
							<p className='text-sm'>DelegateX adds a comment with your vote explaining the reason behind it. You can customise the comment below:</p>

							<div className='mt-3 rounded-lg border border-border_grey p-2'>
								<div className='space-y-3'>
									<div>
										<p className='mb-1 block text-sm font-medium'>Signature Line</p>
										<input
											className='placeholder:text-text_secondary w-full rounded-md border border-border_grey bg-bg_modal px-3 py-2 text-sm outline-none'
											placeholder='eg. Alice for Growth Advocate'
											value={signature}
											onChange={(e) => onSignatureChange(e.target.value)}
										/>
									</div>

									<div>
										<p className='mb-1 block text-sm font-medium'>Contact Link (optional)</p>
										<input
											className='placeholder:text-text_secondary w-full rounded-md border border-border_grey bg-bg_modal px-3 py-2 text-sm outline-none'
											placeholder='URL or Handle'
											value={contact}
											onChange={(e) => onContactChange(e.target.value)}
										/>
									</div>

									<div>
										<p className='mb-1 block text-sm font-medium'>Persona Prompt: Choose from 5 available prompts or customise a prompt</p>
										<div className='mt-3 flex gap-2 border-b border-border_grey'>
											<button
												type='button'
												className={`px-3 py-2 text-sm font-medium ${personaTab === 'prompt' ? 'border-b-2 border-text_pink text-text_pink' : 'text-text_secondary'}`}
												onClick={() => onPersonaTabChange('prompt')}
											>
												PROMPT
											</button>
											<button
												type='button'
												className={`px-3 py-2 text-sm font-medium ${personaTab === 'preview' ? 'border-b-2 border-text_pink text-text_pink' : 'text-text_secondary'}`}
												onClick={() => onPersonaTabChange('preview')}
											>
												PREVIEW
											</button>
										</div>

										{personaTab === 'prompt' && (
											<div className='mt-3 max-h-28 space-y-2 overflow-y-auto'>
												{personaOptions.map((option) => (
													<div
														aria-hidden
														key={option.value}
														className='flex cursor-pointer items-center gap-2 rounded-md border border-border_grey bg-bg_modal px-3 py-2 hover:bg-delegation_bgcard'
														onClick={() => onPersonaChange(option.value)}
													>
														<input
															type='radio'
															name='persona'
															checked={persona === option.value}
															onChange={() => onPersonaChange(option.value)}
														/>
														<span className='text-sm'>{option.label}</span>
													</div>
												))}
											</div>
										)}

										{personaTab === 'preview' && (
											<div className={`${styles.PreviewWrapper} mt-3 max-h-28 overflow-y-auto rounded-md border border-border_grey bg-bg_modal p-4`}>
												<p className='text-text_secondary text-xs font-bold italic'>This is how the comment will appear on the vote:</p>
												<p className='mt-2 text-xs italic text-text_primary'>Voted Aye — Proposal meets defined criteria. – {signature || 'Alice for Growth Advocate'}</p>
											</div>
										)}
									</div>
								</div>
							</div>
						</>
					)}
				</div>
			</div>
			<div className='mt-4 flex items-center justify-end'>
				<Button
					className='px-5'
					onClick={onNext}
				>
					{isEditMode ? 'Update Personality' : 'Save and Continue'} <ArrowRight />
				</Button>
			</div>
		</div>
	);
}

export default memo(PersonalityStep);
