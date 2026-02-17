// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useSearchParams } from 'next/navigation';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@ui/Form';
import { PasswordInput } from '@ui/PasswordInput/PasswordInput';
import { Button } from '@/app/_shared-components/Button';
import ErrorMessage from '@ui/ErrorMessage';
import { AuthClientService } from '@/app/_client-services/auth_client_service';
import { ENotificationStatus } from '@/_shared/types';
import { useTranslations } from 'next-intl';
import { useToast } from '@/hooks/useToast';
import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';
import classes from './ResetPassword.module.scss';

interface IFormFields {
	newPassword: string;
	confirmPassword: string;
}

function ResetPassword() {
	const [loading, setLoading] = useState(false);
	const [errorMessage, setErrorMessage] = useState('');
	const [resetSuccess, setResetSuccess] = useState(false);

	const t = useTranslations();
	const { toast } = useToast();
	const searchParams = useSearchParams();
	const token = searchParams.get('token');

	const form = useForm<IFormFields>();

	const handleSubmit = async (values: IFormFields) => {
		const { newPassword, confirmPassword } = values;

		if (!token) {
			setErrorMessage(t('ResetPassword.invalidToken'));
			return;
		}

		if (!newPassword || !confirmPassword) {
			toast({
				status: ENotificationStatus.ERROR,
				title: t('ResetPassword.pleaseEnterPasswords')
			});
			return;
		}

		if (newPassword !== confirmPassword) {
			setErrorMessage(t('ResetPassword.passwordsDoNotMatch'));
			return;
		}

		if (newPassword.length < 6) {
			setErrorMessage(t('ResetPassword.passwordTooShort'));
			return;
		}

		try {
			setLoading(true);
			setErrorMessage('');

			const { error } = await AuthClientService.resetPasswordWithToken({ token, newPassword });

			if (error) {
				setErrorMessage(error.message || '');
				setLoading(false);
				return;
			}

			setResetSuccess(true);
			setLoading(false);
		} catch {
			toast({
				status: ENotificationStatus.ERROR,
				title: t('ResetPassword.failedToResetPassword')
			});
			setLoading(false);
		}
	};

	if (!token) {
		return (
			<div className={classes.rootClass}>
				<div className={classes.card}>
					<div className={classes.cardHeader}>
						<p className='flex items-center gap-x-2 text-lg font-semibold text-text_primary sm:text-xl'>{t('ResetPassword.title')}</p>
					</div>
					<div className={classes.cardBody}>
						<div className='flex flex-col items-center gap-y-4 py-4 text-center'>
							<ErrorMessage errorMessage={t('ResetPassword.invalidOrMissingToken')} />
							<Link
								href='/forgot-password'
								className='text-sm text-text_pink hover:underline'
							>
								{t('ResetPassword.requestNewLink')}
							</Link>
						</div>
					</div>
				</div>
			</div>
		);
	}

	if (resetSuccess) {
		return (
			<div className={classes.rootClass}>
				<div className={classes.card}>
					<div className={classes.cardHeader}>
						<p className='flex items-center gap-x-2 text-lg font-semibold text-text_primary sm:text-xl'>{t('ResetPassword.successTitle')}</p>
					</div>
					<div className={classes.cardBody}>
						<div className='flex flex-col items-center gap-y-4 py-4 text-center'>
							<CheckCircle2 className='h-12 w-12 text-green-500' />
							<p className='text-sm text-text_primary'>{t('ResetPassword.successDescription')}</p>
							<Link
								href='/login'
								className='text-sm text-text_pink hover:underline'
							>
								{t('ResetPassword.goToLogin')}
							</Link>
						</div>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className={classes.rootClass}>
			<div className={classes.card}>
				<div className={classes.cardHeader}>
					<p className='flex items-center gap-x-2 text-lg font-semibold text-text_primary sm:text-xl'>{t('ResetPassword.title')}</p>
				</div>
				<div className={classes.cardBody}>
					<p className='text-text_secondary mb-4 text-sm'>{t('ResetPassword.description')}</p>
					<Form {...form}>
						<form onSubmit={form.handleSubmit(handleSubmit)}>
							<div className={classes.formFields}>
								<div>
									<FormField
										control={form.control}
										name='newPassword'
										key='newPassword'
										disabled={loading}
										rules={{ required: true, minLength: { value: 6, message: t('ResetPassword.passwordTooShort') } }}
										render={({ field }) => (
											<FormItem>
												<FormLabel>{t('ResetPassword.newPassword')}</FormLabel>
												<FormControl>
													<PasswordInput
														placeholder='Type here'
														{...field}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>
								<div>
									<FormField
										control={form.control}
										name='confirmPassword'
										key='confirmPassword'
										disabled={loading}
										rules={{ required: true }}
										render={({ field }) => (
											<FormItem>
												<FormLabel>{t('ResetPassword.confirmPassword')}</FormLabel>
												<FormControl>
													<PasswordInput
														placeholder='Type here'
														{...field}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>
							</div>
							<div className={classes.footer}>
								<Button
									isLoading={loading}
									type='submit'
									className={classes.submitButton}
									size='lg'
								>
									{t('ResetPassword.resetPassword')}
								</Button>
							</div>
						</form>
					</Form>
					{errorMessage && <ErrorMessage errorMessage={errorMessage} />}
					<div className='flex justify-center'>
						<Link
							href='/login'
							className='text-sm text-text_pink hover:underline'
						>
							{t('ResetPassword.backToLogin')}
						</Link>
					</div>
				</div>
			</div>
		</div>
	);
}

export default ResetPassword;
