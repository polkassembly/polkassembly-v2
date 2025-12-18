// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { useIsRegistrar } from '@/hooks/useIsRegistrar';
import LoaderGif from '@/app/_shared-components/LoaderGif/LoaderGif';
import RegistrarRequestsStats from './RegistrarRequestsStats';
import RegistrarRequestsTable from './RegistrarRequestsTable';

function RegistrarRequestsView() {
	const { data: isRegistrar, isLoading } = useIsRegistrar();

	if (isLoading) {
		return <LoaderGif />;
	}

	if (!isRegistrar) {
		return (
			<div className='flex h-64 items-center justify-center rounded-xl border border-primary_border bg-bg_modal'>
				<div className='text-center'>
					<p className='text-lg font-semibold text-text_primary'>Registrar Access Required</p>
					<p className='mt-2 text-sm text-basic_text'>Only registered registrars can view this page.</p>
				</div>
			</div>
		);
	}

	return (
		<div className='flex flex-col gap-y-4'>
			<RegistrarRequestsStats />
			<RegistrarRequestsTable />
		</div>
	);
}

export default RegistrarRequestsView;
