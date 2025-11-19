// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { useTranslations } from 'next-intl';
import { ShieldAlert } from 'lucide-react';
import { Alert, AlertDescription } from '../Alert';
import classes from './UserBlacklistWarning.module.scss';

function UserBlacklistWarning() {
	const t = useTranslations();

	return (
		<Alert
			variant='destructive'
			className={classes.warningAlert}
		>
			<AlertDescription className={classes.warningDescription}>
				<ShieldAlert className='h-4 w-4 flex-shrink-0' />
				<span>
					{t('Profile.blacklistWarning', {
						defaultMessage: 'This user account has been flagged for violating community guidelines.'
					})}
				</span>
			</AlertDescription>
		</Alert>
	);
}

export default UserBlacklistWarning;
