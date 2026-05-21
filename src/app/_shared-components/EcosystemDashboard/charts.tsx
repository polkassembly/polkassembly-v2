// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

/* eslint-disable react/function-component-definition, @typescript-eslint/no-explicit-any, react/no-array-index-key */

'use client';

import React, { useEffect, useState } from 'react';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const fmtUsdCompact = (n: number): string => {
	if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(1).replace(/\.?0+$/, '')}B`;
	if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(0)}M`;
	if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
	return `$${n.toFixed(0)}`;
};

const useThemeTokens = () => {
	const [tokens, setTokens] = useState({
		grid: '#E2E8F0',
		text: '#64748B',
		accent: '#E6007A',
		bar: '#0F172A',
		tooltipBg: '#0F172A',
		tooltipText: '#ffffff',
		pie: ['#1E293B', '#475569', '#94A3B8', '#CBD5E1', '#E2E8F0']
	});

	useEffect(() => {
		const read = () => {
			// Read from .ecosystem-observatory wrapper if it exists (scoped vars),
			// else fall back to html element.
			const el = document.querySelector('.ecosystem-observatory') || document.documentElement;
			const cs = getComputedStyle(el as Element);
			setTokens({
				grid: cs.getPropertyValue('--grid').trim() || '#E2E8F0',
				text: cs.getPropertyValue('--text-faint').trim() || '#64748B',
				accent: cs.getPropertyValue('--accent').trim() || '#E6007A',
				bar: cs.getPropertyValue('--bar-fill').trim() || '#0F172A',
				tooltipBg: cs.getPropertyValue('--tooltip-bg').trim() || '#0F172A',
				tooltipText: cs.getPropertyValue('--tooltip-text').trim() || '#ffffff',
				pie: [
					cs.getPropertyValue('--pie-1').trim() || '#1E293B',
					cs.getPropertyValue('--pie-2').trim() || '#475569',
					cs.getPropertyValue('--pie-3').trim() || '#94A3B8',
					cs.getPropertyValue('--pie-4').trim() || '#CBD5E1',
					cs.getPropertyValue('--pie-5').trim() || '#E2E8F0'
				]
			});
		};
		read();
		// Re-read whenever the html class changes (light↔dark toggle on html element)
		const obs = new MutationObserver(read);
		obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
		return () => obs.disconnect();
	}, []);

	return tokens;
};

const tooltipStyle = (bg: string, fg: string): React.CSSProperties => ({
	background: bg,
	border: 'none',
	borderRadius: 6,
	color: fg,
	fontSize: 12,
	padding: '8px 10px',
	boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
});

export const TimeAreaChart: React.FC<{
	data: { period: string; value: number; label?: string; annotation?: string }[];
	height?: number;
	yFormatter?: (n: number) => string;
	annotatePeak?: boolean;
	valueLabel?: string;
}> = ({ data, height = 280, yFormatter = fmtUsdCompact, annotatePeak, valueLabel = 'Value' }) => {
	const t = useThemeTokens();
	const peak = annotatePeak ? data.reduce((p, c) => (c.value > p.value ? c : p), data[0]) : null;
	return (
		<ResponsiveContainer
			width='100%'
			height={height}
		>
			<AreaChart
				data={data}
				margin={{ top: 16, right: 16, left: 0, bottom: 0 }}
			>
				<defs>
					<linearGradient
						id='areaAccent'
						x1='0'
						y1='0'
						x2='0'
						y2='1'
					>
						<stop
							offset='0%'
							stopColor={t.accent}
							stopOpacity={0.22}
						/>
						<stop
							offset='100%'
							stopColor={t.accent}
							stopOpacity={0}
						/>
					</linearGradient>
				</defs>
				<CartesianGrid
					stroke={t.grid}
					vertical={false}
				/>
				<XAxis
					dataKey='label'
					tick={{ fontSize: 11, fill: t.text }}
					axisLine={{ stroke: t.grid }}
					tickLine={false}
				/>
				<YAxis
					tick={{ fontSize: 11, fill: t.text }}
					axisLine={false}
					tickLine={false}
					tickFormatter={yFormatter}
					width={56}
				/>
				<Tooltip
					contentStyle={tooltipStyle(t.tooltipBg, t.tooltipText)}
					formatter={(v: any) => [yFormatter(Number(v)), valueLabel]}
					labelFormatter={(label) => label}
					labelStyle={{ color: t.tooltipText, fontSize: 11, opacity: 0.7, marginBottom: 2 }}
					cursor={{ stroke: t.text, strokeOpacity: 0.4, strokeDasharray: '3 3' }}
					itemStyle={{ color: t.tooltipText }}
				/>
				<Area
					type='monotone'
					dataKey='value'
					stroke={t.accent}
					strokeWidth={2}
					fill='url(#areaAccent)'
					isAnimationActive={false}
				/>
				{peak && (
					<ReferenceLine
						x={peak.label}
						stroke={t.accent}
						strokeDasharray='3 3'
						strokeOpacity={0.4}
						label={{ value: 'Peak', position: 'top', fill: t.accent, fontSize: 10, fontWeight: 600 }}
					/>
				)}
			</AreaChart>
		</ResponsiveContainer>
	);
};

