// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@ui/Table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@ui/Tabs';
import { Tooltip, TooltipContent, TooltipTrigger } from '@ui/Tooltip';
import { ENetwork, IParachain } from '@/_shared/types';
import { useTranslations } from 'next-intl';
import { convertCamelCaseToTitleCase } from '@/_shared/_utils/convertCamelCaseToTitleCase';
import { cn } from '@/lib/utils';
import styles from '../../parachains.module.scss';

function ParachainTable({ parachainsData }: { parachainsData: IParachain[] }) {
	const t = useTranslations('Parachains');
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
		<div className='rounded-lg bg-bg_modal p-5 shadow-md'>
			<p className='text-xl font-medium text-btn_secondary_text'>{t('projects')}</p>
			<Tabs
				defaultValue={ENetwork.POLKADOT}
				className='my-5'
			>
				<TabsList>
					<TabsTrigger value={ENetwork.POLKADOT}>Polkadot</TabsTrigger>
					<TabsTrigger value={ENetwork.KUSAMA}>Kusama</TabsTrigger>
				</TabsList>
				<TabsContent value={ENetwork.POLKADOT}>
					<div className={styles.parachainsTable}>
						<Table>
							<TableHeader className='sticky top-0 z-10 bg-page_background'>
								<TableRow className='text-sm font-medium text-wallet_btn_text'>
									<TableHead className='py-4'>{t('index')}</TableHead>
									<TableHead className='py-4'>{t('projects')}</TableHead>
									<TableHead className='py-4'>{t('status')}</TableHead>
									<TableHead className='py-4'>{t('token')}</TableHead>
									<TableHead className='py-4'>{t('w3f')}</TableHead>
									<TableHead className='py-4'>{t('investors')}</TableHead>
									<TableHead className='py-4'>{t('github')}</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{parachainsData
									.filter((parachain) => parachain.chain === ENetwork.POLKADOT)
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
												{parachain.badges.map((item: string) => (
													<div
														key={item}
														className={styles.parachainBadge}
														style={{ borderRadius: '48px', marginRight: '10px', padding: '4px 10px' }}
													>
														{item}
													</div>
												))}
											</TableCell>
											<TableCell>
												{' '}
												{parachain.status.search('auction') !== -1 ? (
													<span className={styles.parachainStatus}>
														<Image
															src={auctionIcon}
															height={16}
															width={16}
															alt='Auction Icon'
														/>{' '}
														{t('inAuction')}
													</span>
												) : parachain.status.search('Testing') !== -1 ? (
													<span className={styles.parachainStatus}>
														<Image
															src={testingIcon}
															height={16}
															width={16}
															alt='Testing Icon'
														/>{' '}
														{t('testing')}
													</span>
												) : parachain.status.search('announced') !== -1 ? (
													<span className={styles.parachainStatus}>
														<Image
															src={announcedIcon}
															height={16}
															width={16}
															alt='Announced Icon'
														/>{' '}
														{t('announced')}
													</span>
												) : parachain.status.search('live') !== -1 ? (
													<span className={styles.parachainStatus}>
														<Image
															src={liveIcon}
															height={16}
															width={16}
															alt='Live Icon'
														/>{' '}
														{t('live')}
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
														<TooltipContent className={cn(styles.tooltipContent, 'bg-address_tooltip_bg')}>
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
					</div>
				</TabsContent>
				<TabsContent value={ENetwork.KUSAMA}>
					<div className={styles.parachainsTable}>
						<Table>
							<TableHeader className='sticky top-0 z-10 bg-page_background'>
								<TableRow className='text-sm font-medium text-wallet_btn_text'>
									<TableHead className='py-4'>{t('index')}</TableHead>
									<TableHead className='py-4'>{t('projects')}</TableHead>
									<TableHead className='py-4'>{t('status')}</TableHead>
									<TableHead className='py-4'>{t('token')}</TableHead>
									<TableHead className='py-4'>{t('w3f')}</TableHead>
									<TableHead className='py-4'>{t('investors')}</TableHead>
									<TableHead className='py-4'>{t('github')}</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{parachainsData
									.filter((parachain) => parachain.chain === ENetwork.KUSAMA)
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
												{parachain.badges.map((item: string) => (
													<div
														key={item}
														className={styles.parachainBadge}
														style={{ borderRadius: '48px', marginRight: '10px', padding: '4px 10px' }}
													>
														{item}
													</div>
												))}
											</TableCell>
											<TableCell className='py-4'>
												{' '}
												{parachain.status.search('auction') !== -1 ? (
													<span className={styles.parachainStatus}>
														<Image
															src={auctionIcon}
															height={16}
															width={16}
															alt='Auction Icon'
														/>{' '}
														{t('inAuction')}
													</span>
												) : parachain.status.search('Testing') !== -1 ? (
													<span className={styles.parachainStatus}>
														<Image
															src={testingIcon}
															height={16}
															width={16}
															alt='Testing Icon'
														/>{' '}
														{t('testing')}
													</span>
												) : parachain.status.search('announced') !== -1 ? (
													<span className={styles.parachainStatus}>
														<Image
															src={announcedIcon}
															height={16}
															width={16}
															alt='Announced Icon'
														/>{' '}
														{t('announced')}
													</span>
												) : parachain.status.search('live') !== -1 ? (
													<span className={styles.parachainStatus}>
														<Image
															src={liveIcon}
															height={16}
															width={16}
															alt='Live Icon'
														/>{' '}
														{t('live')}
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
														<TooltipContent className={cn(styles.tooltipContent, 'bg-address_tooltip_bg')}>
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
					</div>
				</TabsContent>
			</Tabs>
		</div>
	);
}

export default ParachainTable;
