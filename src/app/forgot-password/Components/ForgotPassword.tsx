// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { ENotificationStatus } from '@/_shared/types';
import { ValidatorService } from '@/_shared/_services/validator_service';
import { Button } from '@/app/_shared-components/Button';
import { Input } from '@ui/Input';
import ErrorMessage from '@ui/ErrorMessage';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@ui/Form';
import { AuthClientService } from '@/app/_client-services/auth_client_service';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { useToast } from '@/hooks/useToast';
import Link from 'next/link';
import { MailCheck } from 'lucide-react';
import classes from './ForgotPassword.module.scss';

interface IFormFields {
	email: string;
}

function ForgotPassword() {
	const [loading, setLoading] = useState<boolean>(false);
	const [errorMessage, setErrorMessage] = useState<string>('');
	const [emailSent, setEmailSent] = useState<boolean>(false);
	const t = useTranslations();
	const form = useForm<IFormFields>();
	const { toast } = useToast();

	const handleSubmit = async (values: IFormFields) => {
		const { email } = values;

		if (!email || !ValidatorService.isValidEmail(email)) {
			toast({
				status: ENotificationStatus.ERROR,
				title: t('ForgotPassword.invalidEmail')
			});
			return;
		}

		try {
			setLoading(true);
			setErrorMessage('');

			const { error } = await AuthClientService.sendResetPasswordEmail({ email });

			if (error) {
				setErrorMessage(error.message || t('ForgotPassword.failedToSendEmail'));
				setLoading(false);
				return;
			}

			setEmailSent(true);
			toast({
				status: ENotificationStatus.SUCCESS,
				title: t('ForgotPassword.checkYourEmail')
			});
		} catch {
			setErrorMessage(t('ForgotPassword.failedToSendEmail'));
		} finally {
			setLoading(false);
		}
	};

	if (emailSent) {
		return (
			<div className='flex flex-col items-center gap-y-6 p-8 text-center'>
				<div className='flex h-16 w-16 items-center justify-center rounded-full bg-bg_pink/10'>
					<MailCheck className='h-8 w-8 text-text_pink' />
				</div>
				<div>
					<h2 className='text-xl font-semibold text-text_primary'>{t('ForgotPassword.checkYourEmail')}</h2>
					<p className='text-text_secondary mt-2 text-sm'>{t('ForgotPassword.emailSentDescription')}</p>
				</div>
				<Link href='/login'>
					<Button
						variant='outline'
						size='lg'
					>
						{t('ForgotPassword.backToLogin')}
					</Button>
				</Link>
			</div>
		);
	}

	return (
		<div className='px-4 py-4 sm:px-12'>
			<div className='mb-6'>
				<h2 className='text-xl font-semibold text-text_primary'>{t('ForgotPassword.title')}</h2>
				<p className='text-text_secondary mt-2 text-sm'>{t('ForgotPassword.description')}</p>
			</div>
			<Form {...form}>
				<form onSubmit={form.handleSubmit(handleSubmit)}>
					<div className={classes.header}>
						<FormField
							control={form.control}
							name='email'
							key='email'
							disabled={loading}
							rules={{
								required: t('ForgotPassword.pleaseEnterEmail'),
								validate: (value) => {
									if (!ValidatorService.isValidEmail(value)) return t('ForgotPassword.invalidEmail');
									return true;
								}
							}}
							render={({ field }) => (
								<FormItem>
									<FormLabel>{t('ForgotPassword.enterEmail')}</FormLabel>
									<FormControl>
										<Input
											placeholder='email@example.com'
											type='email'
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
							{t('ForgotPassword.sendResetLink')}
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
					{t('ForgotPassword.backToLogin')}
				</Link>
			</div>
		</div>
	);
}

export default ForgotPassword;