export const YearBarChart: React.FC<{
	data: { year: string; usd: number }[];
	height?: number;
	valueLabel?: string;
}> = ({ data, height = 240, valueLabel = 'Spend' }) => {
	const t = useThemeTokens();
	return (
		<ResponsiveContainer
			width='100%'
			height={height}
		>
			<BarChart
				data={data}
				margin={{ top: 10, right: 16, left: 0, bottom: 0 }}
			>
				<CartesianGrid
					stroke={t.grid}
					vertical={false}
				/>
				<XAxis
					dataKey='year'
					tick={{ fontSize: 11, fill: t.text }}
					axisLine={{ stroke: t.grid }}
					tickLine={false}
				/>
				<YAxis
					tick={{ fontSize: 11, fill: t.text }}
					axisLine={false}
					tickLine={false}
					tickFormatter={fmtUsdCompact}
					width={56}
				/>
				<Tooltip
					contentStyle={tooltipStyle(t.tooltipBg, t.tooltipText)}
					formatter={(v: any) => [fmtUsdCompact(Number(v)), valueLabel]}
					labelFormatter={(label) => `Year ${label}`}
					labelStyle={{ color: t.tooltipText, fontSize: 11, opacity: 0.7, marginBottom: 2 }}
					cursor={{ fill: t.text, fillOpacity: 0.06 }}
					itemStyle={{ color: t.tooltipText }}
				/>
				<Bar
					dataKey='usd'
					fill={t.bar}
					radius={[3, 3, 0, 0]}
					maxBarSize={56}
					isAnimationActive={false}
				/>
			</BarChart>
		</ResponsiveContainer>
	);
};

export const QuarterBarChart: React.FC<{
	data: { period: string; value: number; label?: string }[];
	height?: number;
	valueLabel?: string;
}> = ({ data, height = 220, valueLabel = 'Referenda' }) => {
	const t = useThemeTokens();
	return (
		<ResponsiveContainer
			width='100%'
			height={height}
		>
			<BarChart
				data={data}
				margin={{ top: 10, right: 16, left: 0, bottom: 0 }}
			>
				<CartesianGrid
					stroke={t.grid}
					vertical={false}
				/>
				<XAxis
					dataKey='label'
					tick={{ fontSize: 10, fill: t.text }}
					axisLine={{ stroke: t.grid }}
					tickLine={false}
				/>
				<YAxis
					tick={{ fontSize: 11, fill: t.text }}
					axisLine={false}
					tickLine={false}
					width={36}
				/>
				<Tooltip
					contentStyle={tooltipStyle(t.tooltipBg, t.tooltipText)}
					formatter={(v: any) => [v.toLocaleString(), valueLabel]}
					labelFormatter={(label) => label}
					labelStyle={{ color: t.tooltipText, fontSize: 11, opacity: 0.7, marginBottom: 2 }}
					cursor={{ fill: t.text, fillOpacity: 0.06 }}
					itemStyle={{ color: t.tooltipText }}
				/>
				<Bar
					dataKey='value'
					fill={t.bar}
					radius={[3, 3, 0, 0]}
					maxBarSize={36}
					isAnimationActive={false}
				/>
			</BarChart>
		</ResponsiveContainer>
	);
};

export const SharePie: React.FC<{
	data: { name: string; value: number }[];
	height?: number;
	formatter?: (v: number) => string;
	centerLabel?: string;
}> = ({ data, height = 240, formatter, centerLabel }) => {
	const t = useThemeTokens();
	const fmt = formatter || ((v: number) => `${v.toFixed(2)}%`);
	return (
		<div style={{ position: 'relative' }}>
			<ResponsiveContainer
				width='100%'
				height={height}
			>
				<PieChart>
					<Pie
						data={data}
						dataKey='value'
						nameKey='name'
						cx='50%'
						cy='50%'
						innerRadius={56}
						outerRadius={92}
						paddingAngle={2}
						stroke='var(--bg-elev)'
						strokeWidth={2}
						isAnimationActive={false}
					>
						{data.map((_, i) => (
							<Cell
								key={i}
								fill={t.pie[i % t.pie.length]}
							/>
						))}
					</Pie>
					<Tooltip
						contentStyle={tooltipStyle(t.tooltipBg, t.tooltipText)}
						formatter={(v: any, name: any) => [fmt(Number(v)), String(name)]}
						separator=' · '
						itemStyle={{ color: t.tooltipText }}
					/>
				</PieChart>
			</ResponsiveContainer>
			{centerLabel && (
				<div
					style={{
						position: 'absolute',
						top: 0,
						left: 0,
						right: 0,
						bottom: 0,
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						pointerEvents: 'none'
					}}
				>
					<span
						style={{
							fontFamily: "'Source Serif 4', Georgia, serif",
							fontSize: 18,
							fontWeight: 600,
							color: 'var(--text)',
							lineHeight: 1,
							letterSpacing: '-0.01em'
						}}
					>
						{centerLabel}
					</span>
				</div>
			)}
		</div>
	);
};

export const InlineBar: React.FC<{ percent: number; tone?: 'accent' | 'neutral' }> = ({ percent, tone = 'accent' }) => (
	<div className='h-1.5 w-full overflow-hidden rounded-full bg-[var(--border-strong)]'>
		<div
			className='h-full rounded-full transition-all'
			style={{ width: `${Math.min(100, Math.max(0, percent))}%`, background: tone === 'accent' ? 'var(--accent)' : 'var(--text)' }}
		/>
	</div>
);
