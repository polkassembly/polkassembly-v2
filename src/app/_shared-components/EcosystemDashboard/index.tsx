// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

/* eslint-disable react/function-component-definition, react/button-has-type, @typescript-eslint/no-explicit-any, react/no-array-index-key, lines-around-directive, @typescript-eslint/no-shadow, default-case, consistent-return */

'use client';

import React, { useMemo, useState } from 'react';
import { IEcosystemDashboardData, IGovernanceInterface, ITimePoint, ITreasuryRevenue } from '@/_shared/_data/ecosystem-dashboard/types';
import { InlineBar, QuarterBarChart, SharePie, TimeAreaChart, YearBarChart } from './charts';
import { BrandMark, PlatformMark, ThemeToggle } from './theme';

interface Props {
	initialData: IEcosystemDashboardData;
}

type TabKey = 'overview' | 'economy' | 'treasury' | 'governance' | 'multisig' | 'network';

const TABS: { key: TabKey; label: string }[] = [
	{ key: 'overview', label: 'Overview' },
	{ key: 'economy', label: 'Economy' },
	{ key: 'treasury', label: 'Treasury' },
	{ key: 'governance', label: 'Governance' },
	{ key: 'multisig', label: 'Multisig' },
	{ key: 'network', label: 'Network' }
];

const fmtUsd = (n: number): string => {
	if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(2).replace(/\.?0+$/, '')}B`;
	if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(n >= 100_000_000 ? 0 : 1)}M`;
	if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
	return `$${n.toFixed(0)}`;
};

const fmtNum = (n: number): string => {
	if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
	if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
	return n.toLocaleString();
};

const formatDate = (iso: string): string => {
	try {
		const d = new Date(iso);
		return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
	} catch {
		return iso;
	}
};

// ---------- Primitives ----------

const Panel: React.FC<{ title?: React.ReactNode; toolbar?: React.ReactNode; children: React.ReactNode; className?: string; padding?: 'normal' | 'tight' | 'flush' }> = ({
	title,
	toolbar,
	children,
	className = '',
	padding = 'normal'
}) => (
	<div className={`overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--bg-elev)] shadow-card ${className}`}>
		{(title || toolbar) && (
			<div className='flex items-center justify-between gap-3 border-b border-[var(--border)] px-4 py-3'>
				<div className='font-mono text-[10.5px] uppercase tracking-[0.18em] text-[var(--text-faint)]'>{title}</div>
				{toolbar && <div>{toolbar}</div>}
			</div>
		)}
		<div className={padding === 'flush' ? '' : padding === 'tight' ? 'p-3' : 'p-5'}>{children}</div>
	</div>
);

const Kpi: React.FC<{ label: string; value: string; sub?: string }> = ({ label, value, sub }) => (
	<div className='rounded-lg border border-[var(--border)] bg-[var(--bg-elev)] p-4 transition hover:border-[var(--border-strong)]'>
		<div className='text-[10px] font-medium uppercase tracking-[0.16em] text-[var(--text-faint)]'>{label}</div>
		<div className='mt-1.5 font-serif text-[24px] font-semibold tabular-nums leading-none text-[var(--text)]'>{value}</div>
		{sub && <div className='mt-1.5 text-[11.5px] leading-snug text-[var(--text-muted)]'>{sub}</div>}
	</div>
);

const SegToggle: React.FC<{ value: string; onChange: (v: string) => void; options: string[] }> = ({ value, onChange, options }) => (
	<div className='inline-flex rounded-md border border-[var(--border)] p-0.5'>
		{options.map((o) => (
			<button
				key={o}
				onClick={() => onChange(o)}
				className={`rounded px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em] transition ${
					value === o ? 'bg-[var(--text)] text-[var(--bg-elev)]' : 'text-[var(--text-faint)] hover:text-[var(--text)]'
				}`}
			>
				{o}
			</button>
		))}
	</div>
);

