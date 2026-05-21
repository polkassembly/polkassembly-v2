// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

/* eslint-disable react/function-component-definition, react/button-has-type, security/detect-object-injection, @next/next/no-img-element */

'use client';

import React, { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'observatory-theme';

const getInitialTheme = (): 'light' | 'dark' => {
	if (typeof window === 'undefined') return 'light';
	const stored = localStorage.getItem(STORAGE_KEY);
	if (stored === 'light' || stored === 'dark') return stored;
	return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

export const useTheme = () => {
	const [theme, setTheme] = useState<'light' | 'dark'>('light');
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		const initial = getInitialTheme();
		setTheme(initial);
		setMounted(true);
		document.documentElement.classList.toggle('dark', initial === 'dark');
	}, []);

	const toggle = useCallback(() => {
		setTheme((prev) => {
			const next = prev === 'light' ? 'dark' : 'light';
			localStorage.setItem(STORAGE_KEY, next);
			document.documentElement.classList.toggle('dark', next === 'dark');
			return next;
		});
	}, []);

	return { theme, toggle, mounted };
};

export const ThemeToggle: React.FC = () => {
	const { theme, toggle, mounted } = useTheme();
	if (!mounted) return <div className='h-8 w-8' />;
	return (
		<button
			onClick={toggle}
			aria-label='Toggle theme'
			className='inline-flex h-8 w-8 items-center justify-center rounded-md border border-[var(--border)] text-[var(--text-faint)] transition hover:border-[var(--border-strong)] hover:text-[var(--text)]'
		>
			{theme === 'light' ? (
				<svg
					width='14'
					height='14'
					viewBox='0 0 24 24'
					fill='none'
					stroke='currentColor'
					strokeWidth='2'
					strokeLinecap='round'
					strokeLinejoin='round'
				>
					<path d='M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z' />
				</svg>
			) : (
				<svg
					width='14'
					height='14'
					viewBox='0 0 24 24'
					fill='none'
					stroke='currentColor'
					strokeWidth='2'
					strokeLinecap='round'
					strokeLinejoin='round'
				>
					<circle
						cx='12'
						cy='12'
						r='4'
					/>
					<path d='M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41' />
				</svg>
			)}
		</button>
	);
};

type BrandAsset = {
	initial: string;
	bg: string;
	fg: string;
	src?: string;
	padding?: number;
	radius?: number;
	objectFit?: 'contain' | 'cover';
};

const GOOGLE_FAVICON_HOST = 'www.google.com';

const favicon = (domain: string) => `https://${GOOGLE_FAVICON_HOST}/s2/favicons?domain=${domain}&sz=64`;

