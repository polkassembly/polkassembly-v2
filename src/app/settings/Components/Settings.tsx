// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { IGenerateTFAResponse } from '@/_shared/types';
import { useUser } from '@/app/_atoms/user/userAtom';
import { nextApiClientFetch } from '@/app/_client-utils/nextApiClientFetch';
import { Input } from '@/app/_shared-components/Input';
import { Button } from '@ui/Button';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

function Settings() {
	const [tfaCode, setTfaCode] = useState<string>('');
	const router = useRouter();
	const [generatingCode, setGeneratingCode] = useState<boolean>(false);
	const [authenticatorCode, setAuthenticatorCode] = useState<string>('');

	const [user, setUser] = useUser();

	useEffect(() => {
		if (!user) {
			router.replace('/');
		}
	}, [user, router]);

	useEffect(() => {
		const generateTfaCode = async () => {
			if (user?.isTFAEnabled) return;

			setGeneratingCode(true);
			const data = await nextApiClientFetch<IGenerateTFAResponse>('/auth/actions/tfa/setup/generate');
			if (data) {
				setTfaCode(data.base32Secret);
			}
			setGeneratingCode(false);
		};
		generateTfaCode();
	}, [user]);

	const verifyCode = async () => {
		if (!authenticatorCode) return;

		const data = await nextApiClientFetch<{ message: string }>('/auth/actions/tfa/setup/verify', {
			authCode: authenticatorCode
		});
		if (data && user) {
			console.log(data.message);
			setUser({
				...user,
				isTFAEnabled: true
			});
		}
	};

	return (
		<div className=''>
			{user && user.isTFAEnabled ? (
				<p className='text-sm text-text_primary'>TFA Enabled</p>
			) : (
				<div className='flex flex-col gap-y-4'>
					<div>
						<p className='mb-2 text-sm text-text_primary'>Enter the Code to Your App (base32 encoded) :</p>
						{generatingCode ? (
							'Generating...'
						) : (
							<Button
								variant='ghost'
								onClick={() => navigator.clipboard.writeText(`${tfaCode}`)}
							>
								{tfaCode}
							</Button>
						)}
					</div>
					<div className='flex flex-col gap-y-2'>
						<p>Verify Code</p>
						<p>Please input the authentication code :</p>
						<Input onChange={(e) => setAuthenticatorCode(e.target.value)} />
						<Button onClick={verifyCode}>Verify</Button>
					</div>
				</div>
			)}
		</div>
	);
}

export default Settings;
