// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { useToast } from '@/hooks/useToast';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ENotificationStatus } from '@/_shared/types';
import { FaTwitter } from '@react-icons/all-files/fa/FaTwitter';
import { FaCopy } from '@react-icons/all-files/fa/FaCopy';
import { TextQuote } from 'lucide-react';
import { useQuoteCommentText } from '@/hooks/useQuoteCommentText';
import { cn } from '@/lib/utils';
import { useUser } from '@/hooks/useUser';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Button } from '../Button';
import classes from './HighlightMenu.module.scss';

interface HighlightMenuProps {
	markdownRef: React.RefObject<HTMLDivElement | null>;
}

// Optimized debounce hook for performance
function useOptimizedDebounce<T>(value: T, delay: number): T {
	const [debouncedValue, setDebouncedValue] = useState<T>(value);

	useEffect(() => {
		const handler = setTimeout(() => {
			setDebouncedValue(value);
		}, delay);

		return () => {
			clearTimeout(handler);
		};
	}, [value, delay]);

	return debouncedValue;
}

function HighlightMenu({ markdownRef }: HighlightMenuProps) {
	const t = useTranslations();
	const { toast } = useToast();
	const { user } = useUser();
	const { setQuoteCommentText } = useQuoteCommentText();
	const [selectedText, setSelectedText] = useState('');
	const [menuPosition, setMenuPosition] = useState({ left: 0, top: 0 });
	const [isVisible, setIsVisible] = useState(false);
	const [selectionData, setSelectionData] = useState<{
		text: string;
		rect: DOMRect | null;
	}>({ text: '', rect: null });

	const menuRef = useRef<HTMLDivElement>(null);

	// Optimized debounce for selection changes
	const debouncedSelection = useOptimizedDebounce(selectionData, 100);

	const clearSelection = useCallback(() => {
		setSelectedText('');
		setIsVisible(false);
		setSelectionData({ text: '', rect: null });
	}, []);

	const copyToClipboard = useCallback(
		async (text: string) => {
			try {
				await navigator.clipboard.writeText(text);
				toast({
					title: t('PostDetails.HighlightMenu.textCopiedToClipboard'),
					status: ENotificationStatus.SUCCESS
				});
			} catch {
				toast({
					title: t('PostDetails.HighlightMenu.failedToCopyText'),
					status: ENotificationStatus.ERROR
				});
			}
		},
		[toast, t]
	);

	const handleQuote = useCallback(
		(event: React.MouseEvent) => {
			event.preventDefault();
			event.stopPropagation();
			setQuoteCommentText(selectedText || '');

			if (user) {
				const commentForm = document.getElementById('commentForm');
				commentForm?.scrollIntoView({ behavior: 'smooth', block: 'center' });
			} else {
				const loginPrompt = document.getElementById('commentLoginPrompt');
				loginPrompt?.scrollIntoView({ behavior: 'smooth', block: 'center' });
			}
			clearSelection();
		},
		[selectedText, setQuoteCommentText, user, clearSelection]
	);

	const handleCopy = useCallback(
		(event: React.MouseEvent) => {
			event.preventDefault();
			event.stopPropagation();
			copyToClipboard(selectedText || '');
			clearSelection();
		},
		[selectedText, copyToClipboard, clearSelection]
	);

	const handleShare = useCallback(
		(event: React.MouseEvent) => {
			event.preventDefault();
			event.stopPropagation();
			const twitterText = `"${selectedText}" ${window.location.href}`;
			const twitterLink = `https://twitter.com/intent/tweet?text=${encodeURIComponent(twitterText)}`;
			window.open(twitterLink, '_blank');
			clearSelection();
		},
		[selectedText, clearSelection]
	);

	// Optimized selection handler with performance improvements
	const handleSelectionChange = useCallback(() => {
		const selection = window.getSelection();
		const markdown = markdownRef.current;

		if (!selection || !markdown || selection.rangeCount === 0) {
			setSelectionData({ text: '', rect: null });
			return;
		}

		const text = selection.toString().trim();

		if (!text) {
			setSelectionData({ text: '', rect: null });
			return;
		}

		// Check if selection is within markdown container
		const range = selection.getRangeAt(0);
		const container = range.commonAncestorContainer;
		const element = container.nodeType === Node.TEXT_NODE ? container.parentElement : container;

		if (!element || !markdown.contains(element)) {
			setSelectionData({ text: '', rect: null });
			return;
		}

		const rect = range.getBoundingClientRect();
		setSelectionData({ text, rect });
	}, [markdownRef]);

	// Process debounced selection for optimal performance
	useEffect(() => {
		if (!debouncedSelection.text || !debouncedSelection.rect) {
			setSelectedText('');
			setIsVisible(false);
			return;
		}

		const { text, rect } = debouncedSelection;
		const markdown = markdownRef?.current;

		if (markdown && rect) {
			const markdownRect = markdown.getBoundingClientRect();

			// Enhanced bounds checking
			if (rect.left >= markdownRect.left && rect.right <= markdownRect.right && rect.top >= markdownRect.top && rect.bottom <= markdownRect.bottom) {
				setMenuPosition({
					left: rect.left + rect.width / 2,
					top: rect.top - 60 // Position 60px above selection
				});

				setSelectedText(text);
				setIsVisible(true);
				return;
			}
		}

		setSelectedText('');
		setIsVisible(false);
	}, [debouncedSelection, markdownRef]);

	// Optimized event listeners with proper cleanup
	useEffect(() => {
		const markdown = markdownRef.current;
		if (!markdown) return undefined;

		const handleDocumentClick = (event: MouseEvent) => {
			if (menuRef.current?.contains(event.target as Node)) return;
			if (markdown.contains(event.target as Node)) return;
			clearSelection();
		};

		// Use passive listeners for better performance
		document.addEventListener('selectionchange', handleSelectionChange);
		document.addEventListener('click', handleDocumentClick, { passive: true });

		return () => {
			document.removeEventListener('selectionchange', handleSelectionChange);
			document.removeEventListener('click', handleDocumentClick);
		};
	}, [markdownRef, handleSelectionChange, clearSelection]);

	if (!isVisible || !selectedText) {
		return null;
	}

	return (
		<div
			ref={menuRef}
			className={classes.container}
			style={{
				left: `${menuPosition.left}px`,
				top: `${menuPosition.top - 40}px`,
				transform: 'translateX(-50%)',
				// Performance optimizations
				willChange: 'transform',
				contain: 'layout style paint'
			}}
		>
			<Button
				variant='ghost'
				size='sm'
				className={cn(classes.button, 'h-6')}
				onClick={handleQuote}
			>
				{user ? (
					<div className='flex cursor-pointer items-center gap-x-1'>
						<TextQuote className='w-3 text-basic_text' />
						<span className={classes.buttonText}>{t('PostDetails.HighlightMenu.quote')}</span>
					</div>
				) : (
					<Link
						href='/login'
						className='flex items-center gap-x-1 hover:no-underline'
					>
						<TextQuote className='w-3 text-basic_text' />
						<span className={classes.buttonText}>{t('PostDetails.HighlightMenu.quote')}</span>
					</Link>
				)}
			</Button>
			<Button
				variant='ghost'
				size='sm'
				className={cn(classes.button, 'h-6')}
				onClick={handleShare}
			>
				<FaTwitter className='w-3 text-basic_text' />
				<span className={classes.buttonText}>{t('PostDetails.HighlightMenu.share')}</span>
			</Button>
			<Button
				variant='ghost'
				size='sm'
				className={cn(classes.button, 'h-6')}
				onClick={handleCopy}
			>
				<FaCopy className='w-3 text-basic_text' />
				<span className={classes.buttonText}>{t('PostDetails.HighlightMenu.copy')}</span>
			</Button>
		</div>
	);
}

export default HighlightMenu;
