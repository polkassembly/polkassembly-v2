// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { Button } from '@/app/_shared-components/Button';
import { Switch } from '@/app/_shared-components/Switch';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { ENotificationChannel } from '@/_shared/types';
import { EmailIcon } from './Icons';

interface EmailNotificationCardProps {
	verifiedEmail: string;
	verified: boolean;
	enabled: boolean;
	handleEnableDisabled: (channel: ENotificationChannel, enabled: boolean) => void;
}

function EmailNotificationCard({ verifiedEmail, verified, enabled, handleEnableDisabled }: EmailNotificationCardProps) {
	return (
		<div className='flex items-start justify-between rounded-lg p-4'>
			<div className='flex items-start gap-3'>
				<div className='mt-1'>
					<EmailIcon
						width={20}
						height={20}
						className='text-text_primary'
					/>
				</div>
				<div className='flex-1 text-btn_secondary_text'>
					<h4 className='text-base font-medium text-text_primary'>Email Notifications</h4>
					<div className='flex items-center gap-2'>
						{verifiedEmail ? (
							<>
								<span className='text-text_secondary text-sm'>{verifiedEmail}</span>
								{verified ? <CheckCircle className='h-4 w-4 text-success' /> : <AlertCircle className='h-4 w-4 text-warning' />}
							</>
						) : (
							<span className='text-text_secondary text-sm'>No email configured</span>
						)}
					</div>
					{!verified && verifiedEmail && (
						<Button
							variant='outline'
							size='sm'
							className='mt-2'
						>
							Verify Email
						</Button>
					)}
				</div>
			</div>
			<div className='flex items-center'>
				<Switch
					checked={enabled}
					onCheckedChange={(checked) => handleEnableDisabled(ENotificationChannel.EMAIL, checked)}
					disabled={!verified}
				/>
			</div>
		</div>
	);
}

export default EmailNotificationCard;
