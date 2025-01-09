// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import * as React from 'react';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';

import { cn } from '@/lib/utils';
import { ButtonProps, buttonVariants, buttonSizes } from '@ui/Button';

function Pagination({ className, ...props }: React.ComponentProps<'nav'>) {
	return (
		<nav
			role='navigation'
			aria-label='pagination'
			className={cn('mx-auto flex w-full justify-center', className)}
			{...props}
		/>
	);
}
Pagination.displayName = 'Pagination';

const PaginationContent = React.forwardRef<HTMLUListElement, React.ComponentProps<'ul'>>(({ className, ...props }, ref) => (
	<ul
		ref={ref}
		className={cn('flex flex-row items-center gap-1', className)}
		{...props}
	/>
));
PaginationContent.displayName = 'PaginationContent';

const PaginationItem = React.forwardRef<HTMLLIElement, React.ComponentProps<'li'>>(({ className, ...props }, ref) => (
	<li
		ref={ref}
		className={cn('', className)}
		{...props}
	/>
));
PaginationItem.displayName = 'PaginationItem';

type PaginationLinkProps = {
	isActive?: boolean;
} & Pick<ButtonProps, 'size'> &
	React.ComponentProps<'a'>;

function PaginationLink({ className, children, isActive, size = 'icon', ...props }: PaginationLinkProps) {
	return (
		<a
			aria-current={isActive ? 'page' : undefined}
			className={cn(isActive ? buttonVariants.secondary : buttonVariants.ghost, buttonSizes[`${size}`], 'cursor-pointer', className)}
			{...props}
		>
			{children}
		</a>
	);
}
PaginationLink.displayName = 'PaginationLink';

function PaginationPrevious({ className, ...props }: React.ComponentProps<typeof PaginationLink>) {
	return (
		<PaginationLink
			aria-label='Go to previous page'
			size='default'
			className={cn('flex items-center gap-x-1 pl-2.5', className)}
			{...props}
		>
			<ChevronLeft className='h-4 w-4' />
			<span>Previous</span>
		</PaginationLink>
	);
}
PaginationPrevious.displayName = 'PaginationPrevious';

function PaginationNext({ className, ...props }: React.ComponentProps<typeof PaginationLink>) {
	return (
		<PaginationLink
			aria-label='Go to next page'
			size='default'
			className={cn('flex items-center gap-x-1 pr-2.5', className)}
			{...props}
		>
			<span>Next</span>
			<ChevronRight className='h-4 w-4' />
		</PaginationLink>
	);
}
PaginationNext.displayName = 'PaginationNext';

function PaginationEllipsis({ className, ...props }: React.ComponentProps<'span'>) {
	return (
		<span
			aria-hidden
			className={cn('flex h-9 w-9 items-center justify-center', className)}
			{...props}
		>
			<MoreHorizontal className='h-4 w-4' />
			<span className='sr-only'>More pages</span>
		</span>
	);
}
PaginationEllipsis.displayName = 'PaginationEllipsis';

export { Pagination, PaginationContent, PaginationLink, PaginationItem, PaginationPrevious, PaginationNext, PaginationEllipsis };
