// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
export const getOGTrackerTrackName = (trackName?: string): string => {
	if (!trackName) return '';
	switch (trackName) {
		case 'Root':
			return 'root';
		case 'Whitelisted Caller':
			return 'whitelistedCaller';
		case 'Staking Admin':
			return 'stakingAdmin';
		case 'Treasurer':
			return 'treasurer';
		case 'Lease Admin':
			return 'leaseAdmin';
		case 'Fellowship Admin':
			return 'fellowshipAdmin';
		case 'General Admin':
			return 'generalAdmin';
		case 'Auction Admin':
			return 'auctionAdmin';
		case 'Referendum Killer':
			return 'referendumKiller';
		case 'Referendum Canceller':
			return 'referendumCanceller';
		case 'Big Tipper':
			return 'bigTipper';
		case 'Big Spender':
			return 'bigSpender';
		case 'Medium Spender':
			return 'mediumSpender';
		case 'Small Spender':
			return 'smallSpender';
		case 'Small Tipper':
			return 'smallTipper';
		default:
			return trackName.replace(/ ([a-zA-Z])/g, (g) => g[1].toUpperCase()).replace(/^./, (g) => g.toLowerCase());
	}
};
