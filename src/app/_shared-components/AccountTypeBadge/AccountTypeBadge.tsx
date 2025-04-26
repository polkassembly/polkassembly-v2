// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { EAccountType } from '@/_shared/types';

const colourMap: Record<EAccountType, string> = {
	[EAccountType.PROXY]: 'indigo',
	[EAccountType.MULTISIG]: 'green',
	[EAccountType.REGULAR]: 'blue'
};

function AccountTypeBadge({ accountType }: { accountType: EAccountType }) {
	if (!accountType || accountType === EAccountType.REGULAR) return null; // no need to show badge for regular accounts
	return (
		<span
			className={`inline-flex items-center rounded-md capitalize bg-${colourMap[accountType as EAccountType]}-50 px-2 py-1 text-xs font-medium text-${colourMap[accountType as EAccountType]}-700 ring-1 ring-inset ring-${colourMap[accountType as EAccountType]}-700/10`}
		>
			{accountType}
		</span>
	);
}

export default AccountTypeBadge;
