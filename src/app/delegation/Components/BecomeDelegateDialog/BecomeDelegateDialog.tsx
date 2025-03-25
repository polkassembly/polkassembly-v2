// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { useTranslations } from 'next-intl';
import { Button } from '@/app/_shared-components/Button';
import { useUser } from '@/hooks/useUser';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@ui/Dialog/Dialog';
import AddressDropdown from '@/app/_shared-components/AddressDropdown/AddressDropdown';
import { Input } from '@/app/_shared-components/Input';

export default function BecomeDelegateDialog() {
	const { user } = useUser();
	const t = useTranslations('Delegation');

	return (
		<Dialog>
			<DialogTrigger asChild>
				<div>
					<Button
						disabled={!user}
						className={`${!user ? 'cursor-not-allowed opacity-50' : ''}`}
					>
						{t('becomeDelegate')}
					</Button>
				</div>
			</DialogTrigger>
			<DialogContent className='max-w-xl p-6'>
				<DialogHeader>
					<DialogTitle>{t('becomeDelegate')}</DialogTitle>
				</DialogHeader>
				<div className='flex flex-col gap-y-4'>
					<AddressDropdown withBalance />
					<div className='flex flex-col gap-y-2'>
						<p className='text-sm text-wallet_btn_text'>
							Your Delegation Mandate <span className='text-text_pink'>*</span>
						</p>
						<Input
							title='Your Delegation Mandate'
							placeholder='Add message for delegate address '
							className='w-full'
							required
						/>
					</div>
					<Button
						size='lg'
						className='w-full'
					>
						Confirm
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}
