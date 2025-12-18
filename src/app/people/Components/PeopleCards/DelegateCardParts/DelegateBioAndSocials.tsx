// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ComponentType, SVGProps, useState } from 'react';
import { ESocial, IDelegateDetails, IPublicUser } from '@/_shared/types';
import { MarkdownViewer } from '@/app/_shared-components/MarkdownViewer/MarkdownViewer';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/app/_shared-components/Dialog/Dialog';
import Address from '@ui/Profile/Address/Address';
import { IoMdMail } from '@react-icons/all-files/io/IoMdMail';
import { FaTwitter } from '@react-icons/all-files/fa/FaTwitter';
import { FaTelegramPlane } from '@react-icons/all-files/fa/FaTelegramPlane';
import { FaDiscord } from '@react-icons/all-files/fa/FaDiscord';
import { FaGithub } from '@react-icons/all-files/fa/FaGithub';
import { useTranslations } from 'next-intl';

const SocialIcons: Partial<Record<ESocial, ComponentType<SVGProps<SVGSVGElement>>>> = {
	[ESocial.EMAIL]: IoMdMail,
	[ESocial.TWITTER]: FaTwitter,
	[ESocial.TELEGRAM]: FaTelegramPlane,
	[ESocial.DISCORD]: FaDiscord,
	[ESocial.GITHUB]: FaGithub
};

interface DelegateBioAndSocialsProps {
	delegate: IDelegateDetails;
	publicUser?: IPublicUser;
}

function DelegateBioAndSocials({ delegate, publicUser }: DelegateBioAndSocialsProps) {
	const [openModal, setOpenModal] = useState(false);
	const t = useTranslations();

	return (
		<>
			<div className='px-1 pb-2 pt-2'>
				{delegate.manifesto ? (
					<MarkdownViewer
						markdown={delegate.manifesto}
						truncate
						variant='inline'
						onShowMore={() => setOpenModal(true)}
						className='line-clamp-2 text-sm text-text_primary'
					/>
				) : (
					<span className='text-text_secondary text-sm'>{t('Delegation.noBio')}</span>
				)}
			</div>

			<div className='flex items-center gap-x-4'>
				{publicUser?.profileDetails?.publicSocialLinks?.map((social) => {
					const IconComponent = SocialIcons[social.platform];
					return IconComponent ? (
						<a
							key={social.platform}
							href={social.platform === ESocial.EMAIL ? `mailto:${social.url}` : social.url}
							target='_blank'
							className='flex h-8 w-8 items-center justify-center rounded-full bg-social_green'
							rel='noreferrer noopener'
						>
							<IconComponent className='text-white' />
						</a>
					) : null;
				})}
			</div>

			<Dialog
				open={openModal}
				onOpenChange={setOpenModal}
			>
				<DialogContent className='max-w-xl p-6'>
					<DialogHeader>
						<DialogTitle>
							<Address address={delegate.address} />
						</DialogTitle>
					</DialogHeader>
					{delegate.manifesto && (
						<MarkdownViewer
							className='max-h-[70vh] overflow-y-auto'
							markdown={delegate.manifesto}
						/>
					)}
				</DialogContent>
			</Dialog>
		</>
	);
}

export default DelegateBioAndSocials;
