// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ReactNode, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/app/_shared-components/Dialog/Dialog';
import { Button } from '@/app/_shared-components/Button';
import { Copy } from 'lucide-react';
import { ENotificationChannel, ENotificationStatus } from '@/_shared/types';
import { useToast } from '@/hooks/useToast';

interface SlackInfoModalProps {
	icon: ReactNode;
	title: string;
	open: boolean;
	getVerifyToken: (channel: ENotificationChannel) => Promise<string>;
	generatedToken?: string;
	onClose: () => void;
}

function SlackInfoModal({ icon, title, open, getVerifyToken, generatedToken = '', onClose }: SlackInfoModalProps) {
	const t = useTranslations('Profile.Settings.Notifications.Modals');
	const { toast } = useToast();
	const [loading, setLoading] = useState(false);
	const TexttoSlack = '/polkassembly-add <username> <verificationToken>';
	const [token, setToken] = useState(generatedToken);

	const handleGenerateToken = async () => {
		setLoading(true);
		try {
			const data = await getVerifyToken(ENotificationChannel.SLACK);
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
			console.error('Failed to copy text:', error);
		}
	};

	const shortenString = (str: string, length: number) => {
		return str.length > length ? `${str.substring(0, length)}...` : str;
	};

	return (
		<Dialog
			open={open}
			onOpenChange={(isOpen) => !isOpen && onClose()}
		>
			<DialogContent className='max-w-xl p-4 sm:p-6'>
				<DialogHeader>
					<DialogTitle className='flex items-center gap-3'>
						{icon} {title}
					</DialogTitle>
				</DialogHeader>

				<div className='space-y-4'>
					<ol className='list-inside list-decimal space-y-4'>
						<li className='leading-relaxed dark:text-white'>
							{t('clickToGetInviteLink')}
							<br />
							<a
								target='_blank'
								href='https://slack.com/oauth/v2/authorize?client_id=1965962071360.5335403564179&scope=channels:join,channels:read,chat:write,commands,im:write&user_scope='
								rel='noreferrer noopener'
								className='mt-2 inline-block'
							>
								<Button
									variant='outline'
									size='sm'
									className='h-10'
								>
									{t('addToSlack')}
								</Button>
							</a>
						</li>

						<li className='leading-relaxed dark:text-white'>
							{t('sendThisCommand')}
							<br />
							<div className='mt-2 space-y-2'>
								<Button
									variant='outline'
									size='sm'
									onClick={() => handleCopyClicked(TexttoSlack)}
									className='hidden h-auto px-2 py-1 sm:inline-flex'
									leftIcon={<Copy className='h-3 w-3' />}
								>
									/polkassembly-add {'<username>'} {'<verificationToken>'}
								</Button>
								<Button
									variant='outline'
									size='sm'
									onClick={() => handleCopyClicked(TexttoSlack)}
									className='h-auto px-2 py-1 sm:hidden'
									leftIcon={<Copy className='h-3 w-3' />}
								>
									{shortenString(TexttoSlack, 10)}
								</Button>
							</div>
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
									<div className='dark:text-white'>
										<span>{t('verificationToken')}:</span>
									</div>
									<div className='space-y-2'>
										<Button
											variant='outline'
											size='sm'
											onClick={() => handleCopyClicked(token)}
											className='hidden h-auto px-2 py-1 sm:inline-flex'
											leftIcon={<Copy className='h-3 w-3' />}
										>
											{token}
										</Button>
										<Button
											variant='outline'
											size='sm'
											onClick={() => handleCopyClicked(token)}
											className='h-auto px-2 py-1 sm:hidden'
											leftIcon={<Copy className='h-3 w-3' />}
										>
											{shortenString(token, 10)}
										</Button>
									</div>
								</div>
							)}
						</li>
					</ol>
				</div>
			</DialogContent>
		</Dialog>
	);
}

export default SlackInfoModal;
