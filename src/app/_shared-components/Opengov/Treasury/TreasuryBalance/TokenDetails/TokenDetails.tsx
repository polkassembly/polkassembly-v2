import React from 'react';
import Image from 'next/image';
import { ENetwork } from '@/_shared/types';
import { NETWORKS_DETAILS } from '@/_shared/_constants/networks';
import DotIcon from '@/_assets/icons/Treasury/dot-icon.svg';
import MythIcon from '@/_assets/icons/Treasury/myth-icon.svg';
import UsdcIcon from '@/_assets/icons/Treasury/usdc-icon.svg';
import UsdtIcon from '@/_assets/icons/Treasury/usdt-icon.svg';

const TokenDetails = () => {
	const unit = NETWORKS_DETAILS?.[ENetwork.POLKADOT]?.tokenSymbol;
	return (
		<div className='mt-1 items-center gap-1 sm:flex'>
			<div className='flex items-center gap-1'>
				<div className='no-wrap flex items-center gap-1 text-xs'>
					<Image
						alt='relay icon'
						width={16}
						height={16}
						src={DotIcon}
						className='-mt-[2px]'
					/>
					<span className='text-blue-light-high dark:text-blue-dark-high text-xs font-medium'>29.35M</span>
					{unit}
					{/* Separator */}
				</div>
				<div className='no-wrap flex items-center gap-[4px] text-xs'>
					<Image
						alt='relay icon'
						width={16}
						height={16}
						src={UsdcIcon}
						className='-mt-[2px] ml-[3px]'
					/>
					<span className='text-blue-light-high dark:text-blue-dark-high text-xs font-medium'>8.07</span>
					USDC
					{/* Separator */}
				</div>
			</div>

			<div className='mt-1 flex items-center gap-1 sm:mt-0'>
				<div className='no-wrap flex items-center gap-[4px] text-xs'>
					<Image
						alt='relay icon'
						width={16}
						height={16}
						src={UsdtIcon}
						className='-mt-[2px] ml-[3px]'
					/>
					<span className='text-blue-light-high dark:text-blue-dark-high text-xs font-medium'>9.36M</span>
					USDt
					{/* Separator */}
				</div>

				{/* MYTH */}
				<div className='no-wrap mt-1 flex items-center gap-[4px] sm:mt-0'>
					<Image
						src={MythIcon}
						width={15}
						height={15}
						alt='icon'
						className='-mt-[2px] ml-[3px]'
					/>
					<span className='text-blue-light-high dark:text-blue-dark-high text-xs font-medium'>4.88M MYTH</span>
				</div>
			</div>
		</div>
	);
};

export default TokenDetails;
