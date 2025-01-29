// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import Link from 'next/link';
import { useTheme } from 'next-themes';
import Image from 'next/image';
import { ETheme } from '@/_shared/types';
import PaLogoDark from '@assets/logos/PALogoDark.svg';
import { useTranslations } from 'next-intl';
import { FaTwitter, FaTelegramPlane } from 'react-icons/fa';
import { IoLogoDiscord } from 'react-icons/io5';
import { TbWorld } from 'react-icons/tb';
import { BsArrowUpRight } from 'react-icons/bs';
import PaLogo from '../PaLogo';
import styles from './Footer.module.scss';

function Footer() {
	const { resolvedTheme: theme } = useTheme();
	const t = useTranslations();

	return (
		<footer
			aria-label='Site Footer'
			className={styles.footer}
		>
			<div className={styles.footer_container}>
				<div className={styles.footer_logo}>
					<div>
						<div className={styles.footer_logo_link}>
							<Link
								className='flex'
								href='/'
							>
								{theme === ETheme.DARK ? (
									<Image
										src={PaLogoDark}
										alt='Polkassembly Logo'
									/>
								) : (
									<PaLogo
										variant='full'
										className='h-auto w-[180px]'
									/>
								)}
							</Link>
						</div>

						<div className={styles.footer_link}>
							<div className='flex items-center gap-x-5'>
								<a
									href='https://twitter.com/polk_gov'
									target='_blank'
									rel='noreferrer'
								>
									<FaTwitter className={styles.footer_logo_link_icon} />
								</a>

								<a
									href='https://discord.com/invite/CYmYWHgPha'
									target='_blank'
									rel='noreferrer'
								>
									<IoLogoDiscord className={styles.footer_logo_link_icon} />
								</a>

								<a
									href='https://t.me/+6WQDzi6RuIw3YzY1'
									target='_blank'
									rel='noreferrer'
								>
									<FaTelegramPlane className={styles.footer_logo_link_icon} />
								</a>

								<a
									href='https://polkassembly.io/'
									target='_blank'
									rel='noreferrer'
								>
									<TbWorld className={styles.footer_logo_link_icon} />
								</a>
							</div>
						</div>
					</div>

					{/* Terms Links */}
					<div className={styles.footer_container_2}>
						<div className='text-center sm:text-left'>
							<p className='text-lg font-bold'>{t('Footer.helpCenter')}</p>

							<nav
								aria-label='Footer About Nav'
								className='pt-4 md:pt-3'
							>
								<div className={styles.footer_container_2_link_a}>
									<div>
										<a
											href='https://feedback.polkassembly.io/'
											target='_blank'
											rel='noreferrer'
											className='flex items-center gap-x-1'
										>
											{t('Footer.reportAnIssue')}
											<BsArrowUpRight className='ml-3' />
										</a>
									</div>
									<div>
										<a
											href='https://feedback.polkassembly.io'
											target='_blank'
											rel='noreferrer'
											className='flex items-center gap-x-1'
										>
											{t('Footer.feedback')}
											<BsArrowUpRight className='ml-3' />
										</a>
									</div>
									<div className='hidden sm:block'>
										<Link href='/terms-and-conditions'>{t('Footer.termsAndConditions')}</Link>
									</div>
									<div>
										<a
											href='https://github.com/polkassembly/polkassembly'
											target='_blank'
											rel='noreferrer'
											className='flex items-center gap-x-1'
										>
											{t('Footer.github')}
											<BsArrowUpRight className='ml-3' />
										</a>
									</div>
								</div>
							</nav>
						</div>

						<div className='text-center font-normal sm:text-left'>
							<p className='text-lg font-bold'>{t('Footer.ourServices')}</p>

							<nav
								aria-label='Footer Services Nav'
								className='pt-4 md:pt-3'
							>
								<div className={styles.footer_container_2_link_a}>
									<div>
										<a
											href='https://docs.polkassembly.io/'
											target='_blank'
											rel='noreferrer'
											className='flex items-center gap-x-1'
										>
											{t('Footer.docs')}
											<BsArrowUpRight className='ml-3' />
										</a>
									</div>

									<div className='hidden sm:block'>
										<Link href='/terms-of-website'>{t('Footer.termsOfWebsite')}</Link>
									</div>

									<div className='hidden sm:block'>
										<Link href='/privacy'>{t('Footer.privacyPolicy')}</Link>
									</div>
								</div>
							</nav>
						</div>
					</div>
				</div>

				{/* Below divider */}
				<hr className='pb-0' />
				<div className='pb-3 pt-5 text-sm font-medium'>
					<div>
						<div className={styles.footer_container_2_link_a_p}>
							<div className='flex flex-col gap-2 lg:flex-row'>
								<p>{t('Footer.aHouseOfCommonsInitiative')}</p>
								<p>
									{t('Footer.polkaLabsPrivateLimited')} {new Date().getFullYear()}
								</p>
							</div>
							<div>
								<p className='block sm:inline'>{t('Footer.allRightsReservedYear')}</p>
							</div>
						</div>
					</div>
				</div>
				<div className='md:hidden'>
					<div className='flex justify-center pt-1'>
						<div className='flex items-center gap-x-2'>
							<a
								href='https://twitter.com/polk_gov'
								target='_blank'
								rel='noreferrer'
							>
								<FaTwitter className={styles.footer_logo_link_icon} />
							</a>

							<a
								href='https://discord.com/invite/CYmYWHgPha'
								target='_blank'
								rel='noreferrer'
							>
								<IoLogoDiscord className={styles.footer_logo_link_icon} />
							</a>

							<a
								href='https://t.me/+6WQDzi6RuIw3YzY1'
								target='_blank'
								rel='noreferrer'
							>
								<FaTelegramPlane className={styles.footer_logo_link_icon} />
							</a>

							<a
								href='https://polkassembly.io/'
								target='_blank'
								rel='noreferrer'
							>
								<TbWorld className={styles.footer_logo_link_icon} />
							</a>
						</div>
					</div>

					<div className={styles.footer_container_2_link_a_p_p}>
						<div className='flex justify-center'>
							<Link href='/terms-and-conditions'>{t('Footer.termsAndConditions')}</Link>
							<Link
								href='/terms-of-website'
								className='pl-2'
							>
								{t('Footer.termsOfWebsite')}
							</Link>
						</div>
						<Link
							href='/privacy'
							className='mx-auto pt-2'
						>
							{t('Footer.privacyPolicy')}
						</Link>
					</div>
				</div>
			</div>
		</footer>
	);
}

export default Footer;
