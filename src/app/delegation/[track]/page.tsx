// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import DelegationTrack from './Component/DelegationTrack';

async function DelegationTrackPage({ params }: { params: Promise<{ track: string }> }) {
	const { track } = await params;
	const trackName = track.charAt(0).toUpperCase() + track.slice(1).replace(/-/g, ' ');
	return (
		<div className='grid grid-cols-1 gap-5 p-5 sm:p-10'>
			<DelegationTrack trackName={trackName} />
		</div>
	);
}

export default DelegationTrackPage;
