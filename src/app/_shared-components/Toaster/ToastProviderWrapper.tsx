// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { useToast } from '@/hooks/useToast';
import { Toast, ToastClose, ToastDescription, ToastProvider, ToastTitle, ToastViewport } from '@/app/_shared-components/Toaster/Toast';
import { ENotificationStatus } from '@/_shared/types';
import { FaCheckCircle } from '@react-icons/all-files/fa/FaCheckCircle';
import { IoIosCloseCircle } from '@react-icons/all-files/io/IoIosCloseCircle';
import { IoIosInformationCircle } from '@react-icons/all-files/io/IoIosInformationCircle';
import { MdInfoOutline } from '@react-icons/all-files/md/MdInfoOutline';
import styles from './Toaster.module.scss';

const ICON_MAP = {
	[ENotificationStatus.SUCCESS]: <FaCheckCircle className={styles.toast_success_icon} />,
	[ENotificationStatus.ERROR]: <IoIosCloseCircle className={styles.toast_error_icon} />,
	[ENotificationStatus.WARNING]: <IoIosInformationCircle className={styles.toast_warning_icon} />,
	[ENotificationStatus.INFO]: <MdInfoOutline className={styles.toast_info_icon} />
} as const;

const getIconForStatus = (status: ENotificationStatus) => ICON_MAP[status as keyof typeof ICON_MAP] ?? null;

export function ToastProviderWrapper() {
	const { toasts } = useToast();

	return (
		<ToastProvider>
			{toasts.map(({ id, title, description, status, action, ...props }) => (
				<Toast
					key={id}
					status={status}
					variant={status}
					{...props}
				>
					<div className='grid gap-2'>
						<div className={`flex gap-2 ${description ? 'items-start' : 'items-center'}`}>
							<span>{status && getIconForStatus(status as ENotificationStatus)}</span>
							<div className='flex flex-col gap-1'>
								{title && <ToastTitle>{title}</ToastTitle>}
								{description && <ToastDescription>{description}</ToastDescription>}
							</div>
						</div>
					</div>
					{action}
					<ToastClose />
				</Toast>
			))}
			<ToastViewport className='top-0' />
		</ToastProvider>
	);
}
