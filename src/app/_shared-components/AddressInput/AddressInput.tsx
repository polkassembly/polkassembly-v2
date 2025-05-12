// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { useState, useRef, useEffect } from 'react';
import { useWalletService } from '@/hooks/useWalletService';
import { InjectedAccount } from '@polkadot/extension-inject/types';
import { EWallet } from '@/_shared/types';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { getSubstrateAddress } from '@/_shared/_utils/getSubstrateAddress';
import { X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Input } from '../Input';
import Address from '../Profile/Address/Address';
import { Button } from '../Button';

interface AddressInputProps {
	placeholder?: string;
	onChange?: (value: string) => void;
	className?: string;
	disabled?: boolean;
	value?: string;
}

export default function AddressInput({ placeholder, onChange, className, disabled, value }: AddressInputProps) {
	const t = useTranslations();
	const [isOpen, setIsOpen] = useState(false);
	const [searchValue, setSearchValue] = useState(value || '');
	const inputRef = useRef<HTMLInputElement>(null);
	const dropdownRef = useRef<HTMLDivElement>(null);
	const [error, setError] = useState('');

	const { userPreferences } = useUserPreferences();
	const walletService = useWalletService();
	const [accounts, setAccounts] = useState<InjectedAccount[]>([]);

	const getAccounts = async (chosenWallet: EWallet): Promise<undefined> => {
		if (!walletService) return;
		const injectedAccounts = await walletService?.getAddressesFromWallet(chosenWallet);

		if (injectedAccounts.length === 0) {
			return;
		}

		setAccounts(injectedAccounts);
	};

	useEffect(() => {
		if (userPreferences?.wallet) getAccounts(userPreferences.wallet);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [userPreferences?.wallet, walletService]);

	const onAccountChange = (a: InjectedAccount) => {
		setSearchValue(a.address);

		if (!getSubstrateAddress(a.address)) {
			setError(t('AddressInput.invalidAddress'));
			onChange?.('');
			return;
		}

		setError('');
		onChange?.(a.address);
	};

	const filteredOptions = accounts.filter((account) => account.address.toLowerCase().includes(searchValue.toLowerCase()));

	// Handle click outside to close dropdown
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) && !inputRef.current?.contains(event.target as Node)) {
				setIsOpen(false);
			}
		};

		document.addEventListener('mousedown', handleClickOutside);
		return () => document.removeEventListener('mousedown', handleClickOutside);
	}, []);

	return (
		<div
			className='relative w-full'
			ref={dropdownRef}
		>
			{getSubstrateAddress(searchValue) ? (
				<div className='flex w-full items-center justify-between gap-x-2 rounded-xl border border-border_grey bg-address_input_bg px-4 py-3'>
					<Address
						address={searchValue}
						walletAddressName=''
						redirectToProfile={false}
						iconSize={20}
						disableTooltip
					/>
					<Button
						onClick={() => {
							onAccountChange({ address: '', name: '' });
						}}
						variant='ghost'
						size='icon'
					>
						<X className='h-4 w-4' />
					</Button>
				</div>
			) : (
				<Input
					ref={inputRef}
					type='text'
					disabled={disabled}
					value={searchValue}
					onChange={(e) => {
						onAccountChange({ address: e.target.value, name: '' });
						setIsOpen(true);
					}}
					onClick={() => setIsOpen(true)}
					onFocus={() => setIsOpen(true)}
					placeholder={placeholder || t('AddressInput.placeholder')}
					className={`w-full rounded-xl bg-address_input_bg placeholder:text-sm placeholder:font-medium placeholder:text-text_primary ${className}`}
				/>
			)}
			{error && <p className='my-1 text-sm text-failure'>{error}</p>}
			{isOpen && (
				<div className='absolute z-50 mt-1 flex max-h-[300px] w-full flex-col gap-y-2 overflow-y-auto rounded-xl border border-border_grey bg-bg_modal px-4 py-3 shadow-lg'>
					{filteredOptions.length > 0 ? (
						filteredOptions.map((account) => (
							<button
								key={account.address}
								className='cursor-pointer rounded-lg p-2 hover:bg-border_grey'
								onClick={() => {
									onAccountChange(account);
									setIsOpen(false);
								}}
								type='button'
							>
								<Address
									address={account.address}
									walletAddressName={account.name}
									redirectToProfile={false}
									disableTooltip
								/>
							</button>
						))
					) : (
						<div className='p-2 text-gray-500'>{t('AddressInput.noResultsFound')}</div>
					)}
				</div>
			)}
		</div>
	);
}
