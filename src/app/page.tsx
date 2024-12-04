// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Button } from '@ui/Button';
import Dashboard from './_shared-components/AppLayout/Dashboard/page';

export default function Home() {
	return (
		<Dashboard>
			<div className='text-center'>
				Polkassembly <Button variant='secondary'>hello</Button>{' '}
			</div>
		</Dashboard>
	);
}
