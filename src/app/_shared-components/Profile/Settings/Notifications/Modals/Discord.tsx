// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/app/_shared-components/Dialog/Dialog';
import { Button } from '@/app/_shared-components/Button';
import { Copy } from 'lucide-react';
import { ENotificationChannel } from '@/_shared/types';

interface DiscordInfoModalProps {
	icon: React.ReactNode;
	title: string;
	open: boolean;
	getVerifyToken: (channel: ENotificationChannel) => Promise<string>;
	generatedToken?: string;
	onClose: () => void;
}

function DiscordInfoModal({ icon, title, open, getVerifyToken, generatedToken = '', onClose }: DiscordInfoModalProps) {
	const [loading, setLoading] = useState(false);
	const [token, setToken] = useState(generatedToken);
	const username = 'user';

	const handleGenerateToken = async () => {
		setLoading(true);
		try {
			const data = await getVerifyToken(ENotificationChannel.DISCORD);
			setToken(data);
		} catch {
			// Handle error silently or use proper error handling
		} finally {
			setLoading(false);
		}
	};

	const handleCopyClicked = async (text: string) => {
		try {
			await navigator.clipboard.writeText(text);
			// Successfully copied to clipboard
		} catch {
			// Handle copy error silently or use proper error handling
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
							Click this invite link{' '}
							<Button
								variant='outline'
								size='sm'
								asChild
								className='mx-2 h-auto px-2 py-1'
							>
								<a
									href='https://discord.com/oauth2/authorize?client_id=1112538708219007017&permissions=397284485120&scope=bot'
									target='_blank'
									rel='noreferrer'
								>
									discord.com/api/oauth2/
								</a>
							</Button>
						</li>

						<li className='leading-relaxed dark:text-white'>
							Send this command to the chat with the bot:
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
									Generate Token
								</Button>
							</div>
							{token && (
								<div className='mt-4 space-y-3'>
									<div className='leading-relaxed dark:text-white'>
										Copy your username:{' '}
										<Button
											variant='outline'
											size='sm'
											onClick={() => handleCopyClicked(username)}
											className='mx-2 h-auto px-2 py-1'
											leftIcon={<Copy className='h-3 w-3' />}
										>
											{username}
										</Button>
									</div>

									<div className='dark:text-white'>
										<span>Verification Token: </span>
										<div className='mt-2 space-y-2'>
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
