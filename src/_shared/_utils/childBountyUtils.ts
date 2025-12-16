// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

/**
 * Utility functions for handling child bounty composite index format.
 *
 * After the Polkadot ecosystem moved to per-parent indexing for child bounties,
 * we use a composite format to uniquely identify child bounties:
 * - Storage/URL format: "parentBountyIndex_childBountyIndex" (e.g., "43_199")
 * - Display format: "#parentBountyIndex-childBountyIndex" (e.g., "#43-199")
 *
 * This matches the format used by Subsquare: https://polkadot.subsquare.io/treasury/child-bounties
 */

export const COMPOSITE_INDEX_SEPARATOR = '_';
export const DISPLAY_INDEX_SEPARATOR = '-';

/**
 * Check if an index string is in composite format (contains separator)
 */
export function isCompositeIndex(indexOrHash: string): boolean {
	return indexOrHash.includes(COMPOSITE_INDEX_SEPARATOR);
}

/**
 * Parse a composite index string into its parts
 * @param compositeIndex - String in format "parentBountyIndex_childBountyIndex"
 * @returns Object with parentBountyIndex and childBountyIndex, or null if invalid
 */
export function parseCompositeIndex(compositeIndex: string): { parentBountyIndex: number; childBountyIndex: number } | null {
	if (!isCompositeIndex(compositeIndex)) {
		return null;
	}

	const parts = compositeIndex.split(COMPOSITE_INDEX_SEPARATOR);
	if (parts.length !== 2) {
		return null;
	}

	const parentBountyIndex = Number(parts[0]);
	const childBountyIndex = Number(parts[1]);

	if (Number.isNaN(parentBountyIndex) || Number.isNaN(childBountyIndex)) {
		return null;
	}

	return { parentBountyIndex, childBountyIndex };
}

/**
 * Build a composite index string from parent and child indices
 * @param parentBountyIndex - Parent bounty index
 * @param childBountyIndex - Child bounty index (per-parent)
 * @returns Composite index string (e.g., "43_199")
 */
export function buildCompositeIndex(parentBountyIndex: number, childBountyIndex: number): string {
	return `${parentBountyIndex}${COMPOSITE_INDEX_SEPARATOR}${childBountyIndex}`;
}

/**
 * Get the child bounty index from a composite or simple index string
 * @param indexOrHash - Either a composite index ("43_199") or simple index ("199")
 * @returns The child bounty index number
 */
export function getChildBountyIndex(indexOrHash: string): number {
	const parsed = parseCompositeIndex(indexOrHash);
	if (parsed) {
		return parsed.childBountyIndex;
	}
	return Number(indexOrHash);
}

/**
 * Format an index for display (e.g., "43_199" -> "43-199" or just "199")
 * @param indexOrHash - The index string (composite or simple)
 * @param includeParent - If true and composite, returns "parent-child"; if false, returns just "child"
 * @returns Formatted display string
 */
export function formatChildBountyDisplayIndex(indexOrHash: string | number, includeParent = true): string {
	const indexStr = String(indexOrHash);
	const parsed = parseCompositeIndex(indexStr);

	if (parsed && includeParent) {
		return `${parsed.parentBountyIndex}${DISPLAY_INDEX_SEPARATOR}${parsed.childBountyIndex}`;
	}

	if (parsed) {
		return String(parsed.childBountyIndex);
	}

	return indexStr;
}

/**
 * Build display index from parent and child indices
 * @param parentBountyIndex - Parent bounty index
 * @param childBountyIndex - Child bounty index
 * @returns Display format string (e.g., "43-199")
 */
export function buildDisplayIndex(parentBountyIndex: number, childBountyIndex: number): string {
	return `${parentBountyIndex}${DISPLAY_INDEX_SEPARATOR}${childBountyIndex}`;
}
