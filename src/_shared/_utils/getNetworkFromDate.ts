// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

export function getNetworkFromDate(dateString: string): 'kusama' | 'polkadot' | null {
	try {
		const match = dateString.match(/^(\d{1,2})\s+(\w{3})\s+(\d{2,4})$/);
		const parsedDate = match ? new Date(`${match[2]} ${match[1]}, 20${match[3].slice(-2)}`) : new Date(dateString);

		if (isNaN(parsedDate.getTime())) {
			console.warn(`Invalid date: ${dateString}`);
			return null;
		}

		const day = parsedDate.getUTCDay();

		if (day === 1) return 'kusama';
		if (day === 4) return 'polkadot';

		return null;
	} catch (err) {
		console.error('Error parsing date:', dateString, err);
		return null;
	}
}
