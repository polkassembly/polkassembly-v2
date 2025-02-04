// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { ESocial, IPublicUser } from '@/_shared/types';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { ValidatorService } from '@/_shared/_services/validator_service';
import { getSharedEnvVars } from '@/_shared/_utils/getSharedEnvVars';
import Image from 'next/image';
import ProfileRect from '@assets/profile/profile-rect.png';
import UserIcon from '@assets/profile/user-icon.svg';
import { UserProfileClientService } from '@/app/_client-services/user_profile_client_service';
import { useUser } from '@/hooks/useUser';
import { z } from 'zod';
import { useTranslations } from 'next-intl';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../../Form';
import { Button } from '../../Button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../Tabs';
import { Input } from '../../Input';
import LoadingLayover from '../../LoadingLayover';
import classes from './EditProfile.module.scss';

enum EditProfileTabs {
	BASIC_INFORMATION = 'BASIC_INFORMATION',
	SOCIALS = 'SOCIALS'
}

const socialLinksSchema = z.object(Object.fromEntries(Object.values(ESocial).map((platform) => [platform, z.string().url().or(z.string().email()).optional()])));

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const zodFormSchema = z
	.object({
		email: z.string().email().optional(),
		username: z
			.string()
			.refine((val) => ValidatorService.isValidUsername(val), {
				message: 'Invalid username'
			})
			.optional(),
		bio: z.string().min(3).optional(),
		badges: z.array(z.string().min(1)).min(1).optional(),
		title: z.string().min(1).optional(),
		image: z.string().url().optional(),
		coverImage: z.string().url().optional(),
		publicSocialLinks: socialLinksSchema.optional()
	})
	.refine(
		(data) =>
			Object.values(data).some((value) => {
				if (Array.isArray(value)) {
					return value.length > 0;
				}
				return value !== undefined && value !== '';
			}),
		{
			message: 'At least one valid field must be provided'
		}
	);

