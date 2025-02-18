// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ReactNode } from 'react';
import { toast } from '@/hooks/use-toast';
import { NotificationStatus } from '@/_shared/types';

interface Props {
	header: string;
	message?: string | ReactNode;
	durationInSeconds?: number;
	status: NotificationStatus;
}

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
