// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * A hook that provides debounced functionality for values and functions
 * @param value The value to debounce
 * @param delay The delay in milliseconds (default: 500ms)
 * @returns An object containing the debounced value and a setter function
 */
export function useDebounce<T>(initialValue: T, delay = 500) {
	const [value, setValue] = useState<T>(initialValue);
	const [debouncedValue, setDebouncedValue] = useState<T>(initialValue);
	const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	// Clear the timeout when the component unmounts or when delay changes
	useEffect(() => {
		return () => {
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
			}
		};
	}, [delay]);

	// The debounced setter function
	const onChange = useCallback(
		(newValue: T | ((prevValue: T) => T)) => {
			// Clear any existing timeout
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
			}

			// Update the immediate value
			setValue(typeof newValue === 'function' ? (newValue as (prevValue: T) => T) : newValue);

			// Set a new timeout to update the debounced value
			timeoutRef.current = setTimeout(() => {
				setDebouncedValue(typeof newValue === 'function' ? (newValue as (prevValue: T) => T) : newValue);
			}, delay);
		},
		[delay]
	);

	return {
		value,
		debouncedValue,
		setValue: onChange
	};
}
