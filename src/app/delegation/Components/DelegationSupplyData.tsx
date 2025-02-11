// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import Image from 'next/image';
import DOT from '@assets/delegation/dot.svg';
import tokens from '@assets/delegation/tokens.svg';
import votes from '@assets/delegation/votes.svg';
import delegates from '@assets/delegation/delegates.svg';
import delegatees from '@assets/delegation/delegatees.svg';

function DelegationSupplyData() {
	return (
		<div className='mt-5 flex gap-5 rounded-lg bg-bg_modal p-4 shadow-lg'>
			<div className='flex items-center gap-3'>
				<Image
					src={DOT}
					alt='DOT'
					className='h-10 w-10'
				/>
				<div className='flex flex-col'>
					<p className='text-xs text-wallet_btn_text text-opacity-[70%]'>Total Supply</p>
					<p className='text-xl font-semibold'>
						1.53B <span className='text-sm text-wallet_btn_text'>DOT</span>
					</p>
				</div>
			</div>
			<div className='border-l border-border_grey pl-5'>
				<div className='flex items-center gap-3'>
					<Image
						src={tokens}
						alt='Tokens'
						className='h-10 w-10'
					/>
					<div className='flex flex-col'>
						<p className='text-xs text-wallet_btn_text text-opacity-[70%]'>Delegated Tokens</p>
						<p className='text-xl font-semibold'>
							679.6K <span className='text-sm text-wallet_btn_text'>DOT</span>
						</p>
					</div>
				</div>
			</div>
			<div className='border-l border-border_grey pl-5'>
				<div className='flex items-center gap-3'>
					<Image
						src={votes}
						alt='Votes'
						className='h-10 w-10'
					/>
					<div className='flex flex-col'>
						<p className='text-xs text-wallet_btn_text text-opacity-[70%]'>Total Delegated Votes</p>
						<p className='text-xl font-semibold'>
							123.6K <span className='text-sm text-wallet_btn_text'>DOT</span>
						</p>
					</div>
				</div>
			</div>
			<div className='border-l border-border_grey pl-5'>
				<div className='flex items-center gap-3'>
					<Image
						src={delegates}
						alt='Delegates'
						className='h-10 w-10'
					/>
					<div className='flex flex-col'>
						<p className='text-xs text-wallet_btn_text text-opacity-[70%]'>Total Delegates</p>
						<p className='text-xl font-semibold'>
							108 <span className='text-sm text-wallet_btn_text'>DOT</span>
						</p>
					</div>
				</div>
			</div>
			<div className='border-l border-border_grey pl-5'>
				<div className='flex items-center gap-3'>
					<Image
						src={delegatees}
						alt='Delegatees'
						className='h-10 w-10'
					/>
					<div className='flex flex-col'>
						<p className='text-xs text-wallet_btn_text text-opacity-[70%]'>Total Delegatees</p>
						<p className='text-xl font-semibold'>
							21,203 <span className='text-sm text-wallet_btn_text'>DOT</span>
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}

export default DelegationSupplyData;
