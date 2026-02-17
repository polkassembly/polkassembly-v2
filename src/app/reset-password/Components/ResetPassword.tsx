// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { ENotificationStatus } from '@/_shared/types';
import { ValidatorService } from '@/_shared/_services/validator_service';
import { Button } from '@/app/_shared-components/Button';
import { PasswordInput } from '@ui/PasswordInput/PasswordInput';
import ErrorMessage from '@ui/ErrorMessage';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@ui/Form';
import { AuthClientService } from '@/app/_client-services/auth_client_service';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useSearchParams } from 'next/navigation';
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
	const [loading, setLoading] = useState<boolean>(false);
	const [errorMessage, setErrorMessage] = useState<string>('');
	const [isSuccess, setIsSuccess] = useState<boolean>(false);
	const t = useTranslations();
	const form = useForm<IFormFields>();
	const { toast } = useToast();
	const searchParams = useSearchParams();
	const token = searchParams.get('token');

	const pleaseEnterPasswordsMsg = t('ResetPassword.pleaseEnterPasswords');

	const handleSubmit = async (values: IFormFields) => {
		const { newPassword, confirmPassword } = values;

		if (!token) {
			setErrorMessage(t('ResetPassword.invalidOrMissingToken'));
			return;
		}

		if (!newPassword || !confirmPassword) {
			toast({
				status: ENotificationStatus.ERROR,
				title: pleaseEnterPasswordsMsg
			});
			return;
		}

		if (newPassword !== confirmPassword) {
			toast({
				status: ENotificationStatus.ERROR,
				title: t('ResetPassword.passwordsDoNotMatch')
			});
			return;
		}

		if (!ValidatorService.isValidPassword(newPassword)) {
			toast({
				status: ENotificationStatus.ERROR,
				title: t('ResetPassword.passwordTooShort')
			});
			return;
		}

		try {
			setLoading(true);
			setErrorMessage('');

			const { error } = await AuthClientService.resetPasswordWithToken({ token, newPassword });

			if (error) {
				setErrorMessage(error.message || t('ResetPassword.failedToResetPassword'));
				setLoading(false);
				return;
			}

			setIsSuccess(true);
			toast({
				status: ENotificationStatus.SUCCESS,
				title: t('ResetPassword.successTitle')
			});
		} catch {
			setErrorMessage(t('ResetPassword.failedToResetPassword'));
		} finally {
			setLoading(false);
		}
	};

	if (!token) {
		return (
			<div className='flex flex-col items-center gap-y-6 p-8 text-center'>
				<div>
					<h2 className='text-xl font-semibold text-text_primary'>{t('ResetPassword.invalidToken')}</h2>
					<p className='text-text_secondary mt-2 text-sm'>{t('ResetPassword.invalidOrMissingToken')}</p>
				</div>
				<Link href='/forgot-password'>
					<Button
						variant='outline'
						size='lg'
					>
						{t('ResetPassword.requestNewLink')}
					</Button>
				</Link>
			</div>
		);
	}

	if (isSuccess) {
		return (
			<div className='flex flex-col items-center gap-y-6 p-8 text-center'>
				<div className='flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20'>
					<CheckCircle2 className='h-8 w-8 text-green-600 dark:text-green-400' />
				</div>
				<div>
					<h2 className='text-xl font-semibold text-text_primary'>{t('ResetPassword.successTitle')}</h2>
					<p className='text-text_secondary mt-2 text-sm'>{t('ResetPassword.successDescription')}</p>
				</div>
				<Link href='/login'>
					<Button size='lg'>{t('ResetPassword.goToLogin')}</Button>
				</Link>
			</div>
		);
	}

	return (
		<div className='px-4 py-4 sm:px-12'>
			<div className='mb-6'>
				<h2 className='text-xl font-semibold text-text_primary'>{t('ResetPassword.title')}</h2>
				<p className='text-text_secondary mt-2 text-sm'>{t('ResetPassword.description')}</p>
			</div>
			<Form {...form}>
				<form onSubmit={form.handleSubmit(handleSubmit)}>
					<div className={classes.header}>
						<FormField
							control={form.control}
							name='newPassword'
							key='newPassword'
							disabled={loading}
							rules={{
								required: pleaseEnterPasswordsMsg,
								validate: (value) => {
									if (!ValidatorService.isValidPassword(value)) return t('ResetPassword.passwordTooShort');
									return true;
								}
							}}
							render={({ field }) => (
								<FormItem>
									<FormLabel>{t('ResetPassword.newPassword')}</FormLabel>
									<FormControl>
										<PasswordInput
											placeholder='Enter new password'
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name='confirmPassword'
							key='confirmPassword'
							disabled={loading}
							rules={{
								required: pleaseEnterPasswordsMsg,
								validate: (value) => {
									if (value !== form.getValues('newPassword')) return t('ResetPassword.passwordsDoNotMatch');
									return true;
								}
							}}
							render={({ field }) => (
								<FormItem>
									<FormLabel>{t('ResetPassword.confirmPassword')}</FormLabel>
									<FormControl>
										<PasswordInput
											placeholder='Confirm new password'
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
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
	);
}

export default ResetPassword;
