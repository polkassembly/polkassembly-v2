// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/app/_shared-components/Dialog/Dialog';
import { Button } from '@/app/_shared-components/Button';
import { Copy } from 'lucide-react';
import { ENotificationChannel, ENotificationStatus } from '@/_shared/types';
import { useToast } from '@/hooks/useToast';

interface TelegramInfoModalProps {
	Icon: React.ComponentType<{ width?: number; height?: number; className?: string }>;
	title: string;
	open: boolean;
	getVerifyToken: (channel: ENotificationChannel) => Promise<string>;
	generatedToken?: string;
	onClose: () => void;
}

function TelegramInfoModal({ Icon, title, open, getVerifyToken, generatedToken = '', onClose }: TelegramInfoModalProps) {
	const t = useTranslations('Profile.Settings.Notifications.Modals');
	const { toast } = useToast();
	const [loading, setLoading] = useState(false);
	const [token, setToken] = useState(generatedToken);
	const username = 'user';

	const handleGenerateToken = async () => {
		setLoading(true);
		try {
			const data = await getVerifyToken(ENotificationChannel.TELEGRAM);
			setToken(data);
			toast({
				title: 'Token Generated Successfully',
				status: ENotificationStatus.SUCCESS
			});
		} catch (error) {
			console.error('Failed to generate verification token:', error);
			toast({
				title: 'Error Generating Token',
				status: ENotificationStatus.ERROR
			});
		} finally {
			setLoading(false);
		}
	};

	const handleCopyClicked = async (text: string) => {
		try {
			await navigator.clipboard.writeText(text);
			toast({
				title: 'Copied to clipboard',
				status: ENotificationStatus.SUCCESS
			});
		} catch (error) {
			console.error('Failed to copy to clipboard:', error);
		}
	};

	return (
		<Dialog
			open={open}
			onOpenChange={(isOpen) => !isOpen && onClose()}
		>
			<DialogContent className='max-w-xl p-4 sm:p-6'>
				<DialogHeader>
					<DialogTitle className='flex items-center gap-3'>
						<Icon
							width={20}
							height={20}
							className='text-text_primary'
						/>{' '}
						{title}
					</DialogTitle>
				</DialogHeader>

				<div className='space-y-4'>
					<ol className='list-inside list-decimal space-y-4'>
						<li className='leading-relaxed dark:text-white'>
							{t('clickInviteLink')}{' '}
							<Button
								variant='outline'
								size='sm'
								asChild
								className='mx-2 h-auto px-2 py-1'
							>
								<a
									href='https://t.me/PolkassemblyBot'
									target='_blank'
									rel='noreferrer'
								>
									t.me/PolkassemblyBot
								</a>
							</Button>
							<br />
							{t('orAdd')}{' '}
							<Button
								variant='outline'
								size='sm'
								onClick={() => handleCopyClicked('@PolkassemblyBot')}
								className='mx-2 h-auto px-2 py-1'
								leftIcon={<Copy className='h-3 w-3' />}
							>
								@PolkassemblyBot
							</Button>{' '}
							{t('toYourTelegramChat')}
						</li>

						<li className='leading-relaxed dark:text-white'>
							{t('sendThisCommand')}
							<br />
							<Button
								variant='outline'
								size='sm'
								onClick={() => handleCopyClicked('/add <username> <verificationToken>')}
								className='mx-2 mt-2 h-auto px-2 py-1'
								leftIcon={<Copy className='h-3 w-3' />}
							>
								{'<username>'} {'<verificationToken>'}
							</Button>
							<div className='mt-4 flex justify-end'>
								<Button
									isLoading={loading}
									onClick={handleGenerateToken}
									variant='default'
								>
									{t('generateToken')}
								</Button>
							</div>
							{token && (
								<div className='mt-4 space-y-2'>
									<div className='flex items-center gap-2 dark:text-white'>
										<span>{t('usernameAndVerificationToken')}</span>
									</div>
									<Button
										variant='outline'
										onClick={() => handleCopyClicked(`/add ${username} ${token}`)}
										className='h-auto max-w-full px-2 py-1'
										leftIcon={<Copy className='h-3 w-3' />}
									>
										<span className='mr-2 max-w-24 overflow-hidden text-ellipsis whitespace-nowrap'>{username}</span>
										<span className='max-w-24 overflow-hidden text-ellipsis whitespace-nowrap'>{token}</span>
									</Button>
								</div>
							)}
						</li>

						<li className='leading-relaxed dark:text-white'>
							{t('optionalSendHelp')}{' '}
							<Button
								variant='outline'
								size='sm'
								onClick={() => handleCopyClicked('/start')}
								className='mx-2 h-auto px-2 py-1'
								leftIcon={<Copy className='h-3 w-3' />}
							>
								/start
							</Button>
						</li>
					</ol>
				</div>
			</DialogContent>
		</Dialog>
	);
}

export default TelegramInfoModal;
