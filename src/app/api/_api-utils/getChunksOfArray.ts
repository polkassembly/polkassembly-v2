// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

const getChunksOfArray = ({ array, chunkSize }: { array: unknown[]; chunkSize: number }): unknown[][] => {
	const chunkedArray = [];
	for (let i = 0; i < array.length; i += chunkSize) {
		chunkedArray.push(array.slice(i, i + chunkSize));
	}
	return chunkedArray;
};

export { getChunksOfArray };
