// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { type ReactNode, useCallback, useState, useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useRouter } from 'nextjs-toploader/app';
import { cn } from '@/lib/utils';
import { useTopLoader } from 'nextjs-toploader';
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from './Pagination';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './Select/Select';

export interface PaginationWithLinksProps {
	pageSizeSelectOptions?: {
		pageSizeSearchParam?: string;
		pageSizeOptions: number[];
	};
	totalCount: number;
	pageSize: number;
	page: number;
	pageSearchParam?: string;
	onClick?: (page: number) => void;
}

/**
 * Navigate with Nextjs links (need to update your own `pagination.tsx` to use Nextjs Link)
 *
 * @example
 * ```
 * <PaginationWithLinks
    page={1}
    pageSize={20}
    totalCount={500}
  />
 * ```
 */

function SelectRowsPerPage({ options, setPageSize, pageSize }: { options: number[]; setPageSize: (newSize: number) => void; pageSize: number }) {
	return (
		<div className='flex items-center gap-4'>
			<span className='whitespace-nowrap text-sm'>Rows per page</span>

			<Select
				value={String(pageSize)}
				onValueChange={(value) => setPageSize(Number(value))}
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

export function PaginationWithLinks({ pageSizeSelectOptions, pageSize, totalCount, page, pageSearchParam, onClick }: PaginationWithLinksProps) {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const TopLoader = useTopLoader();
	const [currentPage, setCurrentPage] = useState(page);

	useEffect(() => {
		setCurrentPage(page);
	}, [page]);

	const buildLink = (page: number) => {
		const newSearchParams = new URLSearchParams(searchParams || undefined);
		newSearchParams.set(pageSearchParam || 'page', String(page));
		return `${pathname}?${newSearchParams.toString()}`;
	};

	const totalPageCount = Math.ceil(totalCount / pageSize);

	const navToPageSize = useCallback(
		async (newPageSize: number) => {
			TopLoader.start();
			const key = pageSizeSelectOptions?.pageSizeSearchParam || 'pageSize';
			const newSearchParams = new URLSearchParams(searchParams || undefined);
			newSearchParams.set(key, String(newPageSize));
			newSearchParams.delete(pageSearchParam || 'page');
			try {
				await router.push(`${pathname}?${newSearchParams.toString()}`);
			} finally {
				TopLoader.done();
			}
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[searchParams, pathname, pageSizeSelectOptions, pageSearchParam]
	);

	const handlePageClick = useCallback(
		async (pageNumber: number) => {
			TopLoader.start();
			setCurrentPage(pageNumber);
			if (onClick) {
				onClick(pageNumber);
				// Add small delay to allow toploader to be visible
				try {
					await new Promise((resolve) => {
						setTimeout(resolve, 100);
					});
				} finally {
					TopLoader.done();
				}
				return;
			}

			try {
				await router.push(buildLink(pageNumber));
			} finally {
				TopLoader.done();
			}
		},
		[TopLoader, onClick, router, buildLink]
	);

	const renderPageNumbers = () => {
		const items: ReactNode[] = [];
		const maxVisiblePages = 5;

		if (totalPageCount <= maxVisiblePages) {
			for (let i = 1; i <= totalPageCount; i += 1) {
				items.push(
					<PaginationItem key={i}>
						<PaginationLink
							href={buildLink(i)}
							onClick={() => handlePageClick(i)}
							isActive={currentPage === i}
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
						onClick={() => handlePageClick(1)}
						isActive={currentPage === 1}
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
							onClick={() => handlePageClick(i)}
							isActive={currentPage === i}
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
						onClick={() => handlePageClick(totalPageCount)}
						isActive={currentPage === totalPageCount}
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
						setPageSize={navToPageSize}
						pageSize={pageSize}
					/>
				</div>
			)}
			<Pagination className={cn({ 'md:justify-end': pageSizeSelectOptions })}>
				<PaginationContent className='max-sm:gap-0'>
					<PaginationItem>
						<PaginationPrevious
							href={buildLink(Math.max(currentPage - 1, 1))}
							onClick={() => handlePageClick(Math.max(currentPage - 1, 1))}
							aria-disabled={currentPage === 1}
							tabIndex={currentPage === 1 ? -1 : undefined}
							className={currentPage === 1 ? 'pointer-events-none opacity-50' : undefined}
						/>
					</PaginationItem>
					{renderPageNumbers()}
					<PaginationItem>
						<PaginationNext
							href={buildLink(Math.min(currentPage + 1, totalPageCount))}
							onClick={() => handlePageClick(Math.min(currentPage + 1, totalPageCount))}
							aria-disabled={currentPage === totalPageCount}
							tabIndex={currentPage === totalPageCount ? -1 : undefined}
							className={currentPage === totalPageCount ? 'pointer-events-none opacity-50' : undefined}
						/>
					</PaginationItem>
				</PaginationContent>
			</Pagination>
		</div>
	);
}
