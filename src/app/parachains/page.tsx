// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import w3fBlackLogo from '@assets/parachains/w3f-black.png';
import w3fGreenLogo from '@assets/parachains/w3f-green.png';
import w3fRedLogo from '@assets/parachains/w3f-red.png';
import { FaGithub } from '@react-icons/all-files/fa/FaGithub';
import Link from 'next/link';
import announcedIcon from '@assets/parachains/announced.png';
import auctionIcon from '@assets/parachains/auction.png';
import liveIcon from '@assets/parachains/chain-link.png';
import testingIcon from '@assets/parachains/testing.png';
import { convertCamelCaseToTitleCase } from '@/_shared/_utils/convertCamelCaseToTitleCase';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../_shared-components/Table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../_shared-components/Tabs';
import ParachainsInfoCard from './Components/ParachainsInfoCard';
import { Tooltip, TooltipContent, TooltipTrigger } from '../_shared-components/Tooltip';

interface IParachain {
	id: number;
	name: string;
	chain: string;
	status: string;
	token: string;
	logoURL: string;
	w3fGrant: {
		received: number;
		completed: number;
		milestoneText: string;
		terminated: boolean;
		terminationReason: string;
	};
	investorsCount: number;
	githubURL: string;
}

function ParachainsPage() {
	const [parachainsData, setParachainsData] = useState<IParachain[]>([]);

	useEffect(() => {
		fetch('/parachains.json')
			.then((r) => r.json())
			.then((data) => {
				setParachainsData(data);
			});
	}, []);

	const grantTooltip = (parachain: IParachain) => {
		let content = '';
		if (parachain.w3fGrant) {
			if (parachain.w3fGrant.terminated) {
				content = convertCamelCaseToTitleCase(`W3F grant TERMINATED: "${parachain.w3fGrant.terminationReason}"`);
			} else if (parachain.w3fGrant.milestoneText) {
				content = convertCamelCaseToTitleCase(`${parachain.w3fGrant.received} W3F grant(s) received, ${parachain.w3fGrant.milestoneText}`);
			} else {
				content = convertCamelCaseToTitleCase(`${parachain.w3fGrant.received} received, ${parachain.w3fGrant.completed} completed`);
			}
		} else {
			content = '';
		}
		return content;
	};

	return (
		<div className='mx-auto grid w-full max-w-7xl grid-cols-1 gap-5 px-4 py-5 lg:px-16'>
			<ParachainsInfoCard />
			<div className='rounded-lg bg-bg_modal p-5 shadow-md'>
				<p className='text-xl font-medium text-btn_secondary_text'>Projects</p>
				<Tabs
					defaultValue='polkadot'
					className='my-5'
				>
					<TabsList>
						<TabsTrigger
							showBorder
							value='polkadot'
						>
							Polkadot
						</TabsTrigger>
						<TabsTrigger
							showBorder
							value='kusama'
						>
							Kusama
						</TabsTrigger>
					</TabsList>
					<TabsContent value='polkadot'>
						<Table>
							<TableHeader>
								<TableRow className='bg-page_background text-sm font-medium text-wallet_btn_text'>
									<TableHead className='py-4'>Index</TableHead>
									<TableHead className='py-4'>Projects</TableHead>
									<TableHead className='py-4'>Status</TableHead>
									<TableHead className='py-4'>Token</TableHead>
									<TableHead className='py-4'>W3F</TableHead>
									<TableHead className='py-4'>Investors</TableHead>
									<TableHead className='py-4'>Github</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{parachainsData
									.filter((parachain) => parachain.chain === 'polkadot')
									.map((parachain, index) => (
										<TableRow key={parachain.id}>
											<TableCell className='py-4'>#{index + 1}</TableCell>
											<TableCell className='flex items-center gap-2 py-4'>
												<Image
													src={parachain.logoURL}
													height={34}
													width={34}
													alt='Parachain Logo'
												/>
												{parachain.name}
											</TableCell>
											<TableCell>
												{' '}
												{parachain.status.search('auction') !== -1 ? (
													<span className='text-blue-light-high dark:text-blue-dark-high flex items-center gap-4'>
														<Image
															src={auctionIcon}
															height={16}
															width={16}
															alt='Auction Icon'
														/>{' '}
														In Auction
													</span>
												) : parachain.status.search('Testing') !== -1 ? (
													<span className='text-blue-light-high dark:text-blue-dark-high flex items-center gap-4'>
														<Image
															src={testingIcon}
															height={16}
															width={16}
															alt='Testing Icon'
														/>{' '}
														Testing
													</span>
												) : parachain.status.search('announced') !== -1 ? (
													<span className='text-blue-light-high dark:text-blue-dark-high flex items-center gap-4'>
														<Image
															src={announcedIcon}
															height={16}
															width={16}
															alt='Announced Icon'
														/>{' '}
														Announced
													</span>
												) : parachain.status.search('live') !== -1 ? (
													<span className='text-blue-light-high dark:text-blue-dark-high flex items-center gap-4'>
														<Image
															src={liveIcon}
															height={16}
															width={16}
															alt='Live Icon'
														/>{' '}
														Live
													</span>
												) : null}
											</TableCell>
											<TableCell className='py-4'>{parachain.token}</TableCell>
											<TableCell className='py-4'>
												{grantTooltip(parachain) ? (
													<Tooltip>
														<TooltipTrigger>
															<Image
																src={parachain.w3fGrant?.terminated ? w3fRedLogo : parachain.w3fGrant?.milestoneText ? w3fBlackLogo : w3fGreenLogo}
																height={34}
																width={34}
																alt='W3F Logo'
															/>
														</TooltipTrigger>
														<TooltipContent className='relative z-50 m-0 mt-5 rounded-md bg-address_tooltip_bg px-4 py-2 text-text_primary shadow-lg'>
															<p>{grantTooltip(parachain)}</p>
														</TooltipContent>
													</Tooltip>
												) : (
													<Image
														src={parachain.w3fGrant?.terminated ? w3fRedLogo : parachain.w3fGrant?.milestoneText ? w3fBlackLogo : w3fGreenLogo}
														height={34}
														width={34}
														alt='W3F Logo'
													/>
												)}
											</TableCell>
											<TableCell className='py-4'>{parachain.investorsCount}</TableCell>
											<TableCell className='py-4'>
												<Link
													href={parachain.githubURL}
													target='_blank'
													rel='noreferrer'
												>
													<FaGithub className='text-2xl' />
												</Link>
											</TableCell>
										</TableRow>
									))}
							</TableBody>
						</Table>
					</TabsContent>
					<TabsContent value='kusama'>
						<Table>
							<TableHeader>
								<TableRow className='bg-page_background text-sm font-medium text-wallet_btn_text'>
									<TableHead className='py-4'>Index</TableHead>
									<TableHead className='py-4'>Projects</TableHead>
									<TableHead className='py-4'>Status</TableHead>
									<TableHead className='py-4'>Token</TableHead>
									<TableHead className='py-4'>W3F</TableHead>
									<TableHead className='py-4'>Investors</TableHead>
									<TableHead className='py-4'>Github</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{parachainsData
									.filter((parachain) => parachain.chain === 'kusama')
									.map((parachain, index) => (
										<TableRow key={parachain.id}>
											<TableCell className='py-4'>#{index + 1}</TableCell>
											<TableCell className='flex items-center gap-2 py-4'>
												<Image
													src={parachain.logoURL}
													height={34}
													width={34}
													alt='Parachain Logo'
												/>
												{parachain.name}
											</TableCell>
											<TableCell className='py-4'>
												{' '}
												{parachain.status.search('auction') !== -1 ? (
													<span className='text-blue-light-high dark:text-blue-dark-high flex items-center gap-4'>
														<Image
															src={auctionIcon}
															height={16}
															width={16}
															alt='Auction Icon'
														/>{' '}
														In Auction
													</span>
												) : parachain.status.search('Testing') !== -1 ? (
													<span className='text-blue-light-high dark:text-blue-dark-high flex items-center gap-4'>
														<Image
															src={testingIcon}
															height={16}
															width={16}
															alt='Testing Icon'
														/>{' '}
														Testing
													</span>
												) : parachain.status.search('announced') !== -1 ? (
													<span className='text-blue-light-high dark:text-blue-dark-high flex items-center gap-4'>
														<Image
															src={announcedIcon}
															height={16}
															width={16}
															alt='Announced Icon'
														/>{' '}
														Announced
													</span>
												) : parachain.status.search('live') !== -1 ? (
													<span className='text-blue-light-high dark:text-blue-dark-high flex items-center gap-4'>
														<Image
															src={liveIcon}
															height={16}
															width={16}
															alt='Live Icon'
														/>{' '}
														Live
													</span>
												) : null}
											</TableCell>
											<TableCell className='py-4'>{parachain.token}</TableCell>
											<TableCell className='py-4'>
												<Image
													src={parachain.w3fGrant?.terminated ? w3fRedLogo : parachain.w3fGrant?.milestoneText ? w3fBlackLogo : w3fGreenLogo}
													height={34}
													width={34}
													alt='W3F Logo'
												/>
											</TableCell>
											<TableCell className='py-4'>{parachain.investorsCount}</TableCell>
											<TableCell className='py-4'>
												<Link
													href={parachain.githubURL}
													target='_blank'
													rel='noreferrer'
												>
													<FaGithub className='text-2xl' />
												</Link>
											</TableCell>
										</TableRow>
									))}
							</TableBody>
						</Table>
					</TabsContent>
				</Tabs>
			</div>
		</div>
	);
}

export default ParachainsPage;
