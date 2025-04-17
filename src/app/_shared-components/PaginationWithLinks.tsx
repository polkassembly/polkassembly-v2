// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { type ReactNode, useState, useEffect, MouseEvent, useMemo } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from './Pagination';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './Select/Select';

export interface PaginationWithLinksProps {
	pageSizeSelectOptions?: {
		pageSizeSearchParam?: string;
		pageSizeOptions: number[];
	};
	totalCount: number;
	pageSize: number;
	page?: number;
	pageSearchParam?: string;
	onPageChange?: (page: number) => void;
}

/**
 * Navigate with Nextjs links (need to update your own `pagination.tsx` to use Nextjs Link)
 * Can also be used with a callback function for state-based pagination
 *
 * @example
 * ```
 * <PaginationWithLinks
    pageSize={20}
    totalCount={500}
    // For URL-based navigation:
    pageSearchParam="page"
    // OR for state-based pagination:
    onPageChange={(page) => setPage(page)}
  />
 * ```
 */

function SelectRowsPerPage({
	options,
	pageSize,
	pathname,
	searchParams,
	pageSearchParam,
	pageSizeSearchParam,
	onPageSizeChange
}: {
	options: number[];
	pageSize: number;
	pathname: string;
	searchParams: URLSearchParams;
	pageSearchParam?: string;
	pageSizeSearchParam?: string;
	onPageSizeChange?: (size: number) => void;
}) {
	const buildLink = (newPageSize: number) => {
		const key = pageSizeSearchParam || 'pageSize';
		const newSearchParams = new URLSearchParams(searchParams.toString());
		newSearchParams.set(key, String(newPageSize));
		newSearchParams.delete(pageSearchParam || 'page');
		return `${pathname}?${newSearchParams.toString()}`;
	};

	const handlePageSizeChange = (newPageSize: number) => {
		if (onPageSizeChange) {
			onPageSizeChange(newPageSize);
			return;
		}

		const link = document.createElement('a');
		link.href = buildLink(newPageSize);
		link.setAttribute('data-next-page-size', String(newPageSize));
		link.click();
	};

	return (
		<div className='flex items-center gap-4'>
			<span className='whitespace-nowrap text-sm'>Rows per page</span>

			<Select
				value={String(pageSize)}
				onValueChange={(value) => handlePageSizeChange(Number(value))}
			>
				<SelectTrigger>
					<SelectValue placeholder='Select page size'>{String(pageSize)}</SelectValue>
				</SelectTrigger>
				<SelectContent>
					{options.map((option) => (
						<SelectItem
							key={option}
							value={String(option)}
						>
							{option}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
		</div>
	);
}

export function PaginationWithLinks({ pageSizeSelectOptions, pageSize, totalCount, page, pageSearchParam, onPageChange }: PaginationWithLinksProps) {
	const pathname = usePathname() || '';
	const rawSearchParams = useSearchParams();
	const searchParams = useMemo(() => rawSearchParams || new URLSearchParams(), [rawSearchParams]);

	const pageFromUrl = pageSearchParam ? searchParams.get(pageSearchParam) : null;
	const initialPage = pageFromUrl ? parseInt(pageFromUrl, 10) : page || 1;
	const [currentPage, setCurrentPage] = useState(initialPage);

	// Use useEffect to update currentPage when URL parameters or page prop changes
	useEffect(() => {
		if (pageSearchParam) {
			const pageParam = searchParams.get(pageSearchParam);
			if (pageParam) {
				setCurrentPage(parseInt(pageParam, 10));
			}
		} else if (page) {
			setCurrentPage(page);
		}
	}, [page, pageSearchParam, searchParams]);

	if (totalCount <= 0 || totalCount <= pageSize) {
		return null;
	}

	const totalPageCount = Math.ceil(totalCount / pageSize);

	const buildLink = (pageNum: number) => {
		if (onPageChange) {
			return '#';
		}

		const newSearchParams = new URLSearchParams(searchParams.toString());
		if (pageSearchParam) {
			newSearchParams.set(pageSearchParam, String(pageNum));
		}
		return `${pathname}?${newSearchParams.toString()}`;
	};

	const handlePageClick = (pageNum: number, event?: MouseEvent) => {
		if (onPageChange) {
			event?.preventDefault();
			onPageChange(pageNum);
		}
	};

	const renderPageNumbers = () => {
		const items: ReactNode[] = [];
		const maxVisiblePages = 5;

		if (totalPageCount <= maxVisiblePages) {
			for (let i = 1; i <= totalPageCount; i += 1) {
				items.push(
					<PaginationItem key={i}>
						<PaginationLink
							href={buildLink(i)}
							isActive={currentPage === i}
							onClick={(e) => handlePageClick(i, e)}
						>
							{i}
						</PaginationLink>
					</PaginationItem>
				);
			}
		} else {
			items.push(
				<PaginationItem key={1}>
					<PaginationLink
						href={buildLink(1)}
						isActive={currentPage === 1}
						onClick={(e) => handlePageClick(1, e)}
					>
						1
					</PaginationLink>
				</PaginationItem>
			);

			if (currentPage > 3) {
				items.push(
					<PaginationItem key='ellipsis-start'>
						<PaginationEllipsis />
					</PaginationItem>
				);
			}

			const start = Math.max(2, currentPage - 1);
			const end = Math.min(totalPageCount - 1, currentPage + 1);

			for (let i = start; i <= end; i += 1) {
				items.push(
					<PaginationItem key={i}>
						<PaginationLink
							href={buildLink(i)}
							isActive={currentPage === i}
							onClick={(e) => handlePageClick(i, e)}
						>
							{i}
						</PaginationLink>
					</PaginationItem>
				);
			}

			if (currentPage < totalPageCount - 2) {
				items.push(
					<PaginationItem key='ellipsis-end'>
						<PaginationEllipsis />
					</PaginationItem>
				);
			}

			items.push(
				<PaginationItem key={totalPageCount}>
					<PaginationLink
						href={buildLink(totalPageCount)}
						isActive={currentPage === totalPageCount}
						onClick={(e) => handlePageClick(totalPageCount, e)}
					>
						{totalPageCount}
					</PaginationLink>
				</PaginationItem>
			);
		}

		return items;
	};

	return (
		<div className='flex w-full flex-col items-center gap-3 md:flex-row'>
			{pageSizeSelectOptions && (
				<div className='flex flex-1 flex-col gap-4'>
					<SelectRowsPerPage
						options={pageSizeSelectOptions.pageSizeOptions}
						pageSize={pageSize}
						pathname={pathname}
						searchParams={searchParams}
						pageSearchParam={pageSearchParam}
						pageSizeSearchParam={pageSizeSelectOptions.pageSizeSearchParam}
						onPageSizeChange={
							onPageChange
								? () => {
										setCurrentPage(1);
										onPageChange(1);
									}
								: undefined
						}
					/>
				</div>
			)}
			<Pagination className={cn({ 'md:justify-end': pageSizeSelectOptions })}>
				<PaginationContent className='max-sm:gap-2'>
					<PaginationItem>
						<PaginationPrevious
							href={buildLink(Math.max(currentPage - 1, 1))}
							aria-disabled={currentPage === 1}
							tabIndex={currentPage === 1 ? -1 : undefined}
							className={currentPage === 1 ? 'pointer-events-none opacity-50' : undefined}
							onClick={(e) => handlePageClick(Math.max(currentPage - 1, 1), e)}
						/>
					</PaginationItem>
					{renderPageNumbers()}
					<PaginationItem>
						<PaginationNext
							href={buildLink(Math.min(currentPage + 1, totalPageCount))}
							aria-disabled={currentPage === totalPageCount}
							tabIndex={currentPage === totalPageCount ? -1 : undefined}
							className={currentPage === totalPageCount ? 'pointer-events-none opacity-50' : undefined}
							onClick={(e) => handlePageClick(Math.min(currentPage + 1, totalPageCount), e)}
						/>
					</PaginationItem>
				</PaginationContent>
			</Pagination>
		</div>
	);
}
