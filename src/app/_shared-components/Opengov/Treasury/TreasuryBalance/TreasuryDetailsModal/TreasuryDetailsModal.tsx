// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import Image from 'next/image';
import Link from 'next/link';
import RedirectingIcon from '@/_assets/icons/Treasury/redirecting-icon.svg';
import { ENetwork } from '@/_shared/types';
import { NETWORKS_DETAILS } from '@/_shared/_constants/networks';
import Modal from '@/app/_shared-components/Modal';

function TreasuryDetailsModal() {
	const unit = NETWORKS_DETAILS?.[ENetwork.POLKADOT]?.tokenSymbol;
	return (
		<Modal>
			<div className=''>
				<div className='dark:text-blue-dark-medium mb-[10px] mt-4 text-sm font-medium text-[#485F7DB2]'>Across Networks:</div>
				<div className='flex flex-col font-medium'>
					<div className='text-blue-light-high dark:text-blue-dark-high mb-[6px] items-start gap-[6px] sm:flex'>
						<div className='flex w-[106px] gap-[6px]'>
							{/* <Image
								alt='relay icon'
								width={20}
								height={20}
								src='/assets/treasury/relay-chain-icon.svg'
								className='-mt-[1px]'
							/> */}
							<span className='text-sm font-medium'>Relay Chain</span>
						</div>
						<div className='-mt-[2px] ml-6 flex flex-col sm:ml-0'>
							<span className='ml-1 text-base font-semibold'>~ $110.39M</span>
							<div className='ml-1 flex items-center gap-[6px] text-sm'>
								{/* <Image
									alt='relay icon'
									width={16}
									height={16}
									src='/assets/treasury/dot-icon.svg'
									className='-mt-[2px]'
								/> */}
								{/* <span className='font-medium'>{formatUSDWithUnits(String(available))} </span> */}
								<span className='font-medium'>12.32M </span>
								{unit}
							</div>
						</div>
					</div>

					<div className='text-blue-light-high dark:text-blue-dark-high mb-[6px] items-start gap-[6px] sm:flex'>
						<div className='flex w-[106px] gap-[6px]'>
							{/* <Image
								alt='relay icon'
								width={20}
								height={20}
								src='/assets/icons/asset-hub-icon.svg'
								className='-mt-[0px]'
							/> */}
							<span className='text-sm font-medium'>Asset Hub</span>
						</div>
						<div className='ml-6 flex flex-col sm:ml-0'>
							<span className='ml-1 text-base font-semibold'>
								~ $51.48M
								<Link
									href='https://assethub-polkadot.subscan.io/account/14xmwinmCEz6oRrFdczHKqHgWNMiCysE2KrA4jXXAAM1Eogk'
									className='cursor-pointer sm:hidden'
									target='_blank'
								>
									<Image
										alt='relay icon'
										width={16}
										height={16}
										src={RedirectingIcon}
										className='-mt-[2px]'
									/>
								</Link>
							</span>
							<div className='items-center gap-1 sm:flex'>
								<div className='ml-1 flex items-center gap-[6px] text-sm'>
									{/* <Image
										alt='relay icon'
										width={16}
										height={16}
										src='/assets/treasury/dot-icon.svg'
										className='-mt-[2px]'
									/> */}
									{/* <span className='font-medium'>{formatUSDWithUnits(assetValue)}</span> */}
									<span className='font-medium'>4.58M</span>
									{unit}
								</div>

								<div className='flex'>
									<div className='ml-1 flex items-center gap-[6px] text-sm'>
										{/* <Image
											alt='relay icon'
											width={16}
											height={16}
											src='/assets/treasury/usdc-icon.svg'
											className='-mt-[2px]'
										/> */}
										<span className='font-medium'>4.33M</span>
										USDC
									</div>

									<div className='ml-1 flex items-center gap-[6px] text-sm'>
										{/* <Image
											alt='relay icon'
											width={16}
											height={16}
											src='/assets/treasury/usdt-icon.svg'
											className='-mt-[2px]'
										/> */}
										<span className='font-medium'>6.15M</span>
										USDt
									</div>
									<Link
										href='https://assethub-polkadot.subscan.io/account/14xmwinmCEz6oRrFdczHKqHgWNMiCysE2KrA4jXXAAM1Eogk'
										className='-mb-1 hidden cursor-pointer sm:ml-[2px] sm:flex'
										target='_blank'
									>
										<Image
											alt='relay icon'
											width={16}
											height={16}
											src={RedirectingIcon}
											className='-mt-[2px]'
										/>
									</Link>
								</div>
							</div>
						</div>
					</div>

					<div className='text-blue-light-high dark:text-blue-dark-high items-start gap-[6px] sm:flex'>
						<div className='flex w-[106px] gap-[6px]'>
							{/* <Image
								alt='relay icon'
								width={20}
								height={20}
								src='/assets/icons/hydration-icon.svg'
								className='-mt-[0px]'
							/> */}
							<span className='text-sm font-medium'>Hydration</span>
						</div>
						<div className='ml-6 flex flex-col sm:ml-0'>
							<span className='ml-1 text-base font-semibold'>~ $38.85M</span>
							<div className='items-center gap-1 sm:flex'>
								<div className='flex'>
									<div className='ml-1 flex items-center gap-[6px] text-sm'>
										{/* <Image
											alt='relay icon'
											width={16}
											height={16}
											src='/assets/treasury/dot-icon.svg'
											className='-mt-[2px]'
										/> */}
										<span className='font-medium'>4.14M</span>
										{unit}
									</div>

									<div className='ml-1 flex items-center gap-[4px] text-sm'>
										{/* <Image
											alt='relay icon'
											width={16}
											height={16}
											src='/assets/treasury/usdc-icon.svg'
											className='-mt-[2px]'
										/> */}
										<span className='font-medium'>884.41k </span>
										USDC
									</div>
								</div>

								<div className='flex gap-[4px] max-sm:flex-wrap'>
									<div className='ml-1 flex items-center gap-[4px] text-sm'>
										{/* <Image
											alt='relay icon'
											width={16}
											height={16}
											src='/assets/treasury/usdt-icon.svg'
											className='-mt-[2px]'
										/> */}
										<span className='font-medium'>883.34K</span>
										USDt
									</div>

									<div className='text-pink_primary flex gap-1 text-xs'>
										<Link
											href='https://hydration.subscan.io/account/7LcF8b5GSvajXkSChhoMFcGDxF9Yn9unRDceZj1Q6NYox8HY'
											className='flex flex-shrink-0 items-center gap-1 font-medium'
											target='_blank'
										>
											Address #1{' '}
											<Image
												alt='relay icon'
												width={16}
												height={16}
												src={RedirectingIcon}
												className='-mt-[2px]'
											/>
										</Link>
										<Link
											href='https://hydration.subscan.io/account/7KCp4eenFS4CowF9SpQE5BBCj5MtoBA3K811tNyRmhLfH1aV'
											className='flex flex-shrink-0 items-center gap-1 font-medium'
											target='_blank'
										>
											Address #2{' '}
											<Image
												alt='relay icon'
												width={16}
												height={16}
												src={RedirectingIcon}
												className='-mt-[2px]'
											/>
										</Link>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>

				<div>
					{
						<div className='text-blue-light-high dark:text-blue-dark-high items-baseline gap-[6px] sm:flex'>
							<div className='flex w-[80px] gap-[6px]'>
								<span className='text-sm font-medium'>Bounties</span>
							</div>
							<div className='flex flex-col'>
								<span className='ml-1 text-base font-semibold'>~ $43.19</span>
								<div className='ml-1 flex items-center gap-[6px] text-sm'>
									{/* <Image
										alt='relay icon'
										width={16}
										height={16}
										src='/assets/treasury/dot-icon.svg'
										className='-mt-[2px]'
									/> */}
									{/* <span className='font-medium'>~ {formatUSDWithUnits(formatBnBalance(totalBountyPool, { numberAfterComma: 1, withThousandDelimitor: false }, network))}</span> */}
									<span className='font-medium'>~ 4.82M</span>
									{unit}
									<Link
										href='https://polkadot.polkassembly.io/bounty-dashboard'
										className='text-pink_primary flex cursor-pointer items-center gap-1 text-xs font-medium'
										target='_blank'
									/>
								</div>
							</div>
						</div>
					}

					<div className='text-blue-light-high dark:text-blue-dark-high mt-[6px] items-baseline gap-[6px] sm:flex'>
						<div className='flex w-[80px] gap-[6px]'>
							<span className='text-sm font-medium'>Fellowships</span>
						</div>
						<div className='flex flex-col'>
							<span className='ml-1 text-base font-semibold'>~ $19.91M</span>
							<div className='items-center gap-1 sm:flex'>
								<div className='ml-1 flex items-center gap-[6px] text-sm'>
									<Link
										href='https://assethub-polkadot.subscan.io/account/16VcQSRcMFy6ZHVjBvosKmo7FKqTb8ZATChDYo8ibutzLnos'
										className='text-pink_primary flex cursor-pointer items-center gap-1 text-xs font-medium'
										target='_blank'
									>
										Treasury
									</Link>
									{/* <Image
										alt='relay icon'
										width={16}
										height={16}
										src='/assets/treasury/dot-icon.svg'
										className='-mt-[2px]'
									/> */}
									<span className='font-medium'>1.96M </span>
									{unit}
								</div>

								<div className='ml-1 flex items-center gap-[6px] text-sm'>
									<Link
										href='https://assethub-polkadot.subscan.io/account/13w7NdvSR1Af8xsQTArDtZmVvjE8XhWNdL4yed3iFHrUNCnS'
										className='text-pink_primary flex cursor-pointer items-center gap-1 text-xs font-medium'
										target='_blank'
									>
										Salary{' '}
										<Image
											alt='relay icon'
											width={16}
											height={16}
											src={RedirectingIcon}
											className='-mt-[2px]'
										/>
									</Link>
									{/* <Image
										alt='relay icon'
										width={16}
										height={16}
										src='/assets/treasury/usdt-icon.svg'
										className='-mt-[2px]'
									/> */}
									<span className='font-medium'>2.33M USDt</span>
								</div>
							</div>
						</div>
					</div>

					<div className='text-blue-light-high dark:text-blue-dark-high mt-[6px] items-baseline gap-[6px] sm:flex'>
						<div className='flex w-[80px] gap-[6px]'>
							<span className='text-sm font-medium'>Loans</span>
						</div>
						<div className='flex flex-col'>
							<span className='ml-1 text-base font-semibold'>~ $16.89M</span>
							<div className='items-center gap-1 md:flex'>
								<div className='ml-1 flex items-center gap-[6px] text-sm'>
									<Link
										href='https://polkadot.polkassembly.io/referenda/432'
										className='text-pink_primary flex cursor-pointer items-center gap-1 text-xs font-medium'
										target='_blank'
									>
										Bifrost{' '}
										<Image
											alt='relay icon'
											width={16}
											height={16}
											src={RedirectingIcon}
											className='-mt-[2px]'
										/>
									</Link>
									{/* <Image
										alt='relay icon'
										width={16}
										height={16}
										src='/assets/treasury/dot-icon.svg'
										className='-mt-[2px]'
									/> */}
									<span className='font-medium'>500.0K</span>
									{unit}
								</div>
								<div className='ml-1 flex items-center gap-[6px] text-sm'>
									<Link
										href='https://polkadot.polkassembly.io/referenda/748'
										className='text-pink_primary flex cursor-pointer items-center gap-1 text-xs font-medium'
										target='_blank'
									>
										Pendulum{' '}
										<Image
											alt='relay icon'
											width={16}
											height={16}
											src={RedirectingIcon}
											className='-mt-[2px]'
										/>
									</Link>
									{/* <Image
										alt='relay icon'
										width={16}
										height={16}
										src='/assets/treasury/dot-icon.svg'
										className='-mt-[2px]'
									/> */}
									<span className='font-medium'>50.0K</span>
									{unit}
								</div>

								<div className='ml-1 flex items-center gap-[6px] text-sm'>
									<Link
										href='https://polkadot.polkassembly.io/referenda/560'
										className='text-pink_primary flex cursor-pointer items-center gap-1 text-xs font-medium'
										target='_blank'
									>
										Hydration{' '}
										<Image
											alt='relay icon'
											width={16}
											height={16}
											src={RedirectingIcon}
											className='-mt-[2px]'
										/>
									</Link>

									<span className='font-medium'>1M </span>
									{unit}
								</div>

								<div className='ml-1 flex items-center gap-[6px] text-sm'>
									<Link
										href='https://polkadot.polkassembly.io/referenda/1122'
										className='text-pink_primary flex cursor-pointer items-center gap-1 text-xs font-medium'
										target='_blank'
									>
										Centrifuge{' '}
										<Image
											alt='relay icon'
											width={16}
											height={16}
											src={RedirectingIcon}
											className='-mt-[2px]'
										/>
									</Link>
									{/* <Image
										alt='relay icon'
										width={16}
										height={16}
										src='/assets/treasury/usdc-icon.svg'
										className='-mt-[2px]'
									/> */}
									<span className='font-medium'>3M USDC</span>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</Modal>
	);
}

export default TreasuryDetailsModal;
