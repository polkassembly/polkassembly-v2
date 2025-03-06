// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import Address from '@ui/Profile/Address/Address';
import { IoMdTrendingUp } from 'react-icons/io';
import { IoPersonAdd } from 'react-icons/io5';
import { ENetwork, IDelegate } from '@/_shared/types';
import { NETWORKS_DETAILS } from '@/_shared/_constants/networks';
import BlockEditor from '@/app/_shared-components/BlockEditor/BlockEditor';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { formatUSDWithUnits } from '@/app/_client-utils/formatUSDWithUnits';
import { formatBalance } from '@polkadot/util';
import PlatformLogos, { getPlatformStyles } from './PlatformLogos';

function DelegationCard({ delegates }: { delegates: IDelegate[] }) {
	const network = getCurrentNetwork();
	const parseBalance = (balance: string, decimals: number, withUnit: boolean, network: ENetwork) => {
		let readableBalance = formatUSDWithUnits(
			parseFloat(
				formatBalance(balance, {
					decimals: NETWORKS_DETAILS[network as ENetwork]?.tokenDecimals,
					forceUnit: NETWORKS_DETAILS[network as ENetwork]?.tokenSymbol,
					withAll: false,
					withUnit: false,
					withZero: false
				}).replaceAll(',', '')
			)
				.toFixed(2)
				.toString(),
			decimals
		);
		if (withUnit) {
			readableBalance = `${readableBalance} ${NETWORKS_DETAILS[network as ENetwork]?.tokenSymbol}`;
		}
		return readableBalance;
	};
	return (
		<div className='mt-5 rounded-lg bg-bg_modal p-4 shadow-lg'>
			<div className='flex items-center gap-2'>
				<IoMdTrendingUp className='text-xl font-bold text-bg_pink' />
				<p className='text-xl font-semibold text-btn_secondary_text'>Trending Delegates</p>
			</div>
			<div className='my-5 grid w-full items-center gap-5 lg:grid-cols-2'>
				{delegates.map((delegate) => (
					<div
						key={delegate.address}
						className='cursor-pointer rounded-md border border-border_grey hover:border-bg_pink'
					>
						<div className={`flex gap-2 rounded-t border py-1 ${getPlatformStyles(delegate.dataSource)}`}>
							<PlatformLogos platforms={delegate.dataSource} />
						</div>
						<div className='p-4'>
							<div className='flex items-center justify-between gap-2'>
								<Address address={delegate.address} />
								<div className='flex items-center gap-1 text-text_pink'>
									<IoPersonAdd />
									<p>Delegate</p>
								</div>
							</div>
							<div className='h-24 px-5'>
								<p className='text-sm text-text_primary'>
									{delegate.bio.length > 0 ? (
										delegate.bio.includes('<') ? (
											<>
												<BlockEditor
													data={delegate.bio}
													readOnly
													id={`delegate-bio-${delegate.address}`}
													className='text-sm text-text_primary'
												/>
												{delegate.bio.length > 100 && <p className='cursor-pointer text-xs font-medium text-blue-600'>Read more</p>}
											</>
										) : (
											<>
												{delegate.bio.slice(0, 100)}
												{delegate.bio.length > 100 && (
													<>
														... <p className='cursor-pointer text-xs font-medium text-blue-600'>Read more</p>
													</>
												)}
											</>
										)
									) : (
										<p className='text-sm text-text_primary'>No Bio</p>
									)}
								</p>
							</div>
						</div>
						<div className='grid grid-cols-3 items-center border-t border-border_grey'>
							<div className='border-r border-border_grey p-5 text-center'>
								<div>
									<p className='text-sm text-btn_secondary_text'>
										<span className='text-2xl font-semibold'> {parseBalance(delegate?.delegatedBalance.toString(), 1, false, network)}</span>{' '}
										{NETWORKS_DETAILS[network as ENetwork].tokenSymbol}
									</p>
									<p className='text-xs text-delegation_card_text'>Voting power</p>
								</div>
							</div>
							<div className='border-r border-border_grey p-3 text-center'>
								<div>
									<p className='text-2xl font-semibold'>{delegate?.votedProposalCount?.convictionVotesConnection?.totalCount}</p>
									<p className='text-xs text-delegation_card_text'>Voted proposals </p>
									<p className='text-[10px] text-delegation_card_text'>(Past 30 Days)</p>
								</div>
							</div>
							<div className='p-5 text-center'>
								<div>
									<p className='text-2xl font-semibold'>{delegate?.receivedDelegationsCount}</p>
									<p className='text-xs text-delegation_card_text lg:whitespace-nowrap'>Received Delegation</p>
								</div>
							</div>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}

export default DelegationCard;
