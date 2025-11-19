// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { memo, useEffect, useState } from 'react';
import Image from 'next/image';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/app/_shared-components/Dialog/Dialog';
import { Button } from '@/app/_shared-components/Button';
import KlaraBox from '@assets/delegation/klara/klara-box.svg';
import Klara from '@assets/delegation/klara/klara.svg';
import Strategy1 from '@assets/delegation/klara/Strategy1.svg';
import { ArrowRight } from 'lucide-react';
import { Separator } from '@/app/_shared-components/Separator';
import { Switch } from '@/app/_shared-components/Switch';
import QuestionIcon from '@assets/delegation/question.svg';
import DelegateXSuccessDialog from './DelegateXSuccessDialog';
import EditDelegateXDialog from './EditDelegateXDialog';
import styles from './DelegateXSetupDialog.module.scss';

interface DelegateXSetupDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

const steps = [1, 2, 3, 4, 5];

function DelegateXSetupDialog({ open, onOpenChange }: DelegateXSetupDialogProps) {
	const [step, setStep] = useState<number>(1);
	// eslint-disable-next-line
	const [displayName, setDisplayName] = useState('');
	const [signature, setSignature] = useState('');
	const [contact, setContact] = useState('');
	const [persona, setPersona] = useState<'friendly' | 'technical' | 'formal' | 'concise' | 'others'>('friendly');
	const [openSuccess, setOpenSuccess] = useState(false);
	const [openEdit, setOpenEdit] = useState(false);
	const [includeComment, setIncludeComment] = useState(true);
	const [personaTab, setPersonaTab] = useState<'prompt' | 'preview'>('prompt');
	useEffect(() => {
		if (open) setStep(1);
	}, [open]);

	return (
		<>
			<Dialog
				open={open}
				onOpenChange={onOpenChange}
			>
				<DialogContent className='max-w-4xl rounded-xl p-0'>
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
							<span className='rounded-full bg-delegation_bgcard/80 p-1 text-xs'>CyberGov</span>
						</div>
					</div>

					<div className='flex w-full flex-col gap-6 px-6 py-5'>
						<div className='flex items-center justify-center'>
							{steps.map((s, idx) => (
								<div
									key={s}
									className='flex items-center'
								>
									<span className={`h-2 w-2 rounded-full ${s <= step ? 'bg-aye_color' : 'bg-border_grey'}`} />
									{idx !== steps.length - 1 && <div className={`mx-1 h-[2px] w-48 rounded ${s < step ? 'bg-aye_color' : 'bg-border_grey'}`} />}
								</div>
							))}
						</div>

						{step === 1 && (
							<div className='rounded-lg bg-delegation_bgcard p-4'>
								<div className='flex items-start justify-center gap-8 md:justify-start'>
									<div>
										<Image
											src={KlaraBox}
											alt='Klara'
											width={450}
											height={450}
										/>
									</div>
									<div>
										<DialogHeader className='p-0'>
											<DialogTitle className='mb-2 text-lg font-semibold'>Hi there! I’m Klara, and I’ll help you set up DelegateX, your personal governance agent.</DialogTitle>
										</DialogHeader>

										<div className='text-text_secondary space-y-2 pt-5 text-sm'>
											<p>DelegateX combines Klara&apos;s AI layer with Cybergov&apos;s onchain-voting system.</p>
											<p>It is a custom voting agent setup for individual users:</p>
											<ul className='ml-5 list-disc space-y-1'>
												<li>Deploying a DelegateX instance creates a unique delegate account for each user; each instance has a logic setup by the user.</li>
												<li>
													At the current stage, voting logic can be picked from the provided templates that use combinations of evaluation parameters to determine a conclusive vote
													result.
												</li>
												<li>The vote result is a weighted result of three parameters defined in CyberGov.</li>
												<li>
													Each vote made by the DelegateX instance is supported with a comment explaining the decision. The comment style depends on the persona selected during
													setup.
												</li>
											</ul>
										</div>
									</div>
								</div>
							</div>
						)}

						{step === 2 && (
							<div className='space-y-4'>
								<div className='rounded-lg border border-border_grey bg-delegation_bgcard p-4'>
									<div className='mb-2 flex items-center gap-2'>
										<p className='font-semibold text-text_primary'>Cost Estimate</p>
										<Image
											src={QuestionIcon}
											alt='Question Icon'
											width={16}
											height={16}
										/>{' '}
									</div>
									<p className='text-sm text-text_primary'>To activate your delegate, we’ll create a wallet and reserve a small amount of DOT for gas fees.</p>

									<div className='relative pt-4'>
										<input
											id='est-setup-cost'
											aria-describedby='est-setup-help'
											className='w-full rounded-md border border-border_grey bg-bg_modal px-3 py-2 pr-20 text-sm font-medium outline-none placeholder:text-text_primary'
											value=''
											placeholder='Estimated setup cost'
											disabled
										/>

										<span
											className='absolute right-3 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-md px-3 py-1 pt-5 text-sm font-semibold text-text_primary'
											title='Exact amount confirmed when you sign the transaction.'
										>
											≈ 5 DOT
										</span>
									</div>

									<p
										id='est-setup-help'
										className='mt-2 text-xs italic text-wallet_btn_text'
									>
										Insufficient Funds, 2 DOT is needed to cover up gas fee for delegate setup
									</p>
								</div>

								<div className='flex items-center justify-end'>
									<Button
										className='px-5'
										onClick={() => setStep(3)}
									>
										Proceed to Templates <ArrowRight />
									</Button>
								</div>
							</div>
						)}

						{step === 3 && (
							<div className='space-y-4 rounded-lg bg-delegation_bgcard p-4'>
								<div>
									<div className='mb-2 flex items-center gap-2'>
										<p className='font-semibold text-text_primary'>Voting Strategy</p>
										<Image
											src={QuestionIcon}
											alt='Question Icon'
											width={16}
											height={16}
										/>{' '}
									</div>
									<p className='text-sm text-text_primary'>
										Pick the voting strategy that best matches your approach. Each template represents how DelegateX weighs different factors before voting.
									</p>
								</div>

								<div className='cursor-pointer rounded-xl bg-gradient-to-b from-delegatebotx_border to-transparent p-[1px]'>
									<div className='flex w-full flex-col items-start rounded-xl bg-bg_modal p-4'>
										<div className='flex items-center gap-4'>
											<Image
												src={Strategy1}
												alt='Strategy Icon'
												width={120}
												height={120}
												className='shrink-0'
											/>

											<div className='flex w-full flex-col'>
												<p className='text-base font-semibold'>Aggressive Innovator</p>

												<p className='mt-1 text-sm text-text_primary'>Backs bold ideas with potential network-wide impact.</p>

												<div className='mt-3 flex items-center gap-2 text-wallet_btn_text'>
													<span className='rounded-md bg-delegation_bgcard px-2 py-1 text-[11px]'>Optimistic</span>
													<span className='rounded-md bg-delegation_bgcard px-2 py-1 text-[11px]'>Fast-moving</span>
												</div>
											</div>
										</div>

										<Separator className='mt-3' />

										<div className='mx-auto'>
											<Button
												variant='ghost'
												size='sm'
												className='mt-2 px-0 text-sm font-medium text-text_pink hover:underline'
											>
												View Logic
											</Button>
										</div>
									</div>
								</div>

								<div className='flex items-center justify-end'>
									<Button
										className='px-5'
										onClick={() => setStep(4)}
									>
										Set Personality <ArrowRight />
									</Button>
								</div>
							</div>
						)}

						{step === 4 && (
							<div className='space-y-4'>
								<div className='rounded-lg bg-delegation_bgcard p-4'>
									<div className='text-text_primary'>
										<div className='flex gap-2'>
											<Switch
												checked={includeComment}
												onCheckedChange={setIncludeComment}
											/>
											<div className='mb-2 flex items-center gap-2'>
												<p className='font-semibold text-text_primary'>Include Comment with Vote</p>
												<Image
													src={QuestionIcon}
													alt='Question Icon'
													width={16}
													height={16}
												/>{' '}
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
																onChange={(e) => setSignature(e.target.value)}
															/>
														</div>

														<div>
															<p className='mb-1 block text-sm font-medium'>Contact Link (optional)</p>
															<input
																className='placeholder:text-text_secondary w-full rounded-md border border-border_grey bg-bg_modal px-3 py-2 text-sm outline-none'
																placeholder='URL or Handle'
																value={contact}
																onChange={(e) => setContact(e.target.value)}
															/>
														</div>

														<div>
															<p className='mb-1 block text-sm font-medium'>Persona Prompt: Choose from 5 available prompts or customise a prompt</p>
															<div className='mt-3 flex gap-2 border-b border-border_grey'>
																<button
																	type='button'
																	className={`px-3 py-2 text-sm font-medium ${personaTab === 'prompt' ? 'border-b-2 border-text_pink text-text_pink' : 'text-text_secondary'}`}
																	onClick={() => setPersonaTab('prompt')}
																>
																	PROMPT
																</button>
																<button
																	type='button'
																	className={`px-3 py-2 text-sm font-medium ${personaTab === 'preview' ? 'border-b-2 border-text_pink text-text_pink' : 'text-text_secondary'}`}
																	onClick={() => setPersonaTab('preview')}
																>
																	PREVIEW
																</button>
															</div>

															{personaTab === 'prompt' && (
																<div className='mt-3 max-h-28 space-y-2 overflow-y-auto'>
																	<div className='flex cursor-pointer items-center gap-2 rounded-md border border-border_grey bg-bg_modal px-3 py-2 hover:bg-delegation_bgcard'>
																		<input
																			type='radio'
																			name='persona'
																			checked={persona === 'friendly'}
																			onChange={() => setPersona('friendly')}
																		/>
																		<span className='text-sm'>Friendly & Approachable</span>
																	</div>
																	<div className='flex cursor-pointer items-center gap-2 rounded-md border border-border_grey bg-bg_modal px-3 py-2 hover:bg-delegation_bgcard'>
																		<input
																			type='radio'
																			name='persona'
																			checked={persona === 'technical'}
																			onChange={() => setPersona('technical')}
																		/>
																		<span className='text-sm'>Technical & Detailed</span>
																	</div>
																	<div className='flex cursor-pointer items-center gap-2 rounded-md border border-border_grey bg-bg_modal px-3 py-2 hover:bg-delegation_bgcard'>
																		<input
																			type='radio'
																			name='persona'
																			checked={persona === 'formal'}
																			onChange={() => setPersona('formal')}
																		/>
																		<span className='text-sm'>Formal & Traditional</span>
																	</div>
																	<div className='flex cursor-pointer items-center gap-2 rounded-md border border-border_grey bg-bg_modal px-3 py-2 hover:bg-delegation_bgcard'>
																		<input
																			type='radio'
																			name='persona'
																			checked={persona === 'concise'}
																			onChange={() => setPersona('concise')}
																		/>
																		<span className='text-sm'>Professional & Concise</span>
																	</div>
																	<div className='flex cursor-pointer items-center gap-2 rounded-md border border-border_grey bg-bg_modal px-3 py-2 hover:bg-delegation_bgcard'>
																		<input
																			type='radio'
																			name='persona'
																			checked={persona === 'others'}
																			onChange={() => setPersona('others')}
																		/>
																		<span className='text-sm'>Others</span>
																	</div>
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
										onClick={() => setStep(5)}
									>
										Save and Continue <ArrowRight />
									</Button>
								</div>
							</div>
						)}

						{step === 5 && (
							<div className='space-y-4 rounded-lg bg-delegation_bgcard p-4'>
								<div>
									<div className='mb-2 flex items-center gap-2'>
										<p className='font-semibold text-text_primary'>Confirm Delegation & Gas Deposit</p>
										<Image
											src={QuestionIcon}
											alt='Question Icon'
											width={16}
											height={16}
										/>{' '}
									</div>
									<p className='text-text_secondary text-sm'>
										We’ll now create your delegate wallet and register it on-chain. You’ll be asked to sign two transactions: delegation and gas deposit.
									</p>
								</div>

								<div>
									<div className='space-y-3'>
										<div className='flex items-center justify-between rounded-md bg-bg_modal px-3 py-2 text-sm'>
											<span className='text-text_secondary'>Template:</span>
											<span className='font-medium'>Community Builder</span>
										</div>
										<div className='flex items-center justify-between rounded-md bg-bg_modal px-3 py-2 text-sm'>
											<span className='text-text_secondary'>Personality Name:</span>
											<span className='font-medium'>{displayName || 'Alice'}</span>
										</div>
										<div className='flex items-center justify-between rounded-md bg-bg_modal px-3 py-2 text-sm'>
											<span className='text-text_secondary'>Estimated Fee:</span>
											<span className='font-medium'>≈ 5 DOT</span>
										</div>
									</div>
								</div>

								<div className='flex items-center justify-end'>
									<Button
										className='px-5'
										onClick={() => {
											onOpenChange(false);
											setOpenSuccess(true);
										}}
									>
										Confirm & Delegate <ArrowRight />
									</Button>
								</div>
							</div>
						)}

						{step === 1 && (
							<div className='flex items-center justify-end'>
								<Button
									onClick={() => setStep(2)}
									className='px-5'
								>
									Let&apos;s Begin <ArrowRight />
								</Button>
							</div>
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
					onOpenChange(true);
					setStep(3);
				}}
				onEditPersonality={() => {
					setOpenEdit(false);
					onOpenChange(true);
					setStep(4);
				}}
			/>
		</>
	);
}

export default memo(DelegateXSetupDialog);
