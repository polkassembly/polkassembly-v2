// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@ui/Form';
import { Input } from '@ui/Input';
import { Button } from '@/app/_shared-components/Button';
import ErrorMessage from '@ui/ErrorMessage';
import { AuthClientService } from '@/app/_client-services/auth_client_service';
import { ENotificationStatus } from '@/_shared/types';
import { useTranslations } from 'next-intl';
import { useToast } from '@/hooks/useToast';
import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';
import classes from './ForgotPassword.module.scss';

interface IFormFields {
	email: string;
}

function ForgotPassword() {
	const [loading, setLoading] = useState(false);
	const [errorMessage, setErrorMessage] = useState('');
	const [emailSent, setEmailSent] = useState(false);

	const t = useTranslations();
	const { toast } = useToast();
	const form = useForm<IFormFields>();

	const handleSubmit = async (values: IFormFields) => {
		const { email } = values;

		if (!email) {
			toast({
				status: ENotificationStatus.ERROR,
				title: t('ForgotPassword.pleaseEnterEmail')
			});
			return;
		}

		try {
			setLoading(true);
			setErrorMessage('');

			const { error } = await AuthClientService.sendResetPasswordEmail({ email });

			if (error) {
				setErrorMessage(error.message || '');
				setLoading(false);
				return;
			}

			setEmailSent(true);
			setLoading(false);
		} catch {
			toast({
				status: ENotificationStatus.ERROR,
				title: t('ForgotPassword.failedToSendEmail')
			});
			setLoading(false);
		}
	};

	if (emailSent) {
		return (
			<div className={classes.rootClass}>
				<div className={classes.card}>
					<div className={classes.cardHeader}>
						<p className='flex items-center gap-x-2 text-lg font-semibold text-text_primary sm:text-xl'>{t('ForgotPassword.checkYourEmail')}</p>
					</div>
					<div className={classes.cardBody}>
						<div className='flex flex-col items-center gap-y-4 py-4 text-center'>
							<CheckCircle2 className='h-12 w-12 text-green-500' />
							<p className='text-sm text-text_primary'>{t('ForgotPassword.emailSentDescription')}</p>
							<Link
								href='/login'
								className='text-sm text-text_pink hover:underline'
							>
								{t('ForgotPassword.backToLogin')}
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
					<p className='flex items-center gap-x-2 text-lg font-semibold text-text_primary sm:text-xl'>{t('ForgotPassword.title')}</p>
				</div>
				<div className={classes.cardBody}>
					<p className='text-text_secondary mb-4 text-sm'>{t('ForgotPassword.description')}</p>
					<Form {...form}>
						<form onSubmit={form.handleSubmit(handleSubmit)}>
							<div className={classes.formFields}>
								<div>
									<FormField
										control={form.control}
										name='email'
										key='email'
										disabled={loading}
										rules={{
											required: true,
											pattern: {
												value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
												message: t('ForgotPassword.invalidEmail')
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
			</div>
		</div>
	);
}

export default ForgotPassword;
