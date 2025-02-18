// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ReactNode } from 'react';
import { toast } from '@/hooks/use-toast';
import { FaCircleCheck } from 'react-icons/fa6';
import { IoIosCloseCircle, IoIosInformationCircle, IoIosCloseCircleOutline } from 'react-icons/io';
import { NotificationStatus } from '@/_shared/types';
import { MdInfoOutline } from 'react-icons/md';

interface Props {
	header: string;
	message?: string | ReactNode;
	durationInSeconds?: number;
	status: NotificationStatus;
}

export const getIconForStatus = (status: NotificationStatus) => {
	switch (status) {
		case NotificationStatus.SUCCESS:
			return <FaCircleCheck className='h-5 w-5 text-white' />;
		case NotificationStatus.ERROR:
			return <IoIosCloseCircle className='text-toast_error_text h-6 w-6' />;
		case NotificationStatus.WARNING:
			return <IoIosInformationCircle className='text-toast_warning_text h-6 w-6' />;
		case NotificationStatus.INFO:
			return <MdInfoOutline className='text-toast_info_text h-6 w-6' />;
		case NotificationStatus.WARNINGV2:
			return <MdInfoOutline className='text-toast_warning_text h-6 w-6' />;
		case NotificationStatus.ERRORV2:
			return <IoIosCloseCircleOutline className='text-toast_error_text h-6 w-6' />;
		default:
			return null;
	}
};

const NotificationToaster = ({ header, message, durationInSeconds = 4.5, status }: Props) => {
	toast({
		title: header,
		description: message,
		duration: durationInSeconds * 1000,
		status: status as NotificationStatus,
		variant: status as NotificationStatus
	});
};

export default NotificationToaster;
