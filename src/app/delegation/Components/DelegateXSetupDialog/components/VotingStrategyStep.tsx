// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { memo, useRef } from 'react';
import Image from 'next/image';
import { ArrowRight, ChevronRight, ChevronLeft } from 'lucide-react';
import QuestionIcon from '@assets/delegation/question.svg';
import { Button } from '@/app/_shared-components/Button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/app/_shared-components/Tooltip';
import { VotingStrategy } from '@/_shared/types';
import StrategyCard from './StrategyCard';

interface VotingStrategyStepProps {
	onNext: () => void;
	selectedStrategy?: string;
	onStrategySelect?: (strategyId: string) => void;
	isEditMode?: boolean;
	strategies?: VotingStrategy[];
	onSubmit?: () => Promise<void>;
	isLoading?: boolean;
}

function VotingStrategyStep({ onNext, selectedStrategy, onStrategySelect, strategies, isEditMode = false, onSubmit, isLoading = false }: VotingStrategyStepProps) {
	const scrollRef = useRef<HTMLDivElement>(null);

	const handleStrategySelect = (strategyId: string) => {
		if (onStrategySelect) {
			onStrategySelect(strategyId);
		}
	};

	const handleNext = async () => {
		if (isEditMode && onSubmit) {
			await onSubmit();
		} else {
			onNext();
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
						className='hide_scrollbar flex max-h-[360px] flex-col gap-3 overflow-y-auto px-2 py-2 sm:max-h-none sm:flex-row sm:items-start sm:overflow-x-auto sm:overflow-y-visible sm:px-4 sm:py-4 md:max-w-3xl md:px-10'
					>
						{strategies &&
							strategies.map((strategy) => (
								<StrategyCard
									key={strategy.id}
									strategy={strategy}
									isSelected={selectedStrategy === strategy.id}
									onSelect={handleStrategySelect}
								/>
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
					className={`w-full px-5 text-white sm:w-auto ${!selectedStrategy || isLoading ? 'cursor-not-allowed bg-gray-400' : 'bg-text_pink hover:bg-pink-600'}`}
					onClick={handleNext}
					disabled={!selectedStrategy || isLoading}
				>
					{isLoading ? 'Updating...' : isEditMode ? 'Update Strategy' : 'Set Personality'} <ArrowRight className='ml-2 h-4 w-4' />
				</Button>
			</div>
		</div>
	);
}

export default memo(VotingStrategyStep);
