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

interface DiscordInfoModalProps {
	icon: ReactNode;
	title: string;
	open: boolean;
	getVerifyToken: (channel: ENotificationChannel) => Promise<string>;
	generatedToken?: string;
	username: string;
	onClose: () => void;
}

function DiscordInfoModal({ icon, title, open, getVerifyToken, generatedToken = '', username, onClose }: DiscordInfoModalProps) {
	const t = useTranslations('Profile.Settings.Notifications.Modals');
	const [loading, setLoading] = useState(false);
	const [token, setToken] = useState(generatedToken);

	const { toast } = useToast();

	const handleGenerateToken = async () => {
		setLoading(true);
		try {
			const data = await getVerifyToken(ENotificationChannel.DISCORD);
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

	const handleCopyClicked = async (text: string, successMsg: string) => {
		try {
			await navigator.clipboard.writeText(text);
			toast({
				title: successMsg,
				status: ENotificationStatus.SUCCESS
			});
		} catch {
			toast({ title: t('copyFailed'), status: ENotificationStatus.ERROR });
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
							{t('clickInviteLink')}{' '}
							<Button
								variant='outline'
								size='sm'
								asChild
								className='mx-2 h-auto px-2 py-1'
							>
								<a
									href='https://discord.com/oauth2/authorize?client_id=1112538708219007017&permissions=397284485120&scope=bot'
									target='_blank'
									rel='noreferrer noopener'
								>
									discord.com/api/oauth2/
								</a>
							</Button>
						</li>

						<li className='leading-relaxed dark:text-white'>
							{t('sendThisCommand')}
							<br />
							<Button
								variant='outline'
								size='sm'
								onClick={() => handleCopyClicked('/add <username> <verificationToken>', t('commandCopied'))}
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
								<div className='mt-4 space-y-3'>
									<div className='leading-relaxed dark:text-white'>
										{t('copyYourUsername')}{' '}
										<Button
											variant='outline'
											size='sm'
											onClick={() => handleCopyClicked(username, t('usernameCopied'))}
											className='mx-2 h-auto px-2 py-1'
											leftIcon={<Copy className='h-3 w-3' />}
										>
											{username}
										</Button>
									</div>

									<div className='dark:text-white'>
										<span>{t('verificationToken')}: </span>
										<div className='mt-2 space-y-2'>
											<Button
												variant='outline'
												size='sm'
												onClick={() => handleCopyClicked(token, t('tokenCopied'))}
												className='hidden h-auto px-2 py-1 sm:inline-flex'
												leftIcon={<Copy className='h-3 w-3' />}
											>
												{token}
											</Button>
											<Button
												variant='outline'
												size='sm'
												onClick={() => handleCopyClicked(token, t('tokenCopied'))}
												className='h-auto px-2 py-1 sm:hidden'
												leftIcon={<Copy className='h-3 w-3' />}
											>
												{shortenString(token, 10)}
											</Button>
										</div>
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

export default DiscordInfoModal;
