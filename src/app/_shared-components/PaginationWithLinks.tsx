// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { type ReactNode, useState, useEffect } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
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
	page: number;
	pageSearchParam?: string;
	onClick?: (page: number) => void;
	linkPagination?: boolean; // Add this prop to make it optional whether to use links for pagination
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
	linkPagination={true}
  />
 * ```
 */

const PAGINATION_LINK_CLASS_NAME = 'pointer-events-none opacity-50';

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

export function PaginationWithLinks({ pageSizeSelectOptions, pageSize, totalCount, page, pageSearchParam, onClick, linkPagination = false }: PaginationWithLinksProps) {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();

	const [currentPage, setCurrentPage] = useState(page);

	useEffect(() => {
		setCurrentPage(page);
	}, [page]);

	const totalPageCount = Math.ceil(totalCount / pageSize);

	const navToPageSize = (newPageSize: number) => {
		const key = pageSizeSelectOptions?.pageSizeSearchParam || 'pageSize';
		const newSearchParams = new URLSearchParams(searchParams || undefined);
		newSearchParams.set(key, String(newPageSize));
		newSearchParams.delete(pageSearchParam || 'page'); // Clear the page number when changing page size
		router.push(`${pathname}?${newSearchParams.toString()}`);
	};

	const buildLink = (pageNumber: number) => {
		const newSearchParams = new URLSearchParams(searchParams || undefined);
		newSearchParams.set(pageSearchParam || 'page', String(pageNumber));
		return `${pathname}?${newSearchParams.toString()}`;
	};

	const renderPageNumbers = () => {
		const items: ReactNode[] = [];
		const maxVisiblePages = 5;

		const addPageItem = (i: number) => {
			items.push(
				<PaginationItem key={i}>
					{linkPagination ? (
						<PaginationLink
							href={buildLink(i)}
							className={currentPage === i ? PAGINATION_LINK_CLASS_NAME : undefined}
						>
							{i}
						</PaginationLink>
					) : (
						<PaginationLink
							onClick={() => {
								setCurrentPage(i);
								onClick?.(i);
							}}
							isActive={currentPage === i}
						>
							{i}
						</PaginationLink>
					)}
				</PaginationItem>
			);
		};

		const addEllipsis = (key: string) => {
			items.push(
				<PaginationItem key={key}>
					<PaginationEllipsis />
				</PaginationItem>
			);
		};

		if (totalPageCount <= maxVisiblePages) {
			for (let i = 1; i <= totalPageCount; i += 1) {
				addPageItem(i);
			}
		} else {
			addPageItem(1);

			if (currentPage > 3) {
				addEllipsis('ellipsis-start');
			}

			const start = Math.max(2, currentPage - 1);
			const end = Math.min(totalPageCount - 1, currentPage + 1);

			for (let i = start; i <= end; i += 1) {
				addPageItem(i);
			}

			if (currentPage < totalPageCount - 2) {
				addEllipsis('ellipsis-end');
			}

			addPageItem(totalPageCount);
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
						{linkPagination ? (
							<PaginationPrevious
								href={buildLink(Math.max(currentPage - 1, 1))}
								aria-disabled={currentPage === 1}
								tabIndex={currentPage === 1 ? -1 : undefined}
								className={currentPage === 1 ? PAGINATION_LINK_CLASS_NAME : undefined}
							/>
						) : (
							<PaginationPrevious
								onClick={() => {
									setCurrentPage(Math.max(currentPage - 1, 1));
									onClick?.(Math.max(currentPage - 1, 1));
								}}
								aria-disabled={currentPage === 1}
								tabIndex={currentPage === 1 ? -1 : undefined}
								className={currentPage === 1 ? PAGINATION_LINK_CLASS_NAME : undefined}
							/>
						)}
					</PaginationItem>
					{renderPageNumbers()}
					<PaginationItem>
						{linkPagination ? (
							<PaginationNext
								href={buildLink(Math.min(currentPage + 1, totalPageCount))}
								aria-disabled={currentPage === totalPageCount}
								tabIndex={currentPage === totalPageCount ? -1 : undefined}
								className={currentPage === totalPageCount ? PAGINATION_LINK_CLASS_NAME : undefined}
							/>
						) : (
							<PaginationNext
								onClick={() => {
									setCurrentPage(Math.min(currentPage + 1, totalPageCount));
									onClick?.(Math.min(currentPage + 1, totalPageCount));
								}}
								aria-disabled={currentPage === totalPageCount}
								tabIndex={currentPage === totalPageCount ? -1 : undefined}
								className={currentPage === totalPageCount ? PAGINATION_LINK_CLASS_NAME : undefined}
							/>
						)}
					</PaginationItem>
				</PaginationContent>
			</Pagination>
		</div>
	);
}
