// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { IAccessTokenPayload } from '@/_shared/types';
import { useEffect } from 'react';
import { useUser } from '../_atoms/user/userAtom';

function Initializers({ userData }: { userData: IAccessTokenPayload | null }) {
	const [, setUser] = useUser();
	useEffect(() => {
		if (!userData) return;

		setUser(userData);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [userData]);
	return null;
}

export default Initializers;
