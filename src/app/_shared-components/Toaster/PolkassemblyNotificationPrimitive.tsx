// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ReactNode } from 'react';
import { toast } from '@/hooks/use-toast';
import { FaCircleCheck } from 'react-icons/fa6';
import { IoIosCloseCircle, IoIosInformationCircle } from 'react-icons/io';
import { NotificationStatus } from '@/_shared/types';

interface Props {
	header: string;
	message?: string | ReactNode;
	durationInSeconds?: number;
	status: NotificationStatus;
}

export const getIconForStatus = (status: NotificationStatus) => {
	switch (status) {
		case NotificationStatus.SUCCESS:
			return <FaCircleCheck className='h-6 w-6 text-green-400' />;
		case NotificationStatus.ERROR:
			return <IoIosCloseCircle className='h-7 w-7 text-red-400' />;
		case NotificationStatus.WARNING:
			return <IoIosInformationCircle className='h-7 w-7 text-yellow-400' />;
		case NotificationStatus.INFO:
			return <IoIosInformationCircle className='h-7 w-7 text-blue-400' />;
		default:
			return null;
	}
};

const PolkassemblyNotificationPrimitive = ({ header, message, durationInSeconds = 4.5, status }: Props) => {
	toast({
		title: header,
		description: message,
		duration: durationInSeconds * 1000,
		status: status as NotificationStatus
	});
};

export default PolkassemblyNotificationPrimitive;
