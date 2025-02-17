// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { useToast } from '@/hooks/use-toast';
import { Toast, ToastClose, ToastDescription, ToastProvider, ToastTitle, ToastViewport } from '@ui/Toaster/toast';
import { getIconForStatus, NotificationStatus } from './queueNotification';

export function Toaster() {
	const { toasts } = useToast();

	return (
		<ToastProvider>
			{toasts.map(function renderToast({ id, title, description, status, action, ...props }) {
				return (
					<Toast
						key={id}
						{...props}
						className='bg-white'
					>
						<div className='grid gap-2'>
							<div className='flex items-start gap-2'>
								<span>{status && getIconForStatus(status as NotificationStatus)}</span>
								<div className='flex flex-col gap-1'>
									{title && <ToastTitle>{title}</ToastTitle>}
									{description && <ToastDescription>{description}</ToastDescription>}
								</div>
							</div>
						</div>
						{action}
						<ToastClose />
					</Toast>
				);
			})}
			<ToastViewport className='top-0' />
		</ToastProvider>
	);
}
