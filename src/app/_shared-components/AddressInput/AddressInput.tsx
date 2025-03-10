// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { useState, useRef, useEffect } from 'react';
import { useWalletService } from '@/hooks/useWalletService';
import { InjectedAccount } from '@polkadot/extension-inject/types';
import { EWallet } from '@/_shared/types';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { Input } from '../Input';
import Address from '../Profile/Address/Address';

interface AddressInputProps {
	placeholder?: string;
	onChange?: (value: string) => void;
	className?: string;
}

export default function AddressInput({ placeholder = 'Search...', onChange, className }: AddressInputProps) {
	const [isOpen, setIsOpen] = useState(false);
	const [searchValue, setSearchValue] = useState('');
	const inputRef = useRef<HTMLInputElement>(null);
	const dropdownRef = useRef<HTMLDivElement>(null);

	const { userPreferences, setUserPreferences } = useUserPreferences();
	const walletService = useWalletService();
	const [accounts, setAccounts] = useState<InjectedAccount[]>([]);

	const getAccounts = async (chosenWallet: EWallet): Promise<undefined> => {
		if (!walletService) return;
		const injectedAccounts = await walletService?.getAddressesFromWallet(chosenWallet);

		if (injectedAccounts.length === 0) {
			return;
		}

		setAccounts(injectedAccounts);
		setUserPreferences({
			...userPreferences,
			address: injectedAccounts[0]
		});
	};

	useEffect(() => {
		if (userPreferences?.wallet) getAccounts(userPreferences.wallet);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [userPreferences?.wallet, walletService]);

	const onAccountChange = (a: InjectedAccount) => {
		setUserPreferences({ ...userPreferences, address: a });
		setSearchValue(a.address);
		setIsOpen(false);
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
			<Input
				ref={inputRef}
				type='text'
				value={searchValue}
				onChange={(e) => {
					setSearchValue(e.target.value);
					setIsOpen(true);
				}}
				onClick={() => setIsOpen(true)}
				onFocus={() => setIsOpen(true)}
				placeholder={placeholder}
				className={`w-full rounded-md border border-border_grey p-2 outline-none ${className}`}
			/>

			{isOpen && (
				<div className='absolute z-10 mt-1 flex max-h-[300px] w-full flex-col gap-y-2 overflow-y-auto rounded-md border border-border_grey bg-white p-2 shadow-lg'>
					{filteredOptions.length > 0 ? (
						filteredOptions.map((account) => (
							<button
								key={account.address}
								className='cursor-pointer p-2 hover:bg-gray-100'
								onClick={() => onAccountChange(account)}
								type='button'
							>
								<Address
									address={account.address}
									walletAddressName={account.name}
									redirectToProfile={false}
								/>
							</button>
						))
					) : (
						<div className='p-2 text-gray-500'>No results found</div>
					)}
				</div>
			)}
		</div>
	);
}
