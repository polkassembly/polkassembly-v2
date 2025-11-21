// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { memo, useRef } from 'react';
import Image from 'next/image';
import { Button } from '@/app/_shared-components/Button';
import { ArrowRight, ChevronRight, ChevronLeft } from 'lucide-react';
import QuestionIcon from '@assets/delegation/question.svg';
import Strategy1 from '@assets/delegation/klara/Strategy1.svg';
import Strategy2 from '@assets/delegation/klara/Strategy2.svg';
import Strategy3 from '@assets/delegation/klara/Strategy3.svg';
import Strategy4 from '@assets/delegation/klara/Strategy4.svg';
import { Separator } from '@/app/_shared-components/Separator';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/app/_shared-components/Tooltip';

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
	isEditMode?: boolean;
	strategies?: VotingStrategy[];
}

const defaultStrategies: VotingStrategy[] = [
	{
		id: 'strategy-1',
		name: 'Aggressive Innovator',
		description: 'Backs bold ideas with potential network-wide impact.',
		icon: Strategy1,
		tags: ['Optimistic', 'Fast-moving']
	},
	{
		id: 'strategy-2',
		name: 'Aggressive Pioneer',
		description: 'Explores new opportunities with a focus on growth.',
		icon: Strategy2,
		tags: ['Visionary', 'Persistent']
	},
	{
		id: 'strategy-3',
		name: 'Aggressive Trader',
		description: 'Seeks high returns through calculated risks and market trends.',
		icon: Strategy3,
		tags: ['Analytical', 'Performance-driven']
	},
	{
		id: 'strategy-4',
		name: 'Aggressive Innovator',
		description: 'Backs bold ideas with potential network-wide impact.',
		icon: Strategy4,
		tags: ['Optimistic', 'Fast-moving']
	}
];

function VotingStrategyStep({ onNext, selectedStrategy = 'strategy-1', onStrategySelect, strategies = defaultStrategies, isEditMode = false }: VotingStrategyStepProps) {
	const scrollRef = useRef<HTMLDivElement>(null);

	const handleStrategySelect = (strategyId: string) => {
		if (onStrategySelect) {
			onStrategySelect(strategyId);
		}
	};

	const scrollRight = () => {
		if (scrollRef.current) {
			scrollRef.current.scrollBy({ left: 200, behavior: 'smooth' });
		}
	};

	const scrollLeft = () => {
		if (scrollRef.current) {
			scrollRef.current.scrollBy({ left: -200, behavior: 'smooth' });
		}
	};

	return (
		<div className='space-y-4'>
			<div className='rounded-lg bg-delegation_bgcard p-4 sm:p-6'>
				<div>
					<div className='mb-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-2'>
						<div className='flex items-center gap-2'>
							<p className='font-semibold text-text_primary'>{isEditMode ? 'Update Voting Strategy' : 'Choose Voting Strategy'}</p>
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
										Pick the voting strategy that best matches your approach. Each template represents how Delegate X weighs different factors before voting.
									</p>
								</TooltipContent>
							</Tooltip>
						</div>
					</div>
					<p className='text-[10px] text-text_primary md:text-sm'>
						Pick the voting strategy that best matches your approach. Each template represents how Delegate X weighs different factors before voting.
					</p>
				</div>

				<div className='relative mt-2 w-full md:mt-4'>
					<button
						type='button'
						onClick={scrollLeft}
						className='absolute left-0 top-1/2 z-10 hidden -translate-y-1/2 rounded-full bg-black p-1 shadow-md hover:bg-gray-800 sm:block'
					>
						<ChevronLeft className='h-5 w-5 text-white' />
					</button>

					<div
						ref={scrollRef}
						className='hide_scrollbar flex max-h-[360px] flex-col gap-3 overflow-y-auto px-2 py-2 sm:max-h-none sm:flex-row sm:overflow-x-auto sm:overflow-y-visible sm:px-4 sm:py-4 md:max-w-3xl md:px-10'
					>
						{strategies.map((strategy) => (
							<div
								aria-hidden
								key={strategy.id}
								className={`flex w-full shrink-0 cursor-pointer rounded-xl border border-solid sm:w-[250px] ${
									selectedStrategy === strategy.id ? 'scale-105 border-text_pink' : 'border-[#D2D8E0] dark:border-[#3B444F]'
								}`}
								onClick={() => handleStrategySelect(strategy.id)}
							>
								<div className='flex w-full flex-col items-start rounded-xl bg-bg_modal p-3 sm:p-4'>
									<div className='flex w-full flex-col items-center gap-3 sm:gap-4'>
										<Image
											src={strategy.icon}
											alt='Strategy Icon'
											width={80}
											height={80}
											className='h-16 w-16 shrink-0 sm:h-20 sm:w-20'
										/>

										<div className='flex w-full flex-col text-center'>
											<p className='text-sm font-semibold text-text_primary sm:text-base'>{strategy.name}</p>
											<p className='mt-1 text-[11px] leading-tight text-text_primary sm:text-xs'>{strategy.description}</p>

											<div className='mt-2 flex items-center justify-center gap-1 text-wallet_btn_text sm:mt-3 sm:gap-2'>
												{strategy.tags.map((tag: string) => (
													<span
														key={tag}
														className='text-text_secondary rounded-full bg-delegation_bgcard px-2 py-0.5 text-[9px] font-medium sm:px-3 sm:py-1 sm:text-[10px]'
													>
														{tag}
													</span>
												))}
											</div>
										</div>
									</div>

									<Separator className='mt-2 sm:mt-3' />

									<div className='mx-auto'>
										<Button
											variant='ghost'
											size='sm'
											className='mt-1 px-0 text-xs font-medium text-text_pink hover:bg-transparent hover:text-text_pink hover:underline sm:mt-2 sm:text-sm'
										>
											View Logic
										</Button>
									</div>
								</div>
							</div>
						))}
					</div>

					<button
						type='button'
						onClick={scrollRight}
						className='absolute right-0 top-1/2 z-10 hidden -translate-y-1/2 rounded-full bg-black p-1 shadow-md hover:bg-gray-800 sm:block'
					>
						<ChevronRight className='h-5 w-5 text-white' />
					</button>
				</div>
			</div>

			<div className='flex items-center justify-center sm:justify-end'>
				<Button
					className='w-full bg-text_pink px-5 text-white hover:bg-pink-600 sm:w-auto'
					onClick={onNext}
				>
					{isEditMode ? 'Update Strategy' : 'Set Personality'} <ArrowRight className='ml-2 h-4 w-4' />
				</Button>
			</div>
		</div>
	);
}

export default memo(VotingStrategyStep);
