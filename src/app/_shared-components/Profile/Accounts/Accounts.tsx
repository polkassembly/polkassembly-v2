// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Separator } from '@/app/_shared-components/Separator';
import React from 'react';
import { useTranslations } from 'next-intl';
import Account from './Account/Account';
import classes from './Accounts.module.scss';

function Accounts({ addresses }: { addresses: string[] }) {
	const t = useTranslations();
	return (
		<div className={classes.accountsWrapper}>
			<div className={classes.accountsHeader}>
				<p className={classes.accountsHeaderText}>{t('Profile.accounts')}</p>
			</div>
			<Separator className='mb-4' />
			<div className={classes.accountsList}>
				{addresses.length > 0 &&
					addresses.map((address) => (
						<Account
							key={address}
							address={address}
						/>
					))}
			</div>
		</div>
	);
}

export default Accounts;
