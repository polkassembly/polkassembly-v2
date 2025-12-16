// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

/**
 * Check if an index string is in composite format (parentBountyIndex_childBountyIndex)
 * @param {string} indexStr - The index string to check
 * @return {boolean} True if the string is in composite format
 */
export function isCompositeIndex(indexStr: string): boolean {
	if (!indexStr || typeof indexStr !== 'string') return false;
	const parts = indexStr.split('_');
	if (parts.length !== 2) return false;
	const [parentPart, childPart] = parts;
	return !isNaN(Number(parentPart)) && !isNaN(Number(childPart));
}

/**
 * Build a composite index string from parent and child bounty indices
 * @param {number} parentBountyIndex - The parent bounty index
 * @param {number} childBountyIndex - The child bounty index
 * @return {string} The composite index string in format "parentIndex_childIndex"
 */
export function buildCompositeIndex(parentBountyIndex: number, childBountyIndex: number): string {
	return `${parentBountyIndex}_${childBountyIndex}`;
}

/**
 * Parse a composite index string into its components
 * @param {string} compositeIndex - The composite index string to parse
 * @return {object|null} Object with parentBountyIndex and childBountyIndex, or null if invalid
 */
export function parseCompositeIndex(compositeIndex: string): { parentBountyIndex: number; childBountyIndex: number } | null {
	if (!isCompositeIndex(compositeIndex)) return null;
	const [parentPart, childPart] = compositeIndex.split('_');
	return {
		parentBountyIndex: Number(parentPart),
		childBountyIndex: Number(childPart)
	};
}

/**
 * Get child bounty index from a composite or regular index string
 * @param {string} indexStr - The index string (composite or numeric)
 * @return {number} The child bounty index
 */
export function getChildBountyIndex(indexStr: string): number {
	if (isCompositeIndex(indexStr)) {
		const parsed = parseCompositeIndex(indexStr);
		return parsed?.childBountyIndex ?? Number(indexStr);
	}
	return Number(indexStr);
}
