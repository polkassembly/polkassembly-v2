// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { useTranslations } from 'next-intl';
import { memo, useState } from 'react';
import Address from '@/app/_shared-components/Profile/Address/Address';
import { IoPersonAdd } from 'react-icons/io5';
import { EDelegateSource, ENetwork, IDelegateDetails } from '@/_shared/types';
import { parseBalance } from '@/app/_client-utils/parseBalance';
import { NETWORKS_DETAILS } from '@/_shared/_constants/networks';
import { MarkdownEditor } from '@/app/_shared-components/MarkdownEditor/MarkdownEditor';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogFooter, DialogDescription } from '@ui/Dialog/Dialog';
import { Button } from '@/app/_shared-components/Button';
import AddressInput from '@/app/_shared-components/AddressInput/AddressInput';
import { useUser } from '@/hooks/useUser';
import { Label } from '@/app/_shared-components/Label';
import BalanceInput from '@/app/_shared-components/BalanceInput/BalanceInput';
import { Separator } from '@/app/_shared-components/Separator';
import PlatformLogos from '../PlatformLogos/PlatformLogos';

interface GroupedDelegateDetails extends Omit<IDelegateDetails, 'source'> {
	sources: EDelegateSource[];
}

interface DelegateCardProps {
	delegate: GroupedDelegateDetails;
	network: ENetwork;
}

const DEFAULT_PLATFORM_STYLE = 'border-navbar_border bg-delegation_card_polkassembly';

const getPlatformStyles = (platforms: EDelegateSource[]) => {
	if (!Array.isArray(platforms) || platforms.length === 0) {
		return DEFAULT_PLATFORM_STYLE;
	}

	if (platforms.length > 1) {
		return 'border-wallet_btn_text bg-delegation_bgcard';
	}

	const platform = String(platforms[0]).toLowerCase();
	switch (platform) {
		case 'polkassembly':
			return DEFAULT_PLATFORM_STYLE;
		case 'parity':
			return 'border-delegation_polkadot_border bg-delegation_card_polkadot';
		case 'w3f':
			return 'border-btn_secondary_text text-btn_primary_text bg-delegation_card_w3f';
		case 'nova':
			return 'border-delegation_nova_border bg-delegation_card_nova';
		case 'individual':
		case 'na':
			return 'border-btn_secondary_text bg-delegation_card_polkassembly';
		default:
			return 'border-wallet_btn_text bg-delegation_bgcard';
	}
};

const DelegateCard = memo(({ delegate, network }: DelegateCardProps) => {
	const t = useTranslations('Delegation');
	const [open, setOpen] = useState(false);
	const { user } = useUser();

	return (
		<div className='cursor-pointer rounded-md border border-border_grey hover:border-bg_pink'>
			<div className={`flex gap-2 rounded-t border py-1 ${getPlatformStyles(delegate.sources)}`}>
				<PlatformLogos platforms={delegate.sources} />
			</div>
			<div className='p-4'>
				<div className='flex items-center justify-between gap-2'>
					<Address address={delegate.address} />
					<Dialog
						open={open}
						onOpenChange={setOpen}
					>
						<DialogTrigger asChild>
							<div className='flex cursor-pointer items-center gap-1 text-text_pink'>
								<IoPersonAdd />
								<span>{t('delegate')}</span>
							</div>
						</DialogTrigger>
						<DialogContent className='max-w-2xl p-6'>
							<DialogHeader>
								<div className='flex items-center gap-2 text-btn_secondary_text'>
									<IoPersonAdd />
									<span>{t('delegate')}</span>
								</div>
							</DialogHeader>
							<DialogDescription>
								<div className='flex flex-col gap-4'>
									<Label>Your Address</Label>
									<AddressInput
										disabled
										className='bg-network_dropdown_bg'
										placeholder={user?.defaultAddress}
									/>
									<Label>Delegate To</Label>
									<AddressInput value={delegate.address} />
									<BalanceInput
										showBalance
										label='Balance'
									/>
								</div>
							</DialogDescription>
							<Separator
								className='mt-5 w-full'
								orientation='horizontal'
							/>
							<DialogFooter>
								<Button
									variant='secondary'
									className='btn-cancel'
									onClick={() => setOpen(false)}
								>
									Cancel
								</Button>
								<Button className='btn-delegate'>Delegate</Button>
							</DialogFooter>
						</DialogContent>
					</Dialog>
				</div>
			</div>
			<div className='h-24 px-5'>
				<div className='text-sm text-text_primary'>
					{delegate?.manifesto && delegate?.manifesto.length > 0 ? (
						delegate?.manifesto?.includes('<') ? (
							<div className='bio-content'>
								<div className='flex max-h-40 w-full overflow-hidden border-none'>
									<MarkdownEditor
										markdown={delegate.manifesto}
										readOnly
									/>
								</div>
								{delegate?.manifesto?.length > 100 && (
									<button
										className='cursor-pointer text-xs font-medium text-blue-600'
										type='button'
									>
										{t('readMore')}
									</button>
								)}
							</div>
						) : (
							<div className='bio-content'>
								<span>{delegate?.manifesto?.slice(0, 100)}</span>
								{delegate?.manifesto?.length > 100 && (
									<>
										<span>... </span>
										<button
											className='cursor-pointer text-xs font-medium text-blue-600'
											type='button'
										>
											{t('readMore')}
										</button>
									</>
								)}
							</div>
						)
					) : (
						<span>{t('noBio')}</span>
					)}
				</div>
			</div>
			<div className='grid grid-cols-3 items-center border-t border-border_grey'>
				<div className='border-r border-border_grey p-5 text-center'>
					<div>
						<div className='text-sm text-btn_secondary_text'>
							<span className='text-2xl font-semibold'> {parseBalance(delegate?.votingPower?.toString() || '0', 1, false, network)}</span>{' '}
							{NETWORKS_DETAILS[network as ENetwork].tokenSymbol}
						</div>
						<span className='text-xs text-delegation_card_text'>{t('votingPower')}</span>
					</div>
				</div>
				<div className='border-r border-border_grey p-3 text-center'>
					<div>
						<div className='text-2xl font-semibold'>{delegate?.last30DaysVotedProposalsCount}</div>
						<span className='text-xs text-delegation_card_text'>{t('votedProposals')}</span>
						<span className='block text-[10px] text-delegation_card_text'>({t('past30Days')})</span>
					</div>
				</div>
				<div className='p-5 text-center'>
					<div>
						<div className='text-2xl font-semibold'>{delegate?.receivedDelegationsCount}</div>
						<span className='text-xs text-delegation_card_text lg:whitespace-nowrap'>{t('receivedDelegations')}</span>
					</div>
				</div>
			</div>
		</div>
	);
});

export default DelegateCard;
