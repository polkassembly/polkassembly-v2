// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/app/_shared-components/Collapsible';
import Image from 'next/image';
import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { VotingStrategy } from '@/_shared/types';
import { Separator } from '@/app/_shared-components/Separator';
import { Button } from '@/app/_shared-components/Button';

function StrategyCard({ strategy, isSelected, onSelect }: { strategy: VotingStrategy; isSelected: boolean; onSelect: (id: string) => void }) {
	const [isOpen, setIsOpen] = useState(false);

	return (
		<Collapsible
			open={isOpen}
			onOpenChange={setIsOpen}
			className={`flex w-full shrink-0 flex-col rounded-xl border border-solid sm:w-[250px] ${
				isSelected ? 'scale-105 border-text_pink' : 'border-[#D2D8E0] dark:border-[#3B444F]'
			} transition-all duration-200`}
		>
			<div
				aria-hidden
				onClick={() => onSelect(strategy.id)}
				className='flex h-full w-full cursor-pointer flex-col items-start rounded-xl bg-bg_modal p-3 sm:p-4'
			>
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

						<div className='mt-2 flex flex-wrap items-center justify-center gap-1 text-wallet_btn_text sm:mt-3 sm:gap-2'>
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

				<div className='mx-auto w-full'>
					<CollapsibleTrigger asChild>
						<Button
							variant='ghost'
							size='sm'
							onClick={(e) => {
								e.stopPropagation();
								setIsOpen(!isOpen);
							}}
							className='mt-1 flex w-full items-center justify-center gap-1 px-0 text-xs font-medium text-text_pink hover:bg-transparent hover:text-text_pink hover:underline sm:mt-2 sm:text-sm'
						>
							{isOpen ? 'Hide Logic' : 'View Logic'}
							{isOpen ? <ChevronUp className='h-3 w-3' /> : <ChevronDown className='h-3 w-3' />}
						</Button>
					</CollapsibleTrigger>
					<CollapsibleContent className='text-text_secondary mt-2 text-center text-[10px] sm:text-xs'>{strategy.logic}</CollapsibleContent>
				</div>
			</div>
		</Collapsible>
	);
}

export default StrategyCard;
