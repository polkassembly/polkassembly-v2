// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { useUser } from '@/hooks/useUser';
import { AuthClientService } from '@/app/_client-services/auth_client_service';
import { Input } from '@/app/_shared-components/Input';
import { Button } from '@ui/Button';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import QrCode from 'react-qr-code';
import { Copy } from 'lucide-react';
import { useTranslations } from 'next-intl';
import LoadingLayover from '../../LoadingLayover';

function ActivateTfa() {
	const t = useTranslations();
	const [tfaCode, setTfaCode] = useState<string>('');
	const router = useRouter();
	const [generatingCode, setGeneratingCode] = useState<boolean>(false);
	const [authenticatorCode, setAuthenticatorCode] = useState<string>('');
	const [loading, setLoading] = useState<boolean>(false);
	const [qrCode, setQrCode] = useState<string>('');

	const { user, setUser } = useUser();

	useEffect(() => {
		if (!user) {
			router.replace('/');
		}
	}, [user, router]);

	useEffect(() => {
		const generateTfaCode = async () => {
			if (user?.isTFAEnabled) return;

			setGeneratingCode(true);
			const { data, error } = await AuthClientService.generateTfaToken();

			if (error) {
				// TODO: show notification
				return;
			}

			if (data) {
				setTfaCode(data.base32Secret);
				setQrCode(data.otpauthUrl);
			}
			setGeneratingCode(false);
		};
		generateTfaCode();
	}, [user]);

	const verifyCode = async () => {
		if (!authenticatorCode) return;

		setLoading(true);

		const { data, error } = await AuthClientService.verifyTfaToken({
			authCode: authenticatorCode
		});

		if (error) {
			// TODO: show notification
			setLoading(false);
			return;
		}

		if (data && user) {
			setUser({
				...user,
				isTFAEnabled: true
			});
		}

		setLoading(false);
	};

	if (user?.isTFAEnabled) {
		return <p>TFA Enabled</p>;
	}

	return (
		<div className='relative flex flex-col gap-y-4'>
			{generatingCode && <LoadingLayover />}
			<p className='text-xl font-semibold text-text_primary'>{t('Profile.Settings.TFA.configuringGoogleAuthenticator')}</p>
			<div className='flex flex-col gap-y-2 text-text_primary'>
				<p>{t('Profile.Settings.TFA.installGoogleAuthenticator')}</p>
				<p>{t('Profile.Settings.TFA.selectAddIcon')}</p>
				<p>{t('Profile.Settings.TFA.scanQRCode')}</p>
			</div>
			<p className='font-semibold text-text_primary'>{t('Profile.Settings.TFA.scanQRCodeDescription')}</p>
			<div className='flex justify-center'>
				<div className='rounded-lg bg-white p-2'>
					<QrCode
						value={qrCode}
						size={180}
					/>
				</div>
			</div>
			<p className='font-semibold text-text_primary'>{t('Profile.Settings.TFA.orEnterTheCodeToYourApp')}</p>
			<div className='flex'>
				<Button
					variant='secondary'
					onClick={() => navigator.clipboard.writeText(`${tfaCode}`)}
					leftIcon={<Copy size={24} />}
				>
					{tfaCode}
				</Button>
			</div>

			<div className='flex flex-col gap-y-2'>
				<p className='font-semibold text-text_primary'>{t('Profile.Settings.TFA.verifyCode')}</p>
				<p className='text-text_primary'>{t('Profile.Settings.TFA.verifyCodeDescription')}</p>
				<Input onChange={(e) => setAuthenticatorCode(e.target.value)} />
				<Button
					onClick={verifyCode}
					disabled={!authenticatorCode}
					isLoading={loading}
				>
					{t('Profile.Settings.TFA.verify')}
				</Button>
			</div>
		</div>
	);
}

export default ActivateTfa;
