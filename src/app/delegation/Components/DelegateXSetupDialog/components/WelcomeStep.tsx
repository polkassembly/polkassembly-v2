// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { memo } from 'react';
import Image from 'next/image';
import { DialogHeader, DialogTitle } from '@/app/_shared-components/Dialog/Dialog';
import KlaraBox from '@assets/delegation/klara/klara-box.svg';
import { Button } from '@/app/_shared-components/Button';
import { ArrowRight } from 'lucide-react';

interface WelcomeStepProps {
	onNext: () => void;
	isEditMode?: boolean;
}

function WelcomeStep({ onNext, isEditMode = false }: WelcomeStepProps) {
	return (
		<div className='space-y-4'>
			<div className='rounded-lg bg-delegation_bgcard p-4'>
				<div className='flex flex-col items-center justify-center gap-8 md:flex-row md:items-start md:justify-start'>
					<div>
						<Image
							src={KlaraBox}
							alt='Klara'
							width={450}
							height={450}
							className='h-[120px] w-[280px] md:h-[200px] md:w-[400px]'
						/>
					</div>
					<div>
						<DialogHeader className='p-0'>
							<DialogTitle className='mb-2 text-lg font-semibold'>
								{isEditMode
									? "Welcome back! Let's update your DelegateX configuration."
									: "Hi there! I'm Klara, and I'll help you set up DelegateX, your personal governance agent."}
							</DialogTitle>
						</DialogHeader>

						<div className='text-text_secondary max-h-32 space-y-2 overflow-y-auto pt-5 text-sm md:max-h-none'>
							<p>DelegateX combines Klara&apos;s AI layer with Cybergov&apos;s onchain-voting system.</p>
							<p>It is a custom voting agent setup for individual users:</p>
							<ul className='ml-5 space-y-1 md:list-disc'>
								<li>Deploying a DelegateX instance creates a unique delegate account for each user; each instance has a logic setup by the user.</li>
								<li>
									At the current stage, voting logic can be picked from the provided templates that use combinations of evaluation parameters to determine a conclusive vote result.
								</li>
								<li>The vote result is a weighted result of three parameters defined in CyberGov.</li>
								<li>
									Each vote made by the DelegateX instance is supported with a comment explaining the decision. The comment style depends on the persona selected during setup.
								</li>
							</ul>
						</div>
					</div>
				</div>
			</div>
			<div className='flex items-center justify-end'>
				<Button
					onClick={onNext}
					className='px-5'
				>
					Let&apos;s Begin <ArrowRight />
				</Button>
			</div>
		</div>
	);
}

export default memo(WelcomeStep);
