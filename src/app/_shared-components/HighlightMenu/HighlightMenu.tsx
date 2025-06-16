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
import { Button } from '../Button';
import classes from './HighlightMenu.module.scss';

const SELECTION_DELAY = 150;
const MENU_OFFSET_Y = 60;
const MENU_VISUAL_ADJUSTMENT = 40;

function HighlightMenu({ markdownRef }: { markdownRef: React.RefObject<HTMLDivElement | null> }) {
	const t = useTranslations('PostDetails.HighlightMenu');
	const { toast } = useToast();
	const { user } = useUser();
	const { setQuoteCommentText } = useQuoteCommentText();
	const [selectedText, setSelectedText] = useState('');
	const [menuPosition, setMenuPosition] = useState({ left: 0, top: 0 });
	const [isVisible, setIsVisible] = useState(false);

	const menuRef = useRef<HTMLDivElement>(null);
	const selectionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	const copyToClipboard = useCallback(
		async (text: string) => {
			try {
				await navigator.clipboard.writeText(text);
				toast({
					title: t('textCopiedToClipboard'),
					status: ENotificationStatus.SUCCESS
				});
			} catch {
				toast({
					title: t('failedToCopyText'),
					status: ENotificationStatus.ERROR
				});
			}
		},
		[toast]
	);

	const handleSelection = useCallback(() => {
		// Clear any existing timeout
		if (selectionTimeoutRef.current) {
			clearTimeout(selectionTimeoutRef.current);
		}

		// Small delay to ensure selection is stable
		selectionTimeoutRef.current = setTimeout(() => {
			const selection = window.getSelection();
			if (!selection || selection.rangeCount === 0) {
				setSelectedText('');

				setIsVisible(false);
				return;
			}

			const text = selection.toString().trim();

			if (text && text.length > 0) {
				const range = selection.getRangeAt(0);
				const rect = range.getBoundingClientRect();

				// Only show menu if the selection is within our markdown container
				const markdown = markdownRef?.current;
				if (markdown && rect) {
					const markdownRect = markdown.getBoundingClientRect();

					// Check if selection is within the markdown area
					if (rect.left >= markdownRect.left && rect.right <= markdownRect.right && rect.top >= markdownRect.top && rect.bottom <= markdownRect.bottom) {
						// Use fixed positioning relative to viewport
						setMenuPosition({
							left: rect.left + rect.width / 2,
							top: rect.top - MENU_OFFSET_Y // Position 60px above the selection
						});

						setSelectedText(text);
						setIsVisible(true);
						return;
					}
				}
			}

			setSelectedText('');
			setIsVisible(false);
		}, SELECTION_DELAY); // Slightly longer delay to ensure selection is complete
	}, [markdownRef]);

	const clearSelection = useCallback(() => {
		if (selectionTimeoutRef.current) {
			clearTimeout(selectionTimeoutRef.current);
		}
		setSelectedText('');
		setIsVisible(false);
	}, []);

	const shareSelection = useCallback(
		(event: React.MouseEvent) => {
			event.stopPropagation();
			event.preventDefault();
			const twitterText = `"${selectedText}" ${window.location.href}`;
			const twitterLink = `https://twitter.com/intent/tweet?text=${encodeURIComponent(twitterText)}`;

			window.open(twitterLink, '_blank');
			clearSelection();
		},
		[selectedText, clearSelection]
	);

	const handleCopy = useCallback(
		(event: React.MouseEvent) => {
			event.stopPropagation();
			event.preventDefault();
			copyToClipboard(selectedText || '');
			clearSelection();
		},
		[selectedText, copyToClipboard, clearSelection]
	);

	const handleQuote = useCallback(
		(event: React.MouseEvent) => {
			event.stopPropagation();
			event.preventDefault();
			setQuoteCommentText(selectedText || '');

			if (user) {
				// Scroll to comment form if user is logged in
				const commentForm = document.getElementById('commentForm');
				commentForm?.scrollIntoView({ behavior: 'smooth', block: 'center' });
			} else {
				// Scroll to login prompt if user is not logged in
				const loginPrompt = document.getElementById('commentLoginPrompt');
				loginPrompt?.scrollIntoView({ behavior: 'smooth', block: 'center' });
			}

			clearSelection();
		},
		[selectedText, setQuoteCommentText, user, clearSelection]
	);

	useEffect(() => {
		const markdown = markdownRef.current;
		if (!markdown) return undefined;

		// Handle selection change globally
		const handleSelectionChange = () => {
			const selection = window.getSelection();
			if (!selection || selection.toString().trim() === '') {
				clearSelection();
				return;
			}

			// Check if the selection is within our markdown container
			if (selection.rangeCount > 0) {
				const range = selection.getRangeAt(0);
				const container = range.commonAncestorContainer;
				const element = container.nodeType === Node.TEXT_NODE ? container.parentElement : container;

				if (element && markdown.contains(element)) {
					handleSelection();
				} else {
					clearSelection();
				}
			}
		};

		// Handle clicks outside to clear selection
		const handleDocumentClick = (event: MouseEvent) => {
			// Don't clear if clicking on the menu
			if (menuRef.current && menuRef.current.contains(event.target as Node)) {
				return;
			}

			// Don't clear if clicking within markdown (let selectionchange handle it)
			if (markdown.contains(event.target as Node)) {
				return;
			}

			// Clear if clicking completely outside
			clearSelection();
		};

		// Use selectionchange instead of mouseup for better accuracy
		document.addEventListener('selectionchange', handleSelectionChange);
		document.addEventListener('click', handleDocumentClick);

		return () => {
			document.removeEventListener('selectionchange', handleSelectionChange);
			document.removeEventListener('click', handleDocumentClick);
			if (selectionTimeoutRef.current) {
				clearTimeout(selectionTimeoutRef.current);
			}
		};
	}, [markdownRef, handleSelection, clearSelection]);

	if (!isVisible || !selectedText) {
		return null;
	}

	return (
		<div
			ref={menuRef}
			className={classes.container}
			style={{
				left: `${menuPosition.left}px`,
				top: `${menuPosition.top - MENU_VISUAL_ADJUSTMENT}px`,
				transform: 'translateX(-50%)'
			}}
		>
			<Button
				variant='ghost'
				size='sm'
				className={cn(classes.button, 'h-6')}
				onClick={handleQuote}
			>
				<TextQuote className='w-3 text-basic_text' />
				<span className={classes.buttonText}>{t('quote')}</span>
			</Button>
			<Button
				variant='ghost'
				size='sm'
				className={cn(classes.button, 'h-6')}
				onClick={shareSelection}
			>
				<FaTwitter className='w-3 text-basic_text' />
				<span className={classes.buttonText}>{t('share')}</span>
			</Button>
			<Button
				variant='ghost'
				size='sm'
				className={cn(classes.button, 'h-6')}
				onClick={handleCopy}
			>
				<FaCopy className='w-3 text-basic_text' />
				<span className={classes.buttonText}>{t('copy')}</span>
			</Button>
		</div>
	);
}

export default HighlightMenu;
