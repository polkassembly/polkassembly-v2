// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Creates a debounced function that delays invoking func until after wait milliseconds
 * have elapsed since the last time the debounced function was invoked.
 */
export function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void {
	let timeoutId: ReturnType<typeof setTimeout> | null = null;

	return function debounced(...args: Parameters<T>) {
		if (timeoutId) {
			clearTimeout(timeoutId);
		}

		timeoutId = setTimeout(() => {
			func(...args);
		}, wait);
	};
}

/**
 * Creates a throttled function that only invokes func at most once per every wait milliseconds.
 * The throttled function will invoke func on the leading edge and trailing edge of the wait timeout.
 */
export function throttle<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void {
	let inThrottle = false;
	let lastArgs: Parameters<T> | null = null;

	return function throttled(...args: Parameters<T>) {
		if (!inThrottle) {
			func(...args);
			inThrottle = true;

			setTimeout(() => {
				inThrottle = false;
				if (lastArgs) {
					func(...lastArgs);
					lastArgs = null;
				}
			}, wait);
		} else {
			lastArgs = args;
		}
	};
}
