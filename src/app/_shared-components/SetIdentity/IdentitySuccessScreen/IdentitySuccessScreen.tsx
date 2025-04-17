// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { useTranslations } from 'next-intl';
import Address from '../../Profile/Address/Address';
import { Separator } from '../../Separator';
import { Button } from '../../Button';

function IdentitySuccessScreen({
	address,
	email,
	twitter,
	matrix,
	displayName,
	legalName,
	onNext
}: {
	address: string;
	email: string;
	twitter?: string;
	matrix?: string;
	displayName: string;
	legalName?: string;
	onNext: () => void;
}) {
	const t = useTranslations();
	return (
		<div className='flex w-full flex-col items-center gap-y-4'>
			<p className='text-xl font-semibold text-text_primary'>{t('SetIdentity.identitySuccess')}</p>
			<p className='text-xl font-semibold text-text_pink'>{displayName}</p>
			<div className='flex flex-col gap-y-2 text-sm font-medium text-wallet_btn_text'>
				<p className='flex items-center gap-x-8'>
					<span className='w-24 font-normal'>{t('SetIdentity.address')}:</span> <Address address={address} />
				</p>
				<p className='flex items-center gap-x-8'>
					<span className='w-24 font-normal'>{t('SetIdentity.displayName')}:</span> {displayName}
				</p>
				{legalName && (
					<p className='flex items-center gap-x-8'>
						<span className='w-24 font-normal'>{t('SetIdentity.legalName')}:</span> {legalName}
					</p>
				)}
				<p className='flex items-center gap-x-8'>
					<span className='w-24 font-normal'>{t('SetIdentity.email')}:</span> {email}
				</p>
				{twitter && (
					<p className='flex items-center gap-x-8'>
						<span className='w-24 font-normal'>{t('SetIdentity.twitter')}:</span> {twitter}
					</p>
				)}
				{matrix && (
					<p className='flex items-center gap-x-8'>
						<span className='w-24 font-normal'>{t('SetIdentity.riot')}:</span> {matrix}
					</p>
				)}
			</div>
			<Separator />
			<Button
				className='w-full'
				onClick={onNext}
			>
				{t('SetIdentity.successCta')}
			</Button>
		</div>
	);
}

export default IdentitySuccessScreen;
