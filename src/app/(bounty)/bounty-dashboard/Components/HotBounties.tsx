// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { IGenericListingResponse, IPostListing } from '@/_shared/types';
import { ArrowUpRight } from 'lucide-react';
import BountyCard from '@assets/bounties/bounty-card.svg';
import UserIcon from '@assets/profile/user-icon.svg';
import Image from 'next/image';
import Address from '@/app/_shared-components/Profile/Address/Address';
import { spaceGroteskFont } from '@/app/_style/fonts';
import ChildBounties from '@assets/bounties/child_bounties.svg';
import { FaAngleRight } from 'react-icons/fa6';

export default function HotBounties({ hotBounties }: { hotBounties: IGenericListingResponse<IPostListing> }) {
	return (
		<div>
			<div className='flex items-center justify-between p-4'>
				<h3 className='font-pixelify text-3xl font-bold text-btn_secondary_text'>
					🔥 Hot Bounties <span className={`text-2xl font-medium ${spaceGroteskFont.className} `}>({hotBounties.totalCount})</span>
				</h3>
				<p className={`${spaceGroteskFont.className} text-2xl font-bold text-navbar_border`}>View All</p>
			</div>
			<div className='grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 md:grid-cols-3'>
				{hotBounties.items.map((bounty) => (
					<div
						key={bounty.index}
						className='overflow-hidden sm:w-[340px] xl:w-[363px]'
					>
						{/* Header Section with Price and Arrow */}
						<div className='flex w-full'>
							<div className='relative flex h-[56px] w-[85%] items-center gap-x-3 rounded-t-3xl border-b-0 border-l border-r border-t border-solid border-border_grey bg-bg_modal px-3 pt-5'>
								<div className='flex items-baseline gap-x-2'>
									<h2 className='mt-4 font-pixelify text-[35px] font-normal text-navbar_border'>$1.2M</h2>
								</div>
								{/* Custom border radius effect */}
								<div className='absolute bottom-0 right-[-30px] h-[30px] w-[30px] overflow-hidden bg-bg_modal'>
									<div className='bg-bg_primary absolute bottom-0 left-0 h-[30px] w-[30px] rounded-bl-[100%] border-b border-l border-border_grey'></div>
								</div>
							</div>
							<div className='z-10 ml-2 mt-1'>
								<button
									type='button'
									className='bg-arrow_bg_color rounded-full p-3'
								>
									<ArrowUpRight
										size={20}
										className='text-bg_modal'
									/>
								</button>
							</div>
						</div>

						{/* Main Content */}
						<div className='rounded-tr-2xl border-b border-l border-r border-t-0 border-solid border-border_grey bg-bg_modal px-3 py-1'>
							<Image
								src={BountyCard}
								alt='Bounty'
								className='my-3 h-32 w-full rounded-md object-cover'
								width={100}
								height={100}
							/>
							<h4 className='text-lg font-bold text-btn_secondary_text'>
								<span className='text-[17px] font-medium text-wallet_btn_text'>#{bounty.index}</span> {bounty.title}
							</h4>
							<div className='line-clamp-2 overflow-hidden text-ellipsis'>
								<p className='text-sm text-text_primary'>{bounty.onChainInfo?.description}</p>
							</div>
							<div className='mt-10 flex items-center text-sm'>
								<Image
									src={UserIcon}
									alt='User'
									className='mr-2 h-4 w-4'
									width={16}
									height={16}
								/>
								<Address
									address={bounty.onChainInfo?.proposer || ''}
									className='text-sm text-text_primary'
								/>
							</div>
						</div>

						{/* Footer */}
						<div className='bg-child_bounties_bg flex items-center justify-between rounded-b-3xl p-4'>
							<div className='flex items-center gap-2'>
								<Image
									src={ChildBounties}
									alt='Child Bounties'
									width={16}
									height={16}
								/>
								<span className='text-sm text-btn_primary_text'>Child Bounties: 0</span>
							</div>
							<FaAngleRight
								className='text-btn_primary_text text-opacity-[70%]'
								size={18}
							/>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
