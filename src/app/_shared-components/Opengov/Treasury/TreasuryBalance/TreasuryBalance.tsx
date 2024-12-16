import React from 'react';
import InfoIcon from '@/_assets/icons/Treasury/info-icon.svg';
import ArrowIcon from '@/_assets/icons/Treasury/arrow-icon.svg';
import Image from 'next/image';
import { NETWORKS_DETAILS } from '@/_shared/_constants/networks';
import { ENetwork } from '@/_shared/types';
import TokenDetails from './TokenDetails/TokenDetails';

const TreasuryBalance = () => {
	return (
		<main>
			<div className='flex items-center justify-between'>
				<div className='flex items-center gap-1'>
					<span className='text-xs font-normal'>Treasury</span>
					<Image
						src={InfoIcon}
						alt='Info'
						width={16}
						height={16}
						className='cursor-pointer'
					/>
					<span className='rounded-sm bg-[#485F7D0D] px-[6px] py-1 text-[10px] font-medium text-[#485F7DCC]'>Monthly</span>
				</div>
				<div className='flex items-baseline gap-[6px]'>
					<span className='text-xs font-normal'>{NETWORKS_DETAILS?.[ENetwork.POLKADOT]?.tokenSymbol} Price</span>
					<span className='text-lg font-medium text-[#485F7D]'>$8.95</span>
					<span className='text-xs font-normal text-[#52C41A]'>15%</span>
				</div>
			</div>

			<div>
				<div className='flex items-baseline gap-[6px]'>
					<span className='text-xl font-medium'>~$280.11M</span>
					<div className='flex items-center'>
						<span className='text-xs font-normal text-[#E5007A]'>Details</span>
						<Image
							src={ArrowIcon}
							alt='Info'
							width={16}
							height={16}
							className='cursor-pointer'
						/>
					</div>
				</div>
				<TokenDetails />
			</div>
		</main>
	);
};

export default TreasuryBalance;