function EditProfile({ onSuccess, userProfileData, onClose }: { userProfileData: IPublicUser; onSuccess?: (data: IPublicUser) => void; onClose?: () => void }) {
	const t = useTranslations();
	const { user } = useUser();
	const formData = useForm<z.infer<typeof zodFormSchema>>();
	const { NEXT_PUBLIC_IMBB_KEY } = getSharedEnvVars();
	const [isLoading, setIsLoading] = useState(false);
	const [coverImageUploading, setCoverImageUploading] = useState(false);
	const [profileImageUploading, setProfileImageUploading] = useState(false);

	const [coverImage, setCoverImage] = useState<string | null>(userProfileData.profileDetails.coverImage || null);
	const [profileImage, setProfileImage] = useState<string | null>(userProfileData.profileDetails.image || null);

	const imgbbUrl = `https://api.imgbb.com/1/upload?key=${NEXT_PUBLIC_IMBB_KEY}`;

	const handleCoverImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			const form = new FormData();
			form.append('image', file, file.name);
			setCoverImageUploading(true);
			const res = await fetch(imgbbUrl, {
				body: form,
				method: 'POST'
			});
			const uploadData = await res.json();
			if (uploadData?.success) {
				formData.setValue('coverImage', uploadData.data.url);
				setCoverImage(uploadData.data.url);
			}
			setCoverImageUploading(false);
		}
	};

	const handleProfileImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			const form = new FormData();
			form.append('image', file, file.name);
			setProfileImageUploading(true);
			const res = await fetch(imgbbUrl, {
				body: form,
				method: 'POST'
			});
			const uploadData = await res.json();
			if (uploadData?.success) {
				formData.setValue('image', uploadData.data.url);
				setProfileImage(uploadData.data.url);
			}
			setProfileImageUploading(false);
		}
	};

	const handleEditProfile = async (data: z.infer<typeof zodFormSchema>) => {
		if (!user?.id || user.id !== userProfileData.id) return;

		setIsLoading(true);

		const publicSocialLinks = Object.entries(data.publicSocialLinks || {}).map(([platform, url]) => ({
			platform: platform as ESocial,
			url: url || ''
		}));

		const { data: editData, error } = await UserProfileClientService.editUserProfile({
			userId: user?.id,
			bio: data.bio,
			username: data.username,
			title: data.title,
			image: data.image,
			coverImage: data.coverImage,
			publicSocialLinks: publicSocialLinks.filter((link) => link.url)
		});

		if (editData && !error) {
			onSuccess?.({
				...userProfileData,
				username: data.username || userProfileData.username,
				profileDetails: {
					...userProfileData.profileDetails,
					title: data.title || userProfileData.profileDetails.title,
					bio: data.bio || userProfileData.profileDetails.bio,
					image: data.image || userProfileData.profileDetails.image,
					coverImage: data.coverImage || userProfileData.profileDetails.coverImage,
					publicSocialLinks:
						Object.entries(data.publicSocialLinks || {}).map(([platform, url]) => ({
							platform: platform as ESocial,
							url: url || ''
						})) || userProfileData.profileDetails.publicSocialLinks
				}
			});
			onClose?.();
		}

		setIsLoading(false);
	};

	return (
		<Tabs>
			<TabsList>
				<TabsTrigger value={EditProfileTabs.BASIC_INFORMATION}>{t('Profile.basicInformation')}</TabsTrigger>
				<TabsTrigger value={EditProfileTabs.SOCIALS}>{t('Profile.socials')}</TabsTrigger>
			</TabsList>
			<Form {...formData}>
				<form onSubmit={formData.handleSubmit(handleEditProfile)}>
					<div className={classes.contentWrapper}>
						<TabsContent
							className={classes.tabContent}
							value={EditProfileTabs.BASIC_INFORMATION}
						>
							<div className='flex flex-col gap-y-2'>
								<p className={classes.label}>{t('Profile.coverImage')}</p>
								<Image
									src={coverImage || ProfileRect}
									alt='cover image'
									width={100}
									height={100}
									className='h-28 w-full rounded-lg'
								/>
								<FormField
									control={formData.control}
									name='coverImage'
									render={({ field }) => (
										<Button
											variant='secondary'
											size='sm'
											className='relative'
											isLoading={coverImageUploading}
										>
											<Input
												type='file'
												accept='image/jpeg, image/png, image/jpg'
												onChange={(e) => {
													field.onChange(e);
													handleCoverImageUpload(e);
												}}
												className='absolute h-full w-full cursor-pointer opacity-0'
											/>
											{t('Profile.uploadCover')}
										</Button>
									)}
								/>
							</div>
							<div className='flex items-center gap-x-6'>
								<FormField
									control={formData.control}
									name='image'
									render={({ field }) => (
										<div className='relative overflow-hidden rounded-full border border-dashed border-border_grey p-1 hover:border-text_pink'>
											<Image
												src={profileImage || UserIcon}
												alt='profile image'
												width={100}
												height={100}
												className='w-28'
											/>
											{profileImageUploading && <LoadingLayover />}
											<Input
												type='file'
												accept='image/jpeg, image/png, image/jpg'
												onChange={(e) => {
													field.onChange(e);
													handleProfileImageUpload(e);
												}}
												className='absolute left-0 top-0 h-full w-full cursor-pointer rounded-full opacity-0'
											/>
										</div>
									)}
								/>
								<div>
									<p className='mb-1 font-medium text-text_primary'>{t('Profile.profileImage')}</p>
									<p className='text-xs text-text_primary'>{t('Profile.uploadProfileImageDescription')}</p>
								</div>
							</div>

							<div>
								<FormField
									control={formData.control}
									name='username'
									key='username'
									rules={{
										validate: (value) => {
											if (value && !ValidatorService.isValidUsername(value)) return t('Profile.invalidUsername');
											return true;
										}
									}}
									render={({ field }) => (
										<FormItem>
											<FormLabel>{t('Profile.displayName')}</FormLabel>
											<FormControl>
												<Input
													placeholder='Type here'
													type='text'
													defaultValue={userProfileData.username}
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
									control={formData.control}
									name='title'
									key='title'
									render={({ field }) => (
										<FormItem>
											<FormLabel>{t('Profile.jobTitle')}</FormLabel>
											<FormControl>
												<Input
													placeholder='eg. Manager'
													type='text'
													defaultValue={userProfileData.profileDetails.title}
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
									control={formData.control}
									name='bio'
									key='bio'
									render={({ field }) => (
										<FormItem>
											<FormLabel>{t('Profile.about')}</FormLabel>
											<FormControl>
												<Input
													placeholder='eg. I am a Web Developer'
													type='text'
													defaultValue={userProfileData.profileDetails.bio}
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>
						</TabsContent>
						<TabsContent
							className={classes.tabContent}
							value={EditProfileTabs.SOCIALS}
						>
							{Object.values(ESocial).map((social) => (
								<div key={social}>
									<FormField
										control={formData.control}
										name={`publicSocialLinks.${social}`}
										key={social}
										render={({ field }) => (
											<FormItem>
												<FormLabel className='capitalize'>{t(`Profile.${social}`)}</FormLabel>
												<FormControl>
													<Input
														placeholder='Type here'
														type='text'
														defaultValue={userProfileData.profileDetails.publicSocialLinks?.find((item) => item.platform === social)?.url}
														{...field}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>
							))}
						</TabsContent>
					</div>
					<div className={classes.footer}>
						<Button
							type='submit'
							isLoading={isLoading}
						>
							{t('Profile.saveChanges')}
						</Button>
					</div>
				</form>
			</Form>
		</Tabs>
	);
}

export default EditProfile;
