// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { memo } from 'react';
import Image from 'next/image';
import { Button } from '@/app/_shared-components/Button';
import { ArrowRight } from 'lucide-react';
import { Separator } from '@/app/_shared-components/Separator';
import QuestionIcon from '@assets/delegation/question.svg';
import Strategy1 from '@assets/delegation/klara/Strategy1.svg';

interface VotingStrategy {
	id: string;
	name: string;
	description: string;
	icon: string;
	tags: string[];
}

interface VotingStrategyStepProps {
	onNext: () => void;
	selectedStrategy?: string;
	onStrategySelect?: (strategyId: string) => void;
	strategies?: VotingStrategy[];
	isEditMode?: boolean;
}

const defaultStrategies: VotingStrategy[] = [
	{
		id: 'aggressive-innovator',
		name: 'Aggressive Innovator',
		description: 'Backs bold ideas with potential network-wide impact.',
		icon: Strategy1,
		tags: ['Optimistic', 'Fast-moving']
	}
];

function VotingStrategyStep({ onNext, selectedStrategy = 'aggressive-innovator', onStrategySelect, strategies = defaultStrategies, isEditMode = false }: VotingStrategyStepProps) {
	const handleStrategySelect = (strategyId: string) => {
		if (onStrategySelect) {
			onStrategySelect(strategyId);
		}
	};

	return (
		<div className='space-y-4 rounded-lg bg-delegation_bgcard p-4'>
			<div>
				<div className='mb-2 flex items-center gap-2'>
					<p className='font-semibold text-text_primary'>{isEditMode ? 'Update Voting Strategy' : 'Voting Strategy'}</p>
					<Image
						src={QuestionIcon}
						alt='Question Icon'
						width={16}
						height={16}
					/>
				</div>
				<p className='text-sm text-text_primary'>
					Pick the voting strategy that best matches your approach. Each template represents how DelegateX weighs different factors before voting.
				</p>
			</div>

			<div className='space-y-3'>
				{strategies.map((strategy) => (
					<div
						aria-hidden
						key={strategy.id}
						className={`cursor-pointer rounded-xl bg-gradient-to-b from-delegatebotx_border to-transparent p-[1px] ${
							selectedStrategy === strategy.id ? 'ring-2 ring-text_pink' : ''
						}`}
						onClick={() => handleStrategySelect(strategy.id)}
					>
						<div className='flex w-full flex-col items-start rounded-xl bg-bg_modal p-4'>
							<div className='flex items-center gap-4'>
								<Image
									src={strategy.icon}
									alt='Strategy Icon'
									width={120}
									height={120}
									className='shrink-0'
								/>

								<div className='flex w-full flex-col'>
									<p className='text-base font-semibold'>{strategy.name}</p>
									<p className='mt-1 text-sm text-text_primary'>{strategy.description}</p>

									<div className='mt-3 flex items-center gap-2 text-wallet_btn_text'>
										{strategy.tags.map((tag) => (
											<span
												key={tag}
												className='rounded-md bg-delegation_bgcard px-2 py-1 text-[11px]'
											>
												{tag}
											</span>
										))}
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
				))}
			</div>

			<div className='flex items-center justify-end'>
				<Button
					className='px-5'
					onClick={onNext}
				>
					{isEditMode ? 'Update Strategy' : 'Set Personality'} <ArrowRight />
				</Button>
			</div>
		</div>
	);
}

export default memo(VotingStrategyStep);
