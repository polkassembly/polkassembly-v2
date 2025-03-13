// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { useCallback, useState } from 'react';
import { dayjs } from '@/_shared/_utils/dayjsInit';

interface DateRange {
	label: string;
	start: number;
	end: number;
}

export const useFilters = (refresh: () => void) => {
	const [selectedDateRange, setSelectedDateRange] = useState<DateRange | null>(null);
	const [openDropdown, setOpenDropdown] = useState<string | null>(null);

	const getDateRange = useCallback((label: string): DateRange | null => {
		const now = dayjs.utc();
		const ranges: Record<string, DateRange> = {
			Today: {
				label,
				start: now.startOf('day').unix(),
				end: now.endOf('day').unix()
			},
			'Last 7 days': {
				label,
				start: now.subtract(7, 'days').startOf('day').unix(),
				end: now.endOf('day').unix()
			},
			'Last 30 days': {
				label,
				start: now.subtract(30, 'days').startOf('day').unix(),
				end: now.endOf('day').unix()
			},
			'Last 3 months': {
				label,
				start: now.subtract(3, 'months').startOf('day').unix(),
				end: now.endOf('day').unix()
			},
			'All time': {
				label,
				start: dayjs.utc('2020-01-01').startOf('day').unix(),
				end: now.endOf('day').unix()
			}
		};
		return ranges[label] || null;
	}, []);

	const handleDateSelection = useCallback(
		(range: DateRange | null) => {
			setSelectedDateRange(range);
			refresh();
		},
		[refresh]
	);

	const clearDateFilter = useCallback(() => {
		setSelectedDateRange(null);
		refresh();
	}, [refresh]);

	const handleDropdownOpen = useCallback((dropdown: string | null) => {
		setOpenDropdown(dropdown);
	}, []);

	return {
		selectedDateRange,
		openDropdown,
		handleDateSelection,
		clearDateFilter,
		handleDropdownOpen,
		getDateRange
	};
};