const BRAND_LOGOS: Record<string, BrandAsset> = {
	Polkadot: {
		initial: 'P',
		bg: '#E6007A',
		fg: '#ffffff',
		src: favicon('polkadot.com'),
		padding: 2,
		radius: 999
	},
	Polkassembly: {
		initial: 'P',
		bg: '#ffffff',
		fg: '#E6007A',
		src: 'https://polkassembly.io/logo.png',
		padding: 2
	},
	Subsquare: {
		initial: 'S',
		bg: '#ffffff',
		fg: '#111827',
		src: favicon('subsquare.io'),
		padding: 2
	},
	PolkaSafe: {
		initial: 'P',
		bg: '#14B8A6',
		fg: '#ffffff',
		src: favicon('polkasafe.xyz'),
		padding: 2
	},
	Multix: {
		initial: 'M',
		bg: '#ffffff',
		fg: '#0F172A',
		src: favicon('multix.chainsafe.io'),
		padding: 2
	},
	Signet: {
		initial: 'S',
		bg: '#D7FF62',
		fg: '#171717',
		src: favicon('signet.talisman.xyz'),
		padding: 2
	},
	Talisman: {
		initial: 'T',
		bg: '#D7FF62',
		fg: '#171717',
		src: favicon('talisman.xyz'),
		padding: 2
	},
	'Native pallet (no UI)': { initial: 'N', bg: '#94A3B8', fg: '#0F172A' },
	'Direct RPC / others': { initial: 'RPC', bg: '#CBD5E1', fg: '#0F172A' },
	Frequency: { initial: 'F', bg: '#ffffff', fg: '#111827', src: favicon('frequency.xyz'), padding: 2 },
	Moonbeam: {
		initial: 'M',
		bg: '#ffffff',
		fg: '#53CBC9',
		src: 'https://cdn.sanity.io/images/76lym2dp/mb-production/1aacbb5dc188314678a0e4504808b57171837cd7-512x512.png?w=256&h=256',
		padding: 1
	},
	Phala: { initial: 'P', bg: '#ffffff', fg: '#111827', src: favicon('phala.network'), padding: 2 },
	Mythos: { initial: 'M', bg: '#ffffff', fg: '#111827', src: favicon('mythos.foundation'), padding: 2 },
	peaq: { initial: 'P', bg: '#ffffff', fg: '#111827', src: favicon('peaq.network'), padding: 2 },
	Hydration: {
		initial: 'H',
		bg: '#ffffff',
		fg: '#FF0000',
		src: 'https://hydration.net/_next/static/media/hydration.26b66c3b.svg',
		padding: 2
	},
	'Hydration Lending': {
		initial: 'H',
		bg: '#ffffff',
		fg: '#FF0000',
		src: 'https://hydration.net/_next/static/media/hydration.26b66c3b.svg',
		padding: 2
	},
	Bifrost: {
		initial: 'B',
		bg: '#ffffff',
		fg: '#6B5CFF',
		src: favicon('bifrost.finance'),
		padding: 2
	},
	'Bifrost Liquid Staking': {
		initial: 'B',
		bg: '#ffffff',
		fg: '#6B5CFF',
		src: favicon('bifrost.finance'),
		padding: 2
	},
	Moonwell: { initial: 'M', bg: '#ffffff', fg: '#7C3AED', src: favicon('moonwell.fi'), padding: 2 },
	Acala: {
		initial: 'A',
		bg: '#ffffff',
		fg: '#E11D48',
		src: favicon('acala.network'),
		padding: 2
	},
	StellaSwap: {
		initial: 'S',
		bg: '#ffffff',
		fg: '#6844F5',
		src: 'https://raw.githubusercontent.com/moonbeam-foundation/app-directory-data/refs/heads/main/projects/stellaswap/logos/stellaswap-logo-large.jpeg',
		objectFit: 'cover'
	},
	Astar: {
		initial: 'A',
		bg: '#ffffff',
		fg: '#111827',
		src: favicon('astar.network'),
		padding: 2
	}
};

export const BrandMark: React.FC<{ name: string; size?: number; className?: string }> = ({ name, size = 18, className = '' }) => {
	const [failed, setFailed] = useState(false);
	const brand = BRAND_LOGOS[name] || { initial: name.charAt(0), bg: '#94A3B8', fg: '#ffffff' };
	const radius = brand.radius ?? Math.max(4, Math.round(size * 0.22));
	const canUseImage = Boolean(brand.src && !failed);
	return (
		<span
			className={`inline-flex shrink-0 items-center justify-center overflow-hidden border border-[var(--border)] font-mono font-semibold leading-none ${className}`}
			style={{
				width: size,
				height: size,
				background: brand.bg,
				color: brand.fg,
				borderRadius: radius,
				fontSize: Math.max(7, Math.round(size * (brand.initial.length > 1 ? 0.34 : 0.52)))
			}}
			aria-hidden
		>
			{canUseImage ? (
				<img
					src={brand.src}
					alt=''
					loading='lazy'
					className='h-full w-full'
					style={{
						objectFit: brand.objectFit || 'contain',
						padding: brand.padding || 0
					}}
					onError={() => setFailed(true)}
				/>
			) : (
				brand.initial
			)}
		</span>
	);
};

export const PolkadotMark: React.FC<{ className?: string; size?: number }> = ({ className = '', size = 18 }) => (
	<BrandMark
		name='Polkadot'
		size={size}
		className={className}
	/>
);

export const PlatformMark = BrandMark;
