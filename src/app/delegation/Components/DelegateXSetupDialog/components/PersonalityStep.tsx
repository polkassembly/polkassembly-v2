// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { memo } from 'react';
import Image from 'next/image';
import { Button } from '@/app/_shared-components/Button';
import { ArrowRight } from 'lucide-react';
import { Switch } from '@/app/_shared-components/Switch';
import QuestionIcon from '@assets/delegation/question.svg';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/app/_shared-components/Tooltip';
import styles from '../DelegateXSetupDialog.module.scss';

interface PersonalityStepProps {
	onNext: () => void;
	signature: string;
	onSignatureChange: (value: string) => void;
	contact: string;
	onContactChange: (value: string) => void;
	persona: string;
	onPersonaChange: (value: string) => void;
	includeComment: boolean;
	onIncludeCommentChange: (value: boolean) => void;
	personaTab: 'prompt' | 'preview';
	onPersonaTabChange: (tab: 'prompt' | 'preview') => void;
	isEditMode?: boolean;
	votingPower?: string;
	onVotingPowerChange?: (value: string) => void;
}

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
	isEditMode = false,
	votingPower,
	onVotingPowerChange
}: PersonalityStepProps) {
	return (
		<div className='space-y-4'>
			<div className='rounded-lg bg-delegation_bgcard p-4 sm:p-6'>
				<div className='mb-4'>
					<p className='mb-2 block text-[10px] font-medium md:text-sm'>Enter the voting power of your delegation</p>
					<input
						className='placeholder:text-text_secondary w-full rounded-md border border-border_grey bg-bg_modal px-3 py-2 text-sm outline-none'
						placeholder='Enter voting power'
						value={votingPower}
						onChange={(e) => onVotingPowerChange?.(e.target.value)}
					/>
				</div>
				<div className='text-text_primary'>
					<div className='flex gap-3 sm:gap-2'>
						<Switch
							checked={includeComment}
							onCheckedChange={onIncludeCommentChange}
						/>
						<div className='flex items-center gap-2'>
							<p className='font-semibold text-text_primary'>{isEditMode ? 'Update Comment Settings' : 'Include Comment with Vote'}</p>
							<Tooltip>
								<TooltipTrigger>
									<Image
										src={QuestionIcon}
										alt='Question Icon'
										width={16}
										height={16}
									/>
								</TooltipTrigger>
								<TooltipContent className='bg-tooltip_background p-2 text-white'>
									<p className='max-w-xs text-xs'>
										Enable this option to have DelegateX automatically add a comment with your vote, explaining the reason behind it. You can customize the comment to reflect your
										personal style and message.
									</p>
								</TooltipContent>
							</Tooltip>
						</div>
					</div>
				</div>

				<div>
					{includeComment && (
						<>
							<p className='mt-3 text-[10px] md:text-sm'>DelegateX adds a comment with your vote explaining the reason behind it. You can customise the comment below:</p>

							<div className='mt-3 rounded-lg border border-border_grey p-3 sm:p-4'>
								<div className='space-y-4'>
									<div>
										<p className='mb-2 block text-[10px] font-medium md:text-sm'>Signature Line</p>
										<input
											className='placeholder:text-text_secondary w-full rounded-md border border-border_grey bg-bg_modal px-3 py-2 text-sm outline-none'
											placeholder='eg. Alice for Growth Advocate'
											value={signature}
											onChange={(e) => onSignatureChange(e.target.value)}
										/>
									</div>

									<div>
										<p className='mb-2 block text-[10px] font-medium md:text-sm'>Contact Link (optional)</p>
										<input
											className='placeholder:text-text_secondary w-full rounded-md border border-border_grey bg-bg_modal px-3 py-2 text-sm outline-none'
											placeholder='URL or Handle'
											value={contact}
											onChange={(e) => onContactChange(e.target.value)}
										/>
									</div>

									<div>
										<p className='mb-2 block text-[10px] font-medium md:text-sm'>Customise the prompt to modify comment style.</p>

										<div className={`${styles.PreviewWrapper} mt-3 rounded-xl p-[1px]`}>
											<div className='flex min-h-[100px] flex-col rounded-xl bg-bg_modal p-4 sm:min-h-[160px] md:min-h-[140px]'>
												<div
													className='mb-3 flex gap-2'
													role='tablist'
													aria-label='Persona customization tabs'
												>
													{' '}
													<button
														type='button'
														role='tab'
														aria-selected={personaTab === 'prompt'}
														aria-controls='prompt-panel'
														className={`rounded-full px-4 py-1 text-xs font-medium transition-colors ${personaTab === 'prompt' ? 'bg-border_grey text-text_primary' : ''}`}
														onClick={() => onPersonaTabChange('prompt')}
													>
														PROMPT
													</button>
													<button
														type='button'
														role='tab'
														aria-selected={personaTab === 'preview'}
														aria-controls='preview-panel'
														className={`rounded-full px-4 py-1 text-xs font-medium transition-colors ${personaTab === 'preview' ? 'bg-border_grey text-text_primary' : ''}`}
														onClick={() => onPersonaTabChange('preview')}
													>
														PREVIEW
													</button>
												</div>
												<div
													id='prompt-panel'
													role='tabpanel'
													hidden={personaTab !== 'prompt'}
												>
													{personaTab === 'prompt' && (
														<textarea
															className='placeholder:text-text_secondary w-full flex-1 resize-none bg-transparent text-sm outline-none'
															placeholder='Enter your custom prompt here...'
															value={persona}
															onChange={(e) => onPersonaChange(e.target.value)}
														/>
													)}
												</div>
												<div
													id='preview-panel'
													role='tabpanel'
													hidden={personaTab !== 'preview'}
												>
													{personaTab === 'preview' && (
														<div className='flex-1 overflow-y-auto'>
															<p className='text-xs font-bold italic text-text_primary'>This is how the comment will appear on the vote:</p>
															<p className='mt-2 text-xs italic text-text_primary'>Voted Aye — Proposal meets defined criteria. – {signature || 'Alice for Growth Advocate'}</p>
														</div>
													)}
												</div>
											</div>
										</div>
									</div>
								</div>
							</div>
						</>
					)}
				</div>
			</div>
			<div className='flex items-center justify-center sm:justify-end'>
				<Button
					disabled={!votingPower}
					className='w-full bg-text_pink px-5 text-white hover:bg-pink-600 sm:w-auto'
					onClick={onNext}
				>
					{isEditMode ? 'Update Personality' : 'Save and Continue'} <ArrowRight className='ml-2 h-4 w-4' />
				</Button>
			</div>
		</div>
	);
}

export default memo(PersonalityStep);
