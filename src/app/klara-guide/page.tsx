// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { getGeneratedContentMetadata } from '@/_shared/_utils/generateContentMetadata';
import { getNetworkFromHeaders } from '@/app/api/_api-utils/getNetworkFromHeaders';
import { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
	const network = await getNetworkFromHeaders();

	return getGeneratedContentMetadata({
		description: 'Complete guide to using Klara AI Assistant for Polkadot and Kusama governance queries, voting analysis, and treasury insights.',
		imageAlt: 'Polkassembly - Klara',
		title: 'Klara Usage Guide - AI-Powered Governance Assistant',
		url: `https://${network}.polkassembly.io/klara-guide`,
		network
	});
}

async function KlaraGuide() {
	return (
		<div className='min-h-screen bg-page_background'>
			{/* Header */}
			<div className='bg-gradient-to-r from-blue-600 to-purple-600 py-12 text-white'>
				<div className='mx-auto max-w-4xl px-6'>
					<h1 className='mb-4 text-4xl font-bold'>🧠 Klara Usage Guide</h1>
					<p className='text-xl opacity-90'>Your AI-Powered Governance Assistant for Polkassembly & Polkadot Network</p>
				</div>
			</div>

			{/* Content */}
			<div className='mx-auto max-w-4xl px-6 py-12'>
				<div className='space-y-12 rounded-lg bg-bg_modal p-8 shadow-lg'>
					{/* Introduction */}
					<section>
						<h2 className='mb-6 flex items-center text-3xl font-bold text-text_primary'>
							<span className='mr-3 text-4xl'>🌍</span>
							Introduction
						</h2>
						<div className='prose prose-lg max-w-none'>
							<p className='mb-4 leading-relaxed text-basic_text'>
								Klara is an AI chatbot built for the Polkadot and Kusama governance ecosystem, integrated with Polkassembly. It helps users query on-chain data, explore governance
								insights, and understand the entire proposal and voting process—all in natural language.
							</p>
							<p className='mb-3 font-semibold text-basic_text'>Klara is designed for:</p>
							<ul className='space-y-2 text-basic_text'>
								<li className='flex items-start'>
									<span className='mr-2 text-blue-500'>•</span>
									Community members exploring proposals or referenda
								</li>
								<li className='flex items-start'>
									<span className='mr-2 text-blue-500'>•</span>
									Delegates analyzing voting behavior
								</li>
								<li className='flex items-start'>
									<span className='mr-2 text-blue-500'>•</span>
									Builders tracking treasury and bounty activities
								</li>
								<li className='flex items-start'>
									<span className='mr-2 text-blue-500'>•</span>
									Researchers studying governance trends
								</li>
							</ul>
						</div>
					</section>

					{/* Core Capabilities */}
					<section>
						<h2 className='mb-6 flex items-center text-3xl font-bold text-text_primary'>
							<span className='mr-3 text-4xl'>⚙️</span>
							Core Capabilities
						</h2>

						{/* Governance Data Querying */}
						<div className='mb-10'>
							<h3 className='mb-4 flex items-center text-2xl font-semibold text-text_primary'>
								<span className='mr-2 text-2xl'>🗳</span>
								1. Governance Data Querying
							</h3>
							<p className='mb-6 text-basic_text'>Klara can retrieve, filter, and summarize on-chain proposals across Polkadot and Kusama.</p>

							<div className='overflow-x-auto'>
								<table className='w-full border-collapse rounded-lg border border-gray-300'>
									<thead>
										<tr className='bg-gray-100'>
											<th className='border border-gray-300 px-4 py-3 text-left font-semibold text-text_primary'>Feature</th>
											<th className='border border-gray-300 px-4 py-3 text-left font-semibold text-text_primary'>Description</th>
											<th className='border border-gray-300 px-4 py-3 text-left font-semibold text-text_primary'>Example Query</th>
										</tr>
									</thead>
									<tbody className='text-sm'>
										<tr>
											<td className='border border-gray-300 px-4 py-3 font-medium text-text_primary'>Proposal Lookup</td>
											<td className='border border-gray-300 px-4 py-3 text-text_primary'>Fetch proposals or referenda by ID or title</td>
											<td className='border border-gray-300 px-4 py-3 font-mono text-blue-600'>&quot;Show referendum 472 on Polkadot.&quot;</td>
										</tr>
										<tr className='bg-gray-50'>
											<td className='border border-gray-300 px-4 py-3 font-medium text-text_primary'>Filter by Type</td>
											<td className='border border-gray-300 px-4 py-3 text-text_primary'>Supports ReferendumV2, Treasury, Fellowship, Bounty, ChildBounty</td>
											<td className='border border-gray-300 px-4 py-3 font-mono text-blue-600'>&quot;List all Treasury proposals this month.&quot;</td>
										</tr>
										<tr>
											<td className='border border-gray-300 px-4 py-3 font-medium text-text_primary'>Filter by Network</td>
											<td className='border border-gray-300 px-4 py-3 text-text_primary'>Switch between Polkadot and Kusama networks</td>
											<td className='border border-gray-300 px-4 py-3 font-mono text-blue-600'>&quot;Show Kusama bounties created in 2024.&quot;</td>
										</tr>
										<tr className='bg-gray-50'>
											<td className='border border-gray-300 px-4 py-3 font-medium text-text_primary'>Status Filtering</td>
											<td className='border border-gray-300 px-4 py-3 text-text_primary'>Retrieve proposals by status: Deciding, DecisionDepositPlaced, Submitted, etc.</td>
											<td className='border border-gray-300 px-4 py-3 font-mono text-blue-600'>&quot;What proposals are currently in the deciding phase?&quot;</td>
										</tr>
										<tr>
											<td className='border border-gray-300 px-4 py-3 font-medium text-text_primary'>Date-Based Search</td>
											<td className='border border-gray-300 px-4 py-3 text-text_primary'>Query by specific dates, months, or years</td>
											<td className='border border-gray-300 px-4 py-3 font-mono text-blue-600'>&quot;Show all referenda in July 2025.&quot;</td>
										</tr>
										<tr className='bg-gray-50'>
											<td className='border border-gray-300 px-4 py-3 font-medium text-text_primary'>Text Search</td>
											<td className='border border-gray-300 px-4 py-3 text-text_primary'>Search in titles or content</td>
											<td className='border border-gray-300 px-4 py-3 font-mono text-blue-600'>&quot;Find proposals mentioning &apos;parachain auctions&apos;.&quot;</td>
										</tr>
										<tr>
											<td className='border border-gray-300 px-4 py-3 font-medium text-text_primary'>Details Retrieval</td>
											<td className='border border-gray-300 px-4 py-3 text-text_primary'>Get structured proposal data</td>
											<td className='border border-gray-300 px-4 py-3 font-mono text-blue-600'>&quot;Show details for proposal 85.&quot;</td>
										</tr>
									</tbody>
								</table>
							</div>
						</div>

						{/* Voting Data Analysis */}
						<div className='mb-10'>
							<h3 className='mb-4 flex items-center text-2xl font-semibold text-text_primary'>
								<span className='mr-2 text-2xl'>📊</span>
								2. Voting Data Analysis
							</h3>
							<p className='mb-6 text-basic_text'>Klara enables deep analysis of voter behavior and governance participation.</p>

							<div className='overflow-x-auto'>
								<table className='w-full border-collapse rounded-lg border border-gray-300'>
									<thead>
										<tr className='bg-gray-100'>
											<th className='border border-gray-300 px-4 py-3 text-left font-semibold text-text_primary'>Feature</th>
											<th className='border border-gray-300 px-4 py-3 text-left font-semibold text-text_primary'>Description</th>
											<th className='border border-gray-300 px-4 py-3 text-left font-semibold text-text_primary'>Example Query</th>
										</tr>
									</thead>
									<tbody className='text-sm'>
										<tr>
											<td className='border border-gray-300 px-4 py-3 font-medium text-text_primary'>Voter Information</td>
											<td className='border border-gray-300 px-4 py-3 text-text_primary'>Retrieve details of individual voters and their activity</td>
											<td className='border border-gray-300 px-4 py-3 font-mono text-blue-600'>&quot;Show the voting history of address 15Hu...xyz.&quot;</td>
										</tr>
										<tr className='bg-gray-50'>
											<td className='border border-gray-300 px-4 py-3 font-medium text-text_primary'>Voting Power</td>
											<td className='border border-gray-300 px-4 py-3 text-text_primary'>Analyze balance and conviction using conviction_vote data</td>
											<td className='border border-gray-300 px-4 py-3 font-mono text-blue-600'>&quot;Who had the highest voting power in Referendum 300?&quot;</td>
										</tr>
										<tr>
											<td className='border border-gray-300 px-4 py-3 font-medium text-text_primary'>Delegation Tracking</td>
											<td className='border border-gray-300 px-4 py-3 text-text_primary'>Identify delegated votes and delegation relationships</td>
											<td className='border border-gray-300 px-4 py-3 font-mono text-blue-600'>&quot;Who delegated their votes to Alice on Polkadot?&quot;</td>
										</tr>
										<tr className='bg-gray-50'>
											<td className='border border-gray-300 px-4 py-3 font-medium text-text_primary'>Vote Decisions</td>
											<td className='border border-gray-300 px-4 py-3 text-text_primary'>Filter by aye, nay, or abstain</td>
											<td className='border border-gray-300 px-4 py-3 font-mono text-blue-600'>&quot;List all voters who voted &apos;nay&apos; on Referendum 51.&quot;</td>
										</tr>
										<tr>
											<td className='border border-gray-300 px-4 py-3 font-medium text-text_primary'>Conviction Analysis</td>
											<td className='border border-gray-300 px-4 py-3 text-text_primary'>Analyze lock periods and conviction multipliers</td>
											<td className='border border-gray-300 px-4 py-3 font-mono text-blue-600'>&quot;What was the most common conviction used in recent votes?&quot;</td>
										</tr>
										<tr className='bg-gray-50'>
											<td className='border border-gray-300 px-4 py-3 font-medium text-text_primary'>Top Voters</td>
											<td className='border border-gray-300 px-4 py-3 text-text_primary'>Rank voters by voting power</td>
											<td className='border border-gray-300 px-4 py-3 font-mono text-blue-600'>&quot;Top 10 voters in the last 5 referenda.&quot;</td>
										</tr>
										<tr>
											<td className='border border-gray-300 px-4 py-3 font-medium text-text_primary'>Unique Voter Count</td>
											<td className='border border-gray-300 px-4 py-3 text-text_primary'>Aggregate unique voters by time</td>
											<td className='border border-gray-300 px-4 py-3 font-mono text-blue-600'>&quot;How many unique voters participated in August 2025?&quot;</td>
										</tr>
										<tr className='bg-gray-50'>
											<td className='border border-gray-300 px-4 py-3 font-medium text-text_primary'>Active vs. Removed Votes</td>
											<td className='border border-gray-300 px-4 py-3 text-text_primary'>Filter based on active or removed vote states</td>
											<td className='border border-gray-300 px-4 py-3 font-mono text-blue-600'>&quot;Show all active votes on Kusama.&quot;</td>
										</tr>
									</tbody>
								</table>
							</div>
						</div>
					</section>

					{/* Query Examples */}
					<section>
						<h2 className='mb-6 flex items-center text-3xl font-bold text-text_primary'>
							<span className='mr-3 text-4xl'>🧭</span>
							Query Examples by Use Case
						</h2>

						<div className='grid gap-8 md:grid-cols-2'>
							{/* Governance Queries */}
							<div className='rounded-lg bg-blue-50 p-6'>
								<h3 className='mb-4 flex items-center text-xl font-semibold text-blue-800'>
									<span className='mr-2 text-xl'>🧩</span>
									Governance Queries
								</h3>
								<ul className='space-y-2 text-sm'>
									<li className='font-mono text-blue-700'>&quot;List all active proposals on Polkadot.&quot;</li>
									<li className='font-mono text-blue-700'>&quot;Which referenda are under the &apos;Treasurer&apos; track?&quot;</li>
									<li className='font-mono text-blue-700'>&quot;Find all bounties created in 2025 with status &apos;Submitted&apos;.&quot;</li>
								</ul>
							</div>

							{/* Proposal Exploration */}
							<div className='rounded-lg bg-green-50 p-6'>
								<h3 className='mb-4 flex items-center text-xl font-semibold text-green-800'>
									<span className='mr-2 text-xl'>💬</span>
									Proposal Exploration
								</h3>
								<ul className='space-y-2 text-sm'>
									<li className='font-mono text-green-700'>&quot;Summarize the proposal about &apos;USDT treasury transfer&apos;.&quot;</li>
									<li className='font-mono text-green-700'>&quot;Who created proposal 244 and what&apos;s its current stage?&quot;</li>
									<li className='font-mono text-green-700'>&quot;Show me child bounties linked to bounty 30.&quot;</li>
								</ul>
							</div>

							{/* Voting Behavior */}
							<div className='rounded-lg bg-purple-50 p-6'>
								<h3 className='mb-4 flex items-center text-xl font-semibold text-purple-800'>
									<span className='mr-2 text-xl'>🧑‍🤝‍🧑</span>
									Voting Behavior
								</h3>
								<ul className='space-y-2 text-sm'>
									<li className='font-mono text-purple-700'>&quot;How many users voted &apos;aye&apos; on Referendum 800?&quot;</li>
									<li className='font-mono text-purple-700'>&quot;Which delegates voted with the highest conviction last month?&quot;</li>
									<li className='font-mono text-purple-700'>&quot;Show all voters who abstained on any referendum in 2024.&quot;</li>
								</ul>
							</div>

							{/* Treasury Insights */}
							<div className='rounded-lg bg-yellow-50 p-6'>
								<h3 className='mb-4 flex items-center text-xl font-semibold text-yellow-800'>
									<span className='mr-2 text-xl'>💰</span>
									Treasury Insights
								</h3>
								<ul className='space-y-2 text-sm'>
									<li className='font-mono text-yellow-700'>&quot;Show all treasury proposals above 100,000 DOT.&quot;</li>
									<li className='font-mono text-yellow-700'>&quot;List beneficiaries from treasury payouts in September 2025.&quot;</li>
									<li className='font-mono text-yellow-700'>&quot;What are the latest tips created under the Treasury track?&quot;</li>
								</ul>
							</div>
						</div>

						{/* Delegation Tracking */}
						<div className='mt-6 rounded-lg bg-indigo-50 p-6'>
							<h3 className='mb-4 flex items-center text-xl font-semibold text-indigo-800'>
								<span className='mr-2 text-xl'>🧭</span>
								Delegation Tracking
							</h3>
							<ul className='space-y-2 text-sm'>
								<li className='font-mono text-indigo-700'>&quot;Who are the top delegates by number of delegators?&quot;</li>
								<li className='font-mono text-indigo-700'>&quot;Which tracks did Alice receive delegation for?&quot;</li>
								<li className='font-mono text-indigo-700'>&quot;List all addresses that delegated to Bob.&quot;</li>
							</ul>
						</div>
					</section>

					{/* Integration */}
					<section>
						<h2 className='mb-6 flex items-center text-3xl font-bold text-text_primary'>
							<span className='mr-3 text-4xl'>🧩</span>
							Integration with Polkassembly Platform Docs
						</h2>
						<p className='mb-6 text-basic_text'>
							Klara also answers conceptual and platform-level queries from the Polkassembly Platform Documentation. Here are examples by section:
						</p>

						<div className='overflow-x-auto'>
							<table className='w-full border-collapse rounded-lg border border-gray-300'>
								<thead>
									<tr className='bg-gray-100'>
										<th className='border border-gray-300 px-4 py-3 text-left font-semibold text-text_primary'>Documentation Area</th>
										<th className='border border-gray-300 px-4 py-3 text-left font-semibold text-text_primary'>Example Questions Klara Can Answer</th>
									</tr>
								</thead>
								<tbody className='text-sm'>
									<tr>
										<td className='border border-gray-300 px-4 py-3 font-medium text-text_primary'>Platform Overview</td>
										<td className='border border-gray-300 px-4 py-3 text-text_primary'>&quot;What is Polkassembly and how does it connect to Polkadot?&quot;</td>
									</tr>
									<tr className='bg-gray-50'>
										<td className='border border-gray-300 px-4 py-3 font-medium text-text_primary'>User Authentication</td>
										<td className='border border-gray-300 px-4 py-3 text-text_primary'>&quot;How do I sign up with a Web3 wallet?&quot;</td>
									</tr>
									<tr>
										<td className='border border-gray-300 px-4 py-3 font-medium text-text_primary'>Proposal Management</td>
										<td className='border border-gray-300 px-4 py-3 text-text_primary'>&quot;How can I create a bounty proposal?&quot;</td>
									</tr>
									<tr className='bg-gray-50'>
										<td className='border border-gray-300 px-4 py-3 font-medium text-text_primary'>Voting System</td>
										<td className='border border-gray-300 px-4 py-3 text-text_primary'>&quot;What does conviction voting mean in OpenGov?&quot;</td>
									</tr>
									<tr>
										<td className='border border-gray-300 px-4 py-3 font-medium text-text_primary'>Treasury Operations</td>
										<td className='border border-gray-300 px-4 py-3 text-text_primary'>&quot;How can I create a proposal with multiple beneficiaries?&quot;</td>
									</tr>
									<tr className='bg-gray-50'>
										<td className='border border-gray-300 px-4 py-3 font-medium text-text_primary'>Delegation System</td>
										<td className='border border-gray-300 px-4 py-3 text-text_primary'>&quot;Can I delegate voting power to multiple delegates?&quot;</td>
									</tr>
									<tr>
										<td className='border border-gray-300 px-4 py-3 font-medium text-text_primary'>Community Features</td>
										<td className='border border-gray-300 px-4 py-3 text-text_primary'>&quot;Where can I discuss ongoing referenda?&quot;</td>
									</tr>
									<tr className='bg-gray-50'>
										<td className='border border-gray-300 px-4 py-3 font-medium text-text_primary'>Advanced Features</td>
										<td className='border border-gray-300 px-4 py-3 text-text_primary'>&quot;Does Polkassembly support USDT or USDC proposals?&quot;</td>
									</tr>
									<tr>
										<td className='border border-gray-300 px-4 py-3 font-medium text-text_primary'>User Journeys</td>
										<td className='border border-gray-300 px-4 py-3 text-text_primary'>&quot;What are the steps for a Treasury Beneficiary Journey?&quot;</td>
									</tr>
								</tbody>
							</table>
						</div>
					</section>

					{/* How to Interact */}
					<section>
						<h2 className='mb-6 flex items-center text-3xl font-bold text-text_primary'>
							<span className='mr-3 text-4xl'>🧠</span>
							How to Interact with Klara
						</h2>

						<div className='space-y-6'>
							<div className='rounded-lg bg-blue-50 p-6'>
								<h3 className='mb-3 flex items-center text-xl font-semibold text-blue-800'>
									<span className='mr-2 text-xl'>🔍</span>
									General Query
								</h3>
								<p className='mb-2 text-basic_text'>Type any natural language question about Polkadot governance, e.g.:</p>
								<p className='rounded border bg-white p-3 font-mono text-blue-700'>&quot;Show me all referenda under Treasury in September 2025.&quot;</p>
							</div>

							<div className='rounded-lg bg-green-50 p-6'>
								<h3 className='mb-3 flex items-center text-xl font-semibold text-green-800'>
									<span className='mr-2 text-xl'>🧭</span>
									Follow-up Contextual Queries
								</h3>
								<p className='mb-2 text-basic_text'>Klara remembers context within a session:</p>
								<div className='space-y-2'>
									<p className='rounded border bg-white p-2 font-mono text-green-700'>&quot;Show me the proposals from August.&quot;</p>
									<p className='rounded border bg-white p-2 font-mono text-green-700'>
										&quot;Now, show only Treasury ones.&quot; <span className='text-gray-500'>(Klara understands the continuation.)</span>
									</p>
								</div>
							</div>

							<div className='rounded-lg bg-purple-50 p-6'>
								<h3 className='mb-3 flex items-center text-xl font-semibold text-purple-800'>
									<span className='mr-2 text-xl'>💡</span>
									Smart Interpretation
								</h3>
								<p className='mb-2 text-basic_text'>Klara understands semantic variations:</p>
								<p className='rounded border bg-white p-3 font-mono text-purple-700'>
									&quot;Who voted against the staking proposal?&quot;
									<br />
									<span className='text-sm text-gray-500'>(Interpreted as nay votes on proposals containing &quot;staking.&quot;)</span>
								</p>
							</div>
						</div>
					</section>

					{/* Data Sources */}
					<section>
						<h2 className='mb-6 flex items-center text-3xl font-bold text-text_primary'>
							<span className='mr-3 text-4xl'>🧩</span>
							Data Sources
						</h2>

						<div className='grid gap-6 md:grid-cols-3'>
							<div className='rounded-lg bg-blue-50 p-6 text-center'>
								<h3 className='mb-3 text-lg font-semibold text-blue-800'>On-chain Data</h3>
								<p className='text-sm text-basic_text'>Real-time governance and voting data from Polkadot and Kusama nodes</p>
							</div>
							<div className='rounded-lg bg-green-50 p-6 text-center'>
								<h3 className='mb-3 text-lg font-semibold text-green-800'>Off-chain Docs</h3>
								<p className='text-sm text-basic_text'>Polkassembly Documentation (Proposal Creation, Voting, Treasury, Delegation, etc.)</p>
							</div>
							<div className='rounded-lg bg-purple-50 p-6 text-center'>
								<h3 className='mb-3 text-lg font-semibold text-purple-800'>RAG-based Retrieval</h3>
								<p className='text-sm text-basic_text'>Klara uses a Retrieval-Augmented Generation layer for factual accuracy</p>
							</div>
						</div>
					</section>

					{/* Example Workflows */}
					<section>
						<h2 className='mb-6 flex items-center text-3xl font-bold text-text_primary'>
							<span className='mr-3 text-4xl'>🛠</span>
							Example Workflows
						</h2>

						<div className='space-y-8'>
							<div className='rounded-lg bg-gradient-to-r from-blue-50 to-blue-100 p-6'>
								<h3 className='mb-4 flex items-center text-xl font-semibold text-blue-800'>
									<span className='mr-2 text-xl'>🧭</span>
									Explore Referenda
								</h3>
								<div className='space-y-2 text-sm'>
									<p className='font-mono text-blue-700'>&quot;Show me all referenda on Polkadot this month.&quot;</p>
									<p className='font-mono text-blue-700'>&quot;Which are in deciding status?&quot;</p>
									<p className='font-mono text-blue-700'>&quot;Get details of referendum 212.&quot;</p>
									<p className='mt-3 text-gray-600'>→ Klara fetches metadata, proposer info, current status, and discussion link.</p>
								</div>
							</div>

							<div className='rounded-lg bg-gradient-to-r from-green-50 to-green-100 p-6'>
								<h3 className='mb-4 flex items-center text-xl font-semibold text-green-800'>
									<span className='mr-2 text-xl'>📈</span>
									Analyze Voting Patterns
								</h3>
								<div className='space-y-2 text-sm'>
									<p className='font-mono text-green-700'>&quot;List voters of referendum 310.&quot;</p>
									<p className='font-mono text-green-700'>&quot;Sort by voting power.&quot;</p>
									<p className='font-mono text-green-700'>&quot;Show only those who voted &apos;aye&apos;.&quot;</p>
									<p className='mt-3 text-gray-600'>→ Klara joins flattened_conviction_votes with conviction_vote tables.</p>
								</div>
							</div>

							<div className='rounded-lg bg-gradient-to-r from-yellow-50 to-yellow-100 p-6'>
								<h3 className='mb-4 flex items-center text-xl font-semibold text-yellow-800'>
									<span className='mr-2 text-xl'>💰</span>
									Treasury Research
								</h3>
								<div className='space-y-2 text-sm'>
									<p className='font-mono text-yellow-700'>&quot;Show all treasury proposals above 10k DOT.&quot;</p>
									<p className='font-mono text-yellow-700'>&quot;Get their beneficiaries and proposal tracks.&quot;</p>
									<p className='font-mono text-yellow-700'>&quot;Which were accepted?&quot;</p>
									<p className='mt-3 text-gray-600'>→ Klara cross-checks treasury referenda and proposal lifecycle.</p>
								</div>
							</div>
						</div>
					</section>

					{/* Tips */}
					<section>
						<h2 className='mb-6 flex items-center text-3xl font-bold text-text_primary'>
							<span className='mr-3 text-4xl'>🧩</span>
							Tips for Best Results
						</h2>

						<div className='rounded-lg bg-green-50 p-6'>
							<ul className='space-y-3'>
								<li className='flex items-start'>
									<span className='mr-3 text-xl text-green-500'>✅</span>
									<span className='text-basic_text'>Use specific keywords like &quot;referenda,&quot; &quot;bounty,&quot; or &quot;treasury.&quot;</span>
								</li>
								<li className='flex items-start'>
									<span className='mr-3 text-xl text-green-500'>✅</span>
									<span className='text-basic_text'>Mention network (Polkadot or Kusama) for clarity.</span>
								</li>
								<li className='flex items-start'>
									<span className='mr-3 text-xl text-green-500'>✅</span>
									<div className='text-basic_text'>
										<span>Combine filters:</span>
										<p className='mt-1 rounded border bg-white p-2 font-mono text-green-700'>&quot;Show active Treasury proposals on Polkadot in August 2025.&quot;</p>
									</div>
								</li>
								<li className='flex items-start'>
									<span className='mr-3 text-xl text-green-500'>✅</span>
									<span className='text-basic_text'>Ask follow-ups naturally—Klara maintains session context.</span>
								</li>
								<li className='flex items-start'>
									<span className='mr-3 text-xl text-green-500'>✅</span>
									<span className='text-basic_text'>For deep voting analytics, specify conviction or decision type.</span>
								</li>
							</ul>
						</div>
					</section>

					{/* Support */}
					<section>
						<h2 className='mb-6 flex items-center text-3xl font-bold text-text_primary'>
							<span className='mr-3 text-4xl'>📞</span>
							Support
						</h2>

						<div className='rounded-lg bg-blue-50 p-6'>
							<p className='mb-4 text-basic_text'>If Klara doesn&apos;t return expected data:</p>
							<ul className='space-y-2 text-basic_text'>
								<li className='flex items-start'>
									<span className='mr-2 text-blue-500'>•</span>
									Ensure your query matches a supported track or proposal type
								</li>
								<li className='flex items-start'>
									<span className='mr-2 text-blue-500'>•</span>
									Try rephrasing your question in natural terms (e.g., &quot;show all passed referenda&quot;)
								</li>
								<li className='flex items-start'>
									<span className='mr-2 text-blue-500'>•</span>
									<span>
										Contact Polkassembly AI Team via{' '}
										<a
											href='https://t.me/+QMh-FsTUcWJjNmI1'
											target='_blank'
											rel='noopener noreferrer'
											className='text-blue-600 underline hover:text-blue-800'
										>
											Telegram
										</a>
									</span>
								</li>
							</ul>
						</div>
					</section>
				</div>
			</div>

			{/* Footer */}
			<div className='bg-gray-800 py-8 text-white'>
				<div className='mx-auto max-w-4xl px-6 text-center'>
					<p className='text-gray-300'>© 2025 Polkassembly. Klara AI Assistant - Empowering Polkadot Governance.</p>
				</div>
			</div>
		</div>
	);
}

export default KlaraGuide;