const StatusPill: React.FC<{ live: boolean; asOf: string }> = ({ live, asOf }) => (
	<div className='inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--bg-elev)] px-3 py-1'>
		<span className='relative flex h-2 w-2'>
			{live && <span className='absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--accent)] opacity-60' />}
			<span className='relative inline-flex h-2 w-2 rounded-full bg-[var(--accent)]' />
		</span>
		<span className='font-mono text-[10.5px] uppercase tracking-[0.18em] text-[var(--text-muted)]'>
			{live ? 'Live data' : 'Static snapshot'} · {new Date(asOf).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
		</span>
	</div>
);

// Collapsible per-proposal breakdown of treasury revenue. Each row links to
// the Polkassembly proposal so the numbers can be independently verified.
const RevenueProposalList: React.FC<{ revenue: ITreasuryRevenue }> = ({ revenue }) => {
	const [open, setOpen] = useState(false);
	const fmtRevUsd = (n: number) => (n >= 1_000_000 ? `$${(n / 1_000_000).toFixed(2)}M` : n >= 1_000 ? `$${(n / 1_000).toFixed(0)}K` : `$${n.toFixed(0)}`);
	const formatDate = (iso: string): string => {
		try {
			return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
		} catch {
			return iso;
		}
	};
	return (
		<div className='mt-4 border-t border-[var(--border)] pt-3'>
			<button
				onClick={() => setOpen((v) => !v)}
				className='flex w-full items-center justify-between text-left font-mono text-[10.5px] uppercase tracking-[0.14em] text-[var(--text-faint)] transition hover:text-[var(--text)]'
			>
				<span>
					{open ? '▾' : '▸'} Revenue breakdown · {revenue.proposals.length} proposals
				</span>
				<span className='font-serif text-[12px] normal-case tracking-normal text-[var(--text-muted)]'>{fmtRevUsd(revenue.totalUsd)} total</span>
			</button>
			{open && (
				<div className='mt-3 overflow-x-auto rounded-md border border-[var(--border)]'>
					<table className='w-full min-w-[560px] border-collapse text-[12px]'>
						<thead>
							<tr className='border-b border-[var(--border)] bg-[var(--bg-soft)] text-left'>
								<th className='px-3 py-2 font-mono text-[9.5px] uppercase tracking-[0.14em] text-[var(--text-faint)]'>Date</th>
								<th className='px-3 py-2 font-mono text-[9.5px] uppercase tracking-[0.14em] text-[var(--text-faint)]'>Proposal</th>
								<th className='px-3 py-2 font-mono text-[9.5px] uppercase tracking-[0.14em] text-[var(--text-faint)]'>Payment</th>
								<th className='px-3 py-2 text-right font-mono text-[9.5px] uppercase tracking-[0.14em] text-[var(--text-faint)]'>USD</th>
							</tr>
						</thead>
						<tbody>
							{revenue.proposals.map((p) => (
								<tr
									key={`${p.type}-${p.idx}`}
									className='border-b border-[var(--border)] transition last:border-b-0 hover:bg-[var(--bg-soft)]'
								>
									<td className='whitespace-nowrap px-3 py-2 tabular-nums text-[var(--text-muted)]'>{formatDate(p.date)}</td>
									<td className='px-3 py-2'>
										<a
											href={p.url}
											target='_blank'
											rel='noopener noreferrer'
											className='text-[var(--text)] hover:text-[var(--accent)] hover:underline'
										>
											{p.type === 'referendum' ? `Ref #${p.idx}` : `Treasury #${p.idx}`} — {p.title}
										</a>
									</td>
									<td className='px-3 py-2 tabular-nums text-[var(--text-muted)]'>{p.payment}</td>
									<td className='px-3 py-2 text-right tabular-nums text-[var(--text)]'>{fmtRevUsd(p.usd)}</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}
		</div>
	);
};

// Polkassembly / Subsquare platform card — Revenue headline tile at top,
// 6-stat grid below, collapsible per-proposal breakdown, home URL footer.
// One shared component so the two cards stay visually identical.
const PlatformInterfaceCard: React.FC<{ data: IGovernanceInterface; sharePillLabel: string }> = ({ data, sharePillLabel }) => {
	const fmtRevUsd = (n: number) => (n >= 1_000_000 ? `$${(n / 1_000_000).toFixed(2)}M` : n >= 1_000 ? `$${(n / 1_000).toFixed(0)}K` : `$${n.toFixed(0)}`);
	return (
		<Panel
			title={
				<span className='inline-flex items-center gap-2'>
					<PlatformMark
						name={data.name}
						size={14}
					/>
					{data.name}
				</span>
			}
		>
			<div className='mb-3 flex items-baseline justify-between gap-4'>
				<p className='text-[13px] leading-6 text-[var(--text-muted)]'>{data.role}</p>
				<span className='shrink-0 rounded-full border border-[var(--border-strong)] bg-[var(--bg-soft)] px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.18em] text-[var(--text-muted)]'>
					{sharePillLabel}
				</span>
			</div>

			{data.revenue && (
				<div className='border-t border-[var(--border)] pt-3'>
					<div className='font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--text-faint)]'>Revenue · Polkadot treasury</div>
					<div className='mt-0.5 font-serif text-[28px] font-semibold tabular-nums leading-none text-[var(--text)]'>{fmtRevUsd(data.revenue.totalUsd)}</div>
				</div>
			)}

			<div className='mt-4 grid grid-cols-2 gap-x-6 gap-y-4 border-t border-[var(--border)] pt-4 md:grid-cols-3'>
				{data.stats.map((s) => (
					<div key={s.label}>
						<div className='text-[10px] font-medium uppercase tracking-[0.14em] text-[var(--text-faint)]'>{s.label}</div>
						<div className='mt-0.5 font-serif text-[18px] font-semibold tabular-nums'>{s.value}</div>
						{s.sub && <div className='mt-0.5 text-[11px] text-[var(--text-muted)]'>{s.sub}</div>}
					</div>
				))}
			</div>

			{data.revenue && <RevenueProposalList revenue={data.revenue} />}

			<div className='mt-4 border-t border-[var(--border)] pt-3'>
				<a
					href={data.homeUrl}
					target='_blank'
					rel='noopener noreferrer'
					className='font-mono text-[11px] text-[var(--accent)] hover:underline'
				>
					{data.homeUrl.replace(/^https?:\/\//, '')} ↗
				</a>
			</div>
		</Panel>
	);
};

const sliceTimeline = <T extends ITimePoint>(data: T[], range: string): T[] => {
	if (range === 'All') return data;
	if (range === '1Y') return data.slice(-3);
	if (range === '2Y') return data.slice(-5);
	return data;
};

// ---------- Tabs ----------

const OverviewTab: React.FC<{ d: IEcosystemDashboardData }> = ({ d }) => {
	const maxTvl = Math.max(...d.defi.topProtocols.map((p) => p.tvlUsd));
	const maxTx = Math.max(...d.infrastructure.topParachains.map((p) => p.transactionsMillions));
	return (
		<div className='space-y-6'>
			<div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5'>
				{d.hero.stats.map((s) => (
					<Kpi
						key={s.label}
						label={s.label}
						value={s.value}
						sub={s.sub}
					/>
				))}
			</div>

			<div className='grid gap-6 lg:grid-cols-2'>
				<Panel title='Network market cap · 2020 — present'>
					<TimeAreaChart
						data={d.economy.priceTimeline}
						annotatePeak
						valueLabel='Market cap'
					/>
					<div className='mt-3 grid grid-cols-3 gap-4 border-t border-[var(--border)] pt-3 text-[11.5px]'>
						<div>
							<div className='text-[var(--text-faint)]'>Spot</div>
							<div className='mt-0.5 font-serif text-[15px] font-semibold tabular-nums'>{d.economy.priceDisplay}</div>
						</div>
						<div>
							<div className='text-[var(--text-faint)]'>Market cap</div>
							<div className='mt-0.5 font-serif text-[15px] font-semibold tabular-nums'>{d.economy.marketCapDisplay}</div>
						</div>
						<div>
							<div className='text-[var(--text-faint)]'>ATH (Nov 4, 2021)</div>
							<div className='mt-0.5 font-serif text-[15px] font-semibold tabular-nums'>${d.economy.athPriceUsd.toFixed(2)}</div>
						</div>
					</div>
				</Panel>

				<Panel title='Treasury balance · USD-equivalent'>
					<TimeAreaChart
						data={d.treasury.balanceTimeline}
						height={280}
						annotatePeak
						valueLabel='Treasury'
					/>
					<div className='mt-3 grid grid-cols-2 gap-4 border-t border-[var(--border)] pt-3 text-[11.5px]'>
						<div>
							<div className='text-[var(--text-faint)]'>Current</div>
							<div className='mt-0.5 font-serif text-[15px] font-semibold tabular-nums'>{fmtUsd(d.treasury.currentUsd)}</div>
						</div>
						<div>
							<div className='text-[var(--text-faint)]'>Peak · Jan 2022</div>
							<div className='mt-0.5 font-serif text-[15px] font-semibold tabular-nums'>{fmtUsd(d.treasury.peakUsd)}</div>
							<div className='mt-0.5 text-[10px] text-[var(--text-dim)]'>76M DOT at peak balance</div>
						</div>
					</div>
				</Panel>
			</div>

			<div className='grid gap-6 lg:grid-cols-2'>
				<Panel
					title='DeFi · top protocols by TVL'
					padding='flush'
				>
					<table className='w-full border-collapse text-[13px]'>
						<tbody>
							{d.defi.topProtocols.slice(0, 6).map((p) => (
								<tr
									key={p.name}
									className='border-b border-[var(--border)] transition last:border-b-0 hover:bg-[var(--bg-soft)]'
								>
									<td className='px-4 py-2.5'>
										<div className='flex items-center gap-2'>
											<BrandMark
												name={p.name}
												size={20}
											/>
											<div>
												<div className='font-medium text-[var(--text)]'>{p.name}</div>
												<div className='flex items-center gap-1.5 text-[10.5px] text-[var(--text-faint)]'>
													<BrandMark
														name={p.chain}
														size={13}
													/>
													<span>
														{p.chain} · {p.category}
													</span>
												</div>
											</div>
										</div>
									</td>
									<td className='w-1/3 px-4 py-2.5'>
										<InlineBar
											percent={(p.tvlUsd / maxTvl) * 100}
											tone='neutral'
										/>
									</td>
									<td className='w-20 px-4 py-2.5 text-right tabular-nums text-[var(--text)]'>{fmtUsd(p.tvlUsd)}</td>
								</tr>
							))}
						</tbody>
					</table>
					<div className='border-t border-[var(--border)] px-4 py-2.5 text-[11px] text-[var(--text-faint)]'>
						DefiLlama ecosystem TVL&nbsp;<span className='font-medium tabular-nums text-[var(--text)]'>{fmtUsd(d.defi.totalEcosystemTvlUsd)}</span>
						{d.defi.stablecoinSupplyUsd ? (
							<>
								{' '}
								· Stablecoins on AssetHub&nbsp;<span className='font-medium tabular-nums text-[var(--text)]'>{fmtUsd(d.defi.stablecoinSupplyUsd)}</span>
							</>
						) : null}
					</div>
				</Panel>

				<Panel
					title='Top parachains by transaction volume · Q1 2025'
					padding='flush'
				>
					<table className='w-full border-collapse text-[13px]'>
						<tbody>
							{d.infrastructure.topParachains.map((p) => (
								<tr
									key={p.name}
									className='border-b border-[var(--border)] transition last:border-b-0 hover:bg-[var(--bg-soft)]'
								>
									<td className='px-4 py-2.5'>
										<div className='flex items-center gap-2 font-medium text-[var(--text)]'>
											<BrandMark
												name={p.name}
												size={20}
											/>
											<span>{p.name}</span>
										</div>
									</td>
									<td className='w-1/3 px-4 py-2.5'>
										<InlineBar
											percent={(p.transactionsMillions / maxTx) * 100}
											tone='neutral'
										/>
									</td>
									<td className='w-20 px-4 py-2.5 text-right tabular-nums text-[var(--text-muted)]'>{p.transactionsMillions.toFixed(1)}M</td>
									<td className='w-12 px-4 py-2.5 text-right tabular-nums text-[var(--text-faint)]'>{p.sharePercent.toFixed(1)}%</td>
								</tr>
							))}
						</tbody>
					</table>
					<div className='border-t border-[var(--border)] px-4 py-2.5 text-[11px] text-[var(--text-faint)]'>
						Q1 2025 ecosystem total <span className='font-medium tabular-nums text-[var(--text)]'>{d.infrastructure.q1TransactionsMillions.toFixed(1)}M</span> transactions · −36.9%
						QoQ
					</div>
				</Panel>
			</div>

			<div className='grid gap-6 lg:grid-cols-3'>
				<Panel
					title='OpenGov referenda · per quarter'
					className='lg:col-span-2'
				>
					<QuarterBarChart
						data={d.openGov.referendaPerQuarter}
						height={200}
						valueLabel='Referenda'
					/>
					<div className='mt-3 grid grid-cols-3 gap-4 border-t border-[var(--border)] pt-3 text-[11.5px]'>
						<div>
							<div className='text-[var(--text-faint)]'>Lifetime referenda</div>
							<div className='mt-0.5 font-serif text-[15px] font-semibold tabular-nums'>{d.openGov.totalReferenda.toLocaleString()}+</div>
						</div>
						<div>
							<div className='text-[var(--text-faint)]'>Approval rate</div>
							<div className='mt-0.5 font-serif text-[15px] font-semibold tabular-nums'>{d.openGov.approvalRatePercent}%</div>
						</div>
						<div>
							<div className='text-[var(--text-faint)]'>Origin tracks</div>
							<div className='mt-0.5 font-serif text-[15px] font-semibold tabular-nums'>{d.openGov.originTracks}</div>
						</div>
					</div>
				</Panel>

				<Panel title='Staking · consensus'>
					<div className='grid grid-cols-2 gap-x-4 gap-y-4'>
						<div>
							<div className='text-[10px] font-medium uppercase tracking-[0.14em] text-[var(--text-faint)]'>Validators</div>
							<div className='mt-0.5 font-serif text-[18px] font-semibold tabular-nums'>{d.economy.activeValidators.toLocaleString()}</div>
						</div>
						<div>
							<div className='text-[10px] font-medium uppercase tracking-[0.14em] text-[var(--text-faint)]'>Nominators</div>
							<div className='mt-0.5 font-serif text-[18px] font-semibold tabular-nums'>{fmtNum(d.economy.activeNominators)}</div>
						</div>
						<div>
							<div className='text-[10px] font-medium uppercase tracking-[0.14em] text-[var(--text-faint)]'>Staking APY</div>
							<div className='mt-0.5 font-serif text-[18px] font-semibold tabular-nums'>{d.economy.stakingApyPercent.toFixed(2)}%</div>
						</div>
						<div>
							<div className='text-[10px] font-medium uppercase tracking-[0.14em] text-[var(--text-faint)]'>Staked supply</div>
							<div className='mt-0.5 font-serif text-[18px] font-semibold tabular-nums'>{d.economy.stakedRatioPercent.toFixed(1)}%</div>
						</div>
						<div>
							<div className='text-[10px] font-medium uppercase tracking-[0.14em] text-[var(--text-faint)]'>XCM messages (lifetime)</div>
							<div className='mt-0.5 font-serif text-[18px] font-semibold tabular-nums'>{fmtNum(d.xcm.totalMessagesAllTime)}</div>
						</div>
						<div>
							<div className='text-[10px] font-medium uppercase tracking-[0.14em] text-[var(--text-faint)]'>Open channels</div>
							<div className='mt-0.5 font-serif text-[18px] font-semibold tabular-nums'>{d.xcm.openChannels}</div>
						</div>
					</div>
				</Panel>
			</div>
		</div>
	);
};

const EconomyTab: React.FC<{ d: IEcosystemDashboardData }> = ({ d }) => {
	const [range, setRange] = useState('All');
	const data = sliceTimeline(d.economy.priceTimeline, range);
	return (
		<div className='space-y-6'>
			<div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
				<Kpi
					label='DOT spot price'
					value={d.economy.priceDisplay}
					sub={`Market cap ${d.economy.marketCapDisplay}`}
				/>
				<Kpi
					label='All-time high'
					value={`$${d.economy.athPriceUsd.toFixed(2)}`}
					sub={formatDate(d.economy.athPriceDate)}
				/>
				<Kpi
					label='Peak market cap'
					value='$53B'
					sub='Nov 4, 2021'
				/>
				<Kpi
					label='Circulating supply'
					value={`${(d.economy.circulatingSupplyDot / 1_000_000_000).toFixed(2)}B`}
					sub={`${(d.economy.stakedDot / 1_000_000).toFixed(0)}M staked · ${d.economy.stakedRatioPercent.toFixed(1)}%`}
				/>
			</div>

			<Panel
				title='Network market cap · USD'
				toolbar={
					<SegToggle
						value={range}
						onChange={setRange}
						options={['1Y', '2Y', '5Y', 'All']}
					/>
				}
			>
				<TimeAreaChart
					data={data}
					height={320}
					annotatePeak
					valueLabel='Market cap'
				/>
			</Panel>

			<div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
				<Kpi
					label='Active validators'
					value={d.economy.activeValidators.toLocaleString()}
					sub='Relay-chain block production'
				/>
				<Kpi
					label='Active nominators'
					value={fmtNum(d.economy.activeNominators)}
					sub='Stakers backing validators'
				/>
				<Kpi
					label='Staking APY'
					value={`${d.economy.stakingApyPercent.toFixed(2)}%`}
					sub='Average annual return on staked DOT'
				/>
				<Kpi
					label='Nakamoto coefficient'
					value={String(d.economy.nakamotoCoefficient)}
					sub='Min. entities required to halt block production'
				/>
			</div>
		</div>
	);
};

const TreasuryTab: React.FC<{ d: IEcosystemDashboardData }> = ({ d }) => {
	const [range, setRange] = useState('All');
	const [catYear, setCatYear] = useState<'2024' | '2025'>('2024');
	const series = sliceTimeline(d.treasury.balanceTimeline, range);
	const cat = d.treasury.categoryBreakdown.find((c) => c.year === catYear) || d.treasury.categoryBreakdown[0];
	return (
		<div className='space-y-6'>
			<div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
				<Kpi
					label='Current balance'
					value={fmtUsd(d.treasury.currentUsd)}
					sub={`${(d.treasury.currentDot / 1_000_000).toFixed(0)}M DOT on relay chain`}
				/>
				<Kpi
					label='Peak USD value'
					value={fmtUsd(d.treasury.peakUsd)}
					sub='Jan 2022 · 76M DOT at peak balance'
				/>
				<Kpi
					label='Cumulative deployed'
					value={fmtUsd(d.treasury.cumulativeDeployedUsd)}
					sub='2020 — 2025 lifetime disbursements'
				/>
				<Kpi
					label='2024 peak-year spend'
					value={fmtUsd(133_000_000)}
					sub='20.1M DOT — highest annual spend on record'
				/>
			</div>

			<Panel
				title='Treasury balance · USD-equivalent'
				toolbar={
					<SegToggle
						value={range}
						onChange={setRange}
						options={['2Y', '5Y', 'All']}
					/>
				}
			>
				<TimeAreaChart
					data={series}
					height={300}
					annotatePeak
					valueLabel='Treasury'
				/>
			</Panel>

			<div className='grid gap-6 lg:grid-cols-2'>
				<Panel title='Annual treasury deployment'>
					<YearBarChart
						data={d.treasury.annualSpend}
						height={240}
						valueLabel='Treasury spend'
					/>
					<div className='mt-3 grid grid-cols-4 gap-3 border-t border-[var(--border)] pt-3'>
						{d.treasury.annualSpend.map((y) => (
							<div key={y.year}>
								<div className='font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--text-faint)]'>
									{y.year.replace('*', '')}
									{y.year.endsWith('*') && <span className='text-[var(--accent)]'>*</span>}
								</div>
								<div className='mt-0.5 font-serif text-[15px] font-semibold tabular-nums'>{fmtUsd(y.usd)}</div>
							</div>
						))}
					</div>
					{d.treasury.annualSpend.some((y) => y.year.endsWith('*')) && (
						<p className='mt-1.5 text-[10px] text-[var(--text-dim)]'>* Partial-year estimate based on available quarterly reports</p>
					)}
				</Panel>

				<Panel
					title='Spend by category'
					toolbar={
						<SegToggle
							value={catYear}
							onChange={(v) => setCatYear(v as '2024' | '2025')}
							options={['2024', '2025']}
						/>
					}
				>
					<table className='w-full border-collapse text-[13px]'>
						<tbody>
							{cat.categories.map((c, i) => (
								<tr
									key={c.name}
									className={`transition hover:bg-[var(--bg-soft)] ${i === 0 ? '' : 'border-t border-[var(--border)]'}`}
								>
									<td className='py-2.5 text-[var(--text-muted)]'>{c.name}</td>
									<td className='py-2.5'>
										<InlineBar
											percent={c.sharePercent * 2.5}
											tone='neutral'
										/>
									</td>
									<td className='w-20 py-2.5 pl-3 text-right tabular-nums text-[var(--text)]'>{fmtUsd(c.usd)}</td>
									<td className='w-12 py-2.5 pl-3 text-right tabular-nums text-[var(--text-faint)]'>{c.sharePercent}%</td>
								</tr>
							))}
						</tbody>
					</table>
				</Panel>
			</div>
		</div>
	);
};

const GovernanceTab: React.FC<{ d: IEcosystemDashboardData }> = ({ d }) => {
	const polkassembly = d.governanceInterfaces.interfaces.find((i) => i.name === 'Polkassembly')!;
	const subsquare = d.governanceInterfaces.interfaces.find((i) => i.name === 'Subsquare')!;
	return (
		<div className='space-y-6'>
			<div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
				<Kpi
					label='Lifetime referenda'
					value={`${d.openGov.totalReferenda.toLocaleString()}+`}
					sub={`${d.openGov.openGovReferenda.toLocaleString()} OpenGov · ${d.openGov.govV1Proposals} Gov V1`}
				/>
				<Kpi
					label='Origin tracks'
					value={String(d.openGov.originTracks)}
					sub='Specialised lanes with distinct quora'
				/>
				<Kpi
					label='Approval rate'
					value={`${d.openGov.approvalRatePercent}%`}
					sub={`${d.openGov.rejectionRatePercent}% rejected vs 9% under Gov V1`}
				/>
				<Kpi
					label='Median voter turnout'
					value={`${d.openGov.medianTurnoutPercent}%`}
					sub='Of staked DOT participating per referendum'
				/>
			</div>

			<Panel title='OpenGov referenda · per quarter'>
				<QuarterBarChart
					data={d.openGov.referendaPerQuarter}
					height={260}
					valueLabel='Referenda'
				/>
			</Panel>

			<div className='rounded-lg border border-[var(--border)] bg-[var(--bg-soft)] px-4 py-3 text-[12.5px] leading-6 text-[var(--text-muted)]'>
				{d.governanceInterfaces.overview}
			</div>

			<div className='grid gap-6 lg:grid-cols-3'>
				<div className='space-y-6 lg:col-span-2'>
					<PlatformInterfaceCard
						data={polkassembly}
						sharePillLabel='95.7% share'
					/>

					<PlatformInterfaceCard
						data={subsquare}
						sharePillLabel='4.0% share'
					/>
				</div>

				<Panel title='Discussion volume share'>
					<div className='mb-2 text-[11px] text-[var(--text-faint)]'>By primary thread origin — not comment volume</div>
					<SharePie
						data={d.governanceInterfaces.discussionShare.map((x) => ({ name: x.name, value: x.sharePercent }))}
						height={220}
						centerLabel='95.7%'
					/>
					<div className='mt-3 space-y-2 border-t border-[var(--border)] pt-3'>
						{d.governanceInterfaces.discussionShare.map((x, i) => (
							<div
								key={x.name}
								className='flex items-center justify-between text-[12px]'
							>
								<div className='flex items-center gap-2'>
									<span
										className='inline-block h-2.5 w-2.5 rounded-sm'
										style={{ background: `var(--pie-${(i % 5) + 1})` }}
									/>
									<PlatformMark
										name={x.name}
										size={16}
									/>
									<span className='text-[var(--text-muted)]'>{x.name}</span>
								</div>
								<span className='font-medium tabular-nums text-[var(--text)]'>{x.sharePercent.toFixed(2)}%</span>
							</div>
						))}
					</div>
					<p className='mt-4 border-t border-[var(--border)] pt-3 text-[11px] leading-5 text-[var(--text-faint)]'>{d.governanceInterfaces.commentSyncNote}</p>
				</Panel>
			</div>
		</div>
	);
};

const MultisigTab: React.FC<{ d: IEcosystemDashboardData }> = ({ d }) => {
	const [view, setView] = useState<'Current' | 'Peak'>('Current');
	const [sortKey, setSortKey] = useState<'name' | 'peak' | 'current'>('current');
	const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
	const handleSort = (key: 'name' | 'peak' | 'current') => {
		if (key === sortKey) {
			setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
		} else {
			setSortKey(key);
			setSortDir(key === 'name' ? 'asc' : 'desc');
		}
	};
	const sorted = useMemo(() => {
		const arr = [...d.multisig.platforms];
		arr.sort((a, b) => {
			if (sortKey === 'name') return sortDir === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
			if (sortKey === 'peak') return sortDir === 'asc' ? a.peakAumUsd - b.peakAumUsd : b.peakAumUsd - a.peakAumUsd;
			return sortDir === 'asc' ? a.currentAumUsd - b.currentAumUsd : b.currentAumUsd - a.currentAumUsd;
		});
		return arr;
	}, [d.multisig.platforms, sortKey, sortDir]);
	const maxPeakAum = Math.max(...d.multisig.platforms.map((p) => p.peakAumUsd));
	const maxCurrentAum = Math.max(...d.multisig.platforms.map((p) => p.currentAumUsd));
	const shareData = sorted.map((p) => ({ name: p.name, value: view === 'Current' ? p.currentSharePercent : p.peakSharePercent }));

	return (
		<div className='space-y-6'>
			<div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
				<Kpi
					label='Network multisig AUM · peak'
					value={fmtUsd(d.multisig.totalPeakAumUsd)}
					sub='Q4 2021 — Q2 2022 cycle'
				/>
				<Kpi
					label='Network multisig AUM · current'
					value={fmtUsd(d.multisig.totalCurrentAumUsd)}
					sub='Across all multisig surfaces'
				/>
				<Kpi
					label='Active platforms'
					value={String(d.multisig.platforms.length)}
					sub='UIs wrapping the Substrate multisig pallet'
				/>
				<Kpi
					label='Recovery from peak'
					value={`${Math.round((d.multisig.totalCurrentAumUsd / d.multisig.totalPeakAumUsd) * 100)}%`}
					sub='Current AUM as a share of peak'
				/>
			</div>

			<div className='grid gap-6 lg:grid-cols-3'>
				<Panel
					title='AUM share by platform'
					toolbar={
						<SegToggle
							value={view}
							onChange={(v) => setView(v as 'Current' | 'Peak')}
							options={['Current', 'Peak']}
						/>
					}
					className='lg:col-span-1'
				>
					<SharePie
						data={shareData}
						height={220}
						formatter={(v) => `${v}%`}
					/>
					<div className='mt-3 space-y-2 border-t border-[var(--border)] pt-3'>
						{sorted.map((p, i) => (
							<div
								key={p.name}
								className='flex items-center justify-between text-[12px]'
							>
								<div className='flex items-center gap-2'>
									<span
										className='inline-block h-2.5 w-2.5 rounded-sm'
										style={{ background: `var(--pie-${(i % 5) + 1})` }}
									/>
									<PlatformMark
										name={p.name}
										size={16}
									/>
									<span className='text-[var(--text-muted)]'>{p.name}</span>
								</div>
								<span className='font-medium tabular-nums text-[var(--text)]'>{view === 'Current' ? p.currentSharePercent : p.peakSharePercent}%</span>
							</div>
						))}
					</div>
				</Panel>

				<Panel
					title='Platform comparison'
					className='lg:col-span-2'
					padding='flush'
				>
					<div className='overflow-x-auto'>
						<table className='w-full min-w-[640px] border-collapse text-[13px]'>
							<thead>
								<tr className='border-b border-[var(--border)] bg-[var(--bg-soft)] text-left'>
									<th
										aria-label='Sort by platform name'
										className='cursor-pointer px-4 py-3 font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--text-faint)] hover:text-[var(--text)]'
										onClick={() => handleSort('name')}
									>
										Platform {sortKey === 'name' && <span className='ml-0.5 text-[var(--accent)]'>{sortDir === 'asc' ? '↑' : '↓'}</span>}
									</th>
									<th
										aria-label='Sort by peak AUM'
										className='cursor-pointer px-4 py-3 font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--text-faint)] hover:text-[var(--text)]'
										onClick={() => handleSort('peak')}
									>
										Peak AUM {sortKey === 'peak' && <span className='ml-0.5 text-[var(--accent)]'>{sortDir === 'asc' ? '↑' : '↓'}</span>}
									</th>
									<th
										aria-label='Sort by current AUM'
										className='cursor-pointer px-4 py-3 font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--text-faint)] hover:text-[var(--text)]'
										onClick={() => handleSort('current')}
									>
										Current AUM {sortKey === 'current' && <span className='ml-0.5 text-[var(--accent)]'>{sortDir === 'asc' ? '↑' : '↓'}</span>}
									</th>
									<th className='px-4 py-3 text-right font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--text-faint)]'>Open</th>
								</tr>
							</thead>
							<tbody>
								{sorted.map((p) => (
									<tr
										key={p.name}
										className='border-b border-[var(--border)] transition last:border-b-0 hover:bg-[var(--bg-soft)]'
									>
										<td className='px-4 py-4 align-top'>
											<div className='flex items-center gap-2'>
												<PlatformMark
													name={p.name}
													size={20}
												/>
												<div className='font-serif text-[14px] font-semibold text-[var(--text)]'>{p.name}</div>
											</div>
											<div className='mt-1 max-w-md text-[11.5px] leading-snug text-[var(--text-muted)]'>{p.role}</div>
										</td>
										<td className='px-4 py-4 align-top'>
											<div className='font-serif text-[15px] font-semibold tabular-nums'>{fmtUsd(p.peakAumUsd)}</div>
											<div className='mb-1.5 mt-1 text-[10.5px] text-[var(--text-faint)]'>{p.peakSharePercent}% peak share</div>
											<InlineBar
												percent={(p.peakAumUsd / maxPeakAum) * 100}
												tone='neutral'
											/>
										</td>
										<td className='px-4 py-4 align-top'>
											<div className='font-serif text-[15px] font-semibold tabular-nums'>{fmtUsd(p.currentAumUsd)}</div>
											<div className='mb-1.5 mt-1 text-[10.5px] text-[var(--text-faint)]'>{p.currentSharePercent}% current share</div>
											<InlineBar
												percent={(p.currentAumUsd / maxCurrentAum) * 100}
												tone='neutral'
											/>
										</td>
										<td className='px-4 py-4 text-right align-top text-[12px]'>
											<a
												href={p.homeUrl}
												target='_blank'
												rel='noopener noreferrer'
												className='font-mono text-[11px] text-[var(--accent)] hover:underline'
											>
												visit ↗
											</a>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</Panel>
			</div>

			<Panel title='How multisigs work on Polkadot'>
				<p className='text-[13px] leading-7 text-[var(--text-muted)]'>{d.multisig.overview}</p>
			</Panel>
		</div>
	);
};

const NetworkTab: React.FC<{ d: IEcosystemDashboardData }> = ({ d }) => {
	const [sort, setSort] = useState<'volume' | 'name'>('volume');
	const rows = useMemo(() => {
		const arr = [...d.infrastructure.topParachains];
		if (sort === 'name') arr.sort((a, b) => a.name.localeCompare(b.name));
		else arr.sort((a, b) => b.transactionsMillions - a.transactionsMillions);
		return arr;
	}, [d.infrastructure.topParachains, sort]);
	const maxVol = Math.max(...d.infrastructure.topParachains.map((p) => p.transactionsMillions));
	const maxTvl = Math.max(...d.defi.topProtocols.map((p) => p.tvlUsd));

	return (
		<div className='space-y-6'>
			<div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
				<Kpi
					label='Active parachains'
					value={`${d.infrastructure.activeParachains}+`}
					sub='Including Asset Hub, Bridge Hub, Coretime'
				/>
				<Kpi
					label='Q1 2025 transactions'
					value={`${d.infrastructure.q1TransactionsMillions.toFixed(1)}M`}
					sub='Across all parachains; −36.9% QoQ'
				/>
				<Kpi
					label='Block / finality time'
					value={`${d.infrastructure.blockTimeSeconds}s · ${d.infrastructure.finalitySeconds}s`}
					sub='Relay-chain block production · GRANDPA'
				/>
				<Kpi
					label='Monthly active devs'
					value={`${d.infrastructure.monthlyActiveDevs}`}
					sub='Across Polkadot SDK ecosystem'
				/>
			</div>

			<div className='grid gap-6 lg:grid-cols-2'>
				<Panel
					title='Top parachains by transaction volume · Q1 2025'
					toolbar={
						<SegToggle
							value={sort}
							onChange={(v) => setSort(v as 'volume' | 'name')}
							options={['volume', 'name']}
						/>
					}
					padding='flush'
				>
					<table className='w-full border-collapse text-[13px]'>
						<thead>
							<tr className='border-b border-[var(--border)] bg-[var(--bg-soft)] text-left'>
								<th className='px-4 py-3 font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--text-faint)]'>Parachain</th>
								<th className='px-4 py-3 font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--text-faint)]'>Transactions</th>
								<th className='px-4 py-3 font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--text-faint)]'>Share</th>
								<th className='px-4 py-3 text-right font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--text-faint)]'>%</th>
							</tr>
						</thead>
						<tbody>
							{rows.map((p) => (
								<tr
									key={p.name}
									className='border-b border-[var(--border)] transition last:border-b-0 hover:bg-[var(--bg-soft)]'
								>
									<td className='px-4 py-3'>
										<div className='flex items-center gap-2 font-medium text-[var(--text)]'>
											<BrandMark
												name={p.name}
												size={20}
											/>
											<span>{p.name}</span>
										</div>
									</td>
									<td className='px-4 py-3 tabular-nums text-[var(--text-muted)]'>{p.transactionsMillions.toFixed(1)}M</td>
									<td className='px-4 py-3'>
										<InlineBar
											percent={(p.transactionsMillions / maxVol) * 100}
											tone='neutral'
										/>
									</td>
									<td className='px-4 py-3 text-right tabular-nums text-[var(--text-faint)]'>{p.sharePercent.toFixed(1)}%</td>
								</tr>
							))}
						</tbody>
					</table>
				</Panel>

				<Panel
					title='DeFi · top protocols by TVL'
					padding='flush'
				>
					<table className='w-full border-collapse text-[13px]'>
						<thead>
							<tr className='border-b border-[var(--border)] bg-[var(--bg-soft)] text-left'>
								<th className='px-4 py-3 font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--text-faint)]'>Protocol</th>
								<th className='px-4 py-3 font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--text-faint)]'>Chain</th>
								<th className='px-4 py-3 font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--text-faint)]'>TVL</th>
								<th className='px-4 py-3 text-right font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--text-faint)]'>USD</th>
							</tr>
						</thead>
						<tbody>
							{d.defi.topProtocols.map((p) => (
								<tr
									key={p.name}
									className='border-b border-[var(--border)] transition last:border-b-0 hover:bg-[var(--bg-soft)]'
								>
									<td className='px-4 py-3'>
										<div className='flex items-center gap-2'>
											<BrandMark
												name={p.name}
												size={20}
											/>
											<div>
												<div className='font-medium text-[var(--text)]'>{p.name}</div>
												<div className='text-[10.5px] text-[var(--text-faint)]'>{p.category}</div>
											</div>
										</div>
									</td>
									<td className='px-4 py-3 text-[var(--text-muted)]'>
										<div className='flex items-center gap-2'>
											<BrandMark
												name={p.chain}
												size={18}
											/>
											<span>{p.chain}</span>
										</div>
									</td>
									<td className='px-4 py-3'>
										<InlineBar
											percent={(p.tvlUsd / maxTvl) * 100}
											tone='neutral'
										/>
									</td>
									<td className='px-4 py-3 text-right tabular-nums text-[var(--text)]'>{fmtUsd(p.tvlUsd)}</td>
								</tr>
							))}
						</tbody>
					</table>
				</Panel>
			</div>

			<div className='grid gap-6 lg:grid-cols-2'>
				<Panel title='Cross-chain messaging · XCM'>
					<div className='grid grid-cols-2 gap-x-6 gap-y-4'>
						<div>
							<div className='text-[10px] font-medium uppercase tracking-[0.14em] text-[var(--text-faint)]'>Lifetime messages</div>
							<div className='mt-0.5 font-serif text-[20px] font-semibold tabular-nums'>{fmtNum(d.xcm.totalMessagesAllTime)}</div>
						</div>
						<div>
							<div className='text-[10px] font-medium uppercase tracking-[0.14em] text-[var(--text-faint)]'>Monthly average</div>
							<div className='mt-0.5 font-serif text-[20px] font-semibold tabular-nums'>{fmtNum(d.xcm.monthlyMessagesAvg)}</div>
						</div>
						<div>
							<div className='text-[10px] font-medium uppercase tracking-[0.14em] text-[var(--text-faint)]'>Connected chains</div>
							<div className='mt-0.5 font-serif text-[20px] font-semibold tabular-nums'>{d.xcm.connectedChains}</div>
						</div>
						<div>
							<div className='text-[10px] font-medium uppercase tracking-[0.14em] text-[var(--text-faint)]'>Open channels</div>
							<div className='mt-0.5 font-serif text-[20px] font-semibold tabular-nums'>{d.xcm.openChannels}+</div>
							<div className='mt-0.5 text-[10px] text-[var(--text-dim)]'>Messari Q1 2024 · count grows over time</div>
						</div>
					</div>
					<p className='mt-3 text-[11.5px] leading-5 text-[var(--text-faint)]'>
						XCM (Cross-Consensus Messaging) enables native token and data transfers between parachains without bridges or smart contracts.
					</p>
				</Panel>

				<Panel title='Coretime model'>
					<p className='text-[13px] leading-7 text-[var(--text-muted)]'>{d.infrastructure.coretimeNote}</p>
				</Panel>
			</div>
		</div>
	);
};

// ---------- Shell ----------

const EcosystemDashboard: React.FC<Props> = ({ initialData }) => {
	const d = initialData;
	const [tab, setTab] = useState<TabKey>('overview');

	const renderTab = () => {
		switch (tab) {
			case 'overview':
				return <OverviewTab d={d} />;
			case 'economy':
				return <EconomyTab d={d} />;
			case 'treasury':
				return <TreasuryTab d={d} />;
			case 'governance':
				return <GovernanceTab d={d} />;
			case 'multisig':
				return <MultisigTab d={d} />;
			case 'network':
				return <NetworkTab d={d} />;
		}
	};

	return (
		<div className='ecosystem-observatory flex w-full min-w-0 flex-1 flex-col bg-[var(--bg)] text-[var(--text)]'>
			<header className='no-print bg-[var(--bg)]/90 sticky top-0 z-30 border-b border-[var(--border)] backdrop-blur'>
				<div className='mx-auto flex max-w-[1400px] items-center gap-3 px-4 py-3 sm:gap-6 sm:px-6'>
					{/* Polkassembly logomark — clicking returns to the main Polkassembly app */}
					<a
						href='https://polkassembly.io'
						className='flex shrink-0 items-center transition hover:opacity-80'
						title='Back to Polkassembly'
						aria-label='Back to Polkassembly'
					>
						<PlatformMark
							name='Polkassembly'
							size={28}
						/>
					</a>

					{/* Divider + dashboard title */}
					<div className='hidden h-8 w-px shrink-0 bg-[var(--border)] sm:block' />
					<button
						type='button'
						onClick={() => {
							setTab('overview');
							window.scrollTo({ top: 0, behavior: 'smooth' });
						}}
						className='min-w-0 flex-1 text-left leading-tight md:flex-none'
					>
						<div className='truncate font-serif text-[14px] font-semibold tracking-tight text-[var(--text)] sm:text-[15px]'>Polkadot Ecosystem Observatory</div>
						<div className='truncate text-[10.5px] text-[var(--text-faint)]'>
							Open data · {new Date(d.mode === 'live' ? d.generatedAt : d.asOfDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
						</div>
					</button>

					{/* Tab nav — desktop */}
					<nav className='hidden flex-1 justify-end gap-0.5 lg:flex'>
						{TABS.map((t) => (
							<button
								key={t.key}
								onClick={() => setTab(t.key)}
								className={`relative rounded-md px-3 py-1.5 text-[12.5px] font-medium transition ${
									tab === t.key ? 'bg-[var(--bg-soft)] text-[var(--text)]' : 'text-[var(--text-muted)] hover:text-[var(--text)]'
								}`}
							>
								{t.label}
								{tab === t.key && <span className='absolute -bottom-[13px] left-1/2 h-[2px] w-6 -translate-x-1/2 bg-[var(--accent)]' />}
							</button>
						))}
					</nav>

					<div className='flex shrink-0 items-center gap-2'>
						<ThemeToggle />
					</div>
				</div>
				{/* Tab nav — mobile / tablet (under main header) */}
				<div className='border-t border-[var(--border)] bg-[var(--bg-soft)] lg:hidden'>
					<div className='no-scrollbar mx-auto flex max-w-[1400px] gap-1 overflow-x-auto px-4 py-2 sm:px-6'>
						{TABS.map((t) => (
							<button
								key={t.key}
								onClick={() => setTab(t.key)}
								className={`shrink-0 rounded-md px-3 py-1.5 text-[12px] transition ${tab === t.key ? 'bg-[var(--bg-elev)] font-medium text-[var(--text)]' : 'text-[var(--text-muted)] hover:text-[var(--text)]'}`}
							>
								{t.label}
							</button>
						))}
					</div>
				</div>
			</header>

			<main
				id='top'
				className='mx-auto w-full max-w-[1400px] flex-1 px-4 pb-20 pt-6 sm:px-6 sm:pt-8'
			>
				<div className='mb-6 flex flex-wrap items-center justify-between gap-3'>
					<div className='flex items-center gap-3'>
						<StatusPill
							live={d.mode === 'live'}
							asOf={d.mode === 'live' ? d.generatedAt : d.asOfDate}
						/>
						<div className='hidden items-center gap-1.5 text-[12px] text-[var(--text-faint)] md:flex'>
							<span>DOT</span>
							<span className='font-medium tabular-nums text-[var(--text)]'>{d.economy.priceDisplay}</span>
							<span className='text-[var(--text-dim)]'>·</span>
							<span className='font-medium tabular-nums text-[var(--text)]'>{d.economy.marketCapDisplay}</span>
							<span className='text-[var(--text-dim)]'>mkt cap</span>
							<span className='text-[var(--text-dim)]'>·</span>
							<span className='text-[10.5px] text-[var(--text-dim)]'>via CoinGecko</span>
						</div>
					</div>
					<div className='font-mono text-[10.5px] uppercase tracking-[0.18em] text-[var(--text-dim)]'>{TABS.find((t) => t.key === tab)?.label}</div>
				</div>

				<div
					key={tab}
					className='animate-[fadein_180ms_ease-out]'
				>
					{renderTab()}
				</div>
			</main>

			<footer className='border-t border-[var(--border)] bg-[var(--bg-soft)]'>
				<div className='mx-auto max-w-[1400px] px-4 py-6 sm:px-6 sm:py-8'>
					<div className='flex flex-col gap-3 md:flex-row md:items-center md:justify-between md:gap-4'>
						<div className='flex items-center gap-2.5'>
							<PlatformMark
								name='Polkassembly'
								size={18}
							/>
							<div className='text-[11.5px] leading-snug text-[var(--text-muted)]'>
								<span className='font-medium text-[var(--text)]'>Polkadot Ecosystem Observatory</span>
								<span className='ml-1.5 hidden sm:inline'>·</span>
								<span className='ml-1.5 hidden sm:inline'>Maintained by</span>
								<a
									href='https://polkassembly.io'
									className='ml-1 font-medium text-[var(--text)] hover:text-[var(--accent)] hover:underline'
								>
									Polkassembly
								</a>
							</div>
						</div>
						<div className='text-[10.5px] leading-snug text-[var(--text-faint)]'>DOT market data via CoinGecko · DeFi TVL via DefiLlama · Refreshes on page load</div>
					</div>
				</div>
			</footer>
		</div>
	);
};

export default EcosystemDashboard;
