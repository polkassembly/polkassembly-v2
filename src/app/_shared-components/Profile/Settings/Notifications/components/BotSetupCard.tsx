// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { CirclePlus } from 'lucide-react';
import React from 'react';
import { ENotificationChannel } from '@/_shared/types';

interface BotSetupCardProps {
	Icon: React.ComponentType<{ width?: number; height?: number; className?: string }>;
	title: string;
	description: string;
	channel: ENotificationChannel;
	onClick: (channel: ENotificationChannel) => void;
}

function BotSetupCard({ Icon, title, description, channel, onClick }: BotSetupCardProps) {
	const isComingSoon = description === 'Coming Soon';
	const AddBotText = 'ADD THE POLKASSEMBLY BOT';

	const getDescriptionParts = (desc: string) => {
		if (desc.includes(AddBotText)) {
			const parts = desc.split(AddBotText);
			return {
				beforeText: parts[0],
				clickableText: AddBotText,
				afterText: parts[1]
			};
		}
		return { beforeText: '', clickableText: desc, afterText: '' };
	};

	const { beforeText, clickableText, afterText } = getDescriptionParts(description);

	return (
		<div className='flex items-start gap-3 rounded-lg p-4'>
			<div className='mt-1'>
				<Icon
					width={20}
					height={20}
					className='text-text_primary'
				/>
			</div>
			<div className='flex-1 text-btn_secondary_text'>
				<div className='flex items-center gap-2'>
					<h4 className='text-base font-medium text-text_primary'>{title}</h4>
					{channel === ENotificationChannel.ELEMENT && <span className='rounded-md bg-[#6C4CF1] px-2 py-0.5 text-xs font-medium text-white'>Coming Soon</span>}
				</div>

				{!isComingSoon && channel !== ENotificationChannel.ELEMENT && (
					<div className='mt-2 flex items-center gap-2'>
						<CirclePlus className='h-4 w-4 text-text_pink' />
						<p className='text-text_secondary text-sm'>
							{beforeText}
							<button
								type='button'
								className='text-text_pink underline-offset-2 transition-colors hover:text-text_pink/80 hover:underline'
								onClick={() => onClick(channel)}
							>
								{clickableText}
							</button>
							<span className='text-xs'>{afterText}</span>
						</p>
					</div>
				)}

				{isComingSoon && channel !== ENotificationChannel.ELEMENT && <p className='text-text_secondary mt-2 text-sm'>{description}</p>}
			</div>
		</div>
	);
}

export default BotSetupCard;
