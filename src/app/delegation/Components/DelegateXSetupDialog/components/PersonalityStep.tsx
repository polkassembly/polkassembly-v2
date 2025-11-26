// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { memo } from 'react';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import QuestionIcon from '@assets/delegation/question.svg';
import { Button } from '@/app/_shared-components/Button';
import { Switch } from '@/app/_shared-components/Switch';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/app/_shared-components/Tooltip';
import { VotingStrategy } from '@/_shared/types';
import styles from '../DelegateXSetupDialog.module.scss';

interface PersonalityStepProps {
	onNext: () => void;
	signature: string;
	onSignatureChange: (value: string) => void;
	contact: string;
	onContactChange: (value: string) => void;
	includeComment: boolean;
	onIncludeCommentChange: (value: boolean) => void;
	isEditMode?: boolean;
	votingPower?: string;
	onVotingPowerChange?: (value: string) => void;
	onSubmit?: () => Promise<void>;
	isLoading?: boolean;
	selectedStrategy?: string;
	strategies?: VotingStrategy[];
}

function PersonalityStep({
	onNext,
	signature,
	onSignatureChange,
	contact,
	onContactChange,
	includeComment,
	onIncludeCommentChange,
	isEditMode = false,
	votingPower,
	onVotingPowerChange,
	onSubmit,
	isLoading = false,
	selectedStrategy,
	strategies
}: PersonalityStepProps) {
	const handleNext = async () => {
		if (isEditMode && onSubmit) {
			await onSubmit();
		} else {
			onNext();
		}
	};

	const currentStrategy = strategies?.find((s) => s.id === selectedStrategy);

	return (
		<div className='space-y-3'>
			<div className='rounded-lg bg-delegation_bgcard p-4 sm:p-6'>
				<div className='mb-3'>
					<p className='mb-2 block text-[10px] font-medium md:text-sm'>Enter the voting power of your delegation</p>
					<input
						className='placeholder:text-text_secondary w-full rounded-md border border-border_grey bg-bg_modal px-3 py-2 text-sm outline-none'
						placeholder='Enter voting power'
						value={votingPower}
						onChange={(e) => onVotingPowerChange?.(e.target.value)}
						type='number'
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
							<p className='mt-2 text-[10px] md:text-sm'>DelegateX adds a comment with your vote explaining the reason behind it. You can customise the comment below:</p>

							<div className='mt-2 rounded-lg border border-border_grey p-3 sm:p-4'>
								<div className='space-y-2'>
									<div>
										<p className='mb-2 block text-[10px] font-medium md:text-sm'>Signature Line (optional)</p>
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
										<p className='mb-2 block text-[10px] font-medium md:text-sm'>Comment Preview</p>
										<p className='text-text_secondary mb-2 text-xs'>This is how the comment will appear based on your selected strategy:</p>

										<div className={`${styles.PreviewWrapper} rounded-xl p-[1px]`}>
											<div className='hide_scrollbar flex max-h-[100px] flex-col overflow-y-auto rounded-xl bg-bg_modal p-2 sm:max-h-[120px]'>
												<div
													className='mb-1 flex gap-2'
													role='tablist'
													aria-label='Persona customization tabs'
												>
													<p className='rounded-full bg-border_grey px-3 py-0.5 text-xs font-medium text-text_primary transition-colors'>PREVIEW</p>
												</div>
												<div className='flex-1 overflow-y-auto'>
													<p className='text-xs font-bold italic text-text_primary'>Comment Preview:</p>
													<p className='mt-2 whitespace-pre-line text-xs italic text-text_primary'>
														{currentStrategy ? currentStrategy.commentPreview(signature, contact) : 'Please select a voting strategy to see the comment preview.'}
													</p>
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
					disabled={!votingPower || isLoading}
					className='w-full bg-text_pink px-5 text-white hover:bg-pink-600 sm:w-auto'
					onClick={handleNext}
				>
					{isLoading ? 'Updating...' : isEditMode ? 'Update Personality' : 'Save and Continue'} <ArrowRight className='ml-2 h-4 w-4' />
				</Button>
			</div>
		</div>
	);
}

export default memo(PersonalityStep);
