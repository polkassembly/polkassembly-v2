// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { redirectFromServer } from '@/app/_client-utils/redirectFromServer';
import { ReactNode } from 'react';

function RedirectFromServer({ url, children }: { url: string; children: ReactNode }) {
	return (
		<form action={() => redirectFromServer(url)}>
			<button
				className='w-full'
				type='submit'
			>
				{children}
			</button>
		</form>
	);
}

export default RedirectFromServer;
