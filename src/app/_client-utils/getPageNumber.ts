// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

export const getPageNumbers = (totalPages: number, currentPage: number) => {
	const pageNumbers = [];
	const maxVisiblePages = 5;
	let startPage: number;
	let endPage: number;

	if (totalPages <= maxVisiblePages) {
		startPage = 1;
		endPage = totalPages;
	} else if (currentPage <= 3) {
		startPage = 1;
		endPage = 5;
	} else if (currentPage + 2 >= totalPages) {
		startPage = totalPages - 4;
		endPage = totalPages;
	} else {
		startPage = currentPage - 2;
		endPage = currentPage + 2;
	}

	for (let i = startPage; i <= endPage; i += 1) {
		pageNumbers.push(i);
	}

	return pageNumbers;
};
