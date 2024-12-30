// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { useAtom } from 'jotai';
import { userAtom } from '@/app/_atoms/user/userAtom';
import { useMemo } from 'react';

export const useUser = () => {
	const [user, setUser] = useAtom(userAtom);

	return useMemo(() => {
		return { user, setUser };
	}, [user, setUser]);
};
