// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import Image from 'next/image';
import Link from 'next/link';

type SocialLink = {
	icon: string;
	label: string;
	url: string;
};

// TODO: Add social media links
export const socials = [
	{
		icon: '/icons/socials/twitter.svg',
		label: 'Twitter',
		url: 'https://x.com/blobscriptions'
	},
	{
		icon: '/icons/socials/telegram.svg',
		label: 'Telegram',
		url: 'https://t.co/J8bwoWXd3Z'
	}
];

function Footer() {
	return (
		<footer className='flex w-full items-center justify-between bg-slate-300 p-2 px-5'>
			<ul className='flex w-full items-center justify-center gap-3 md:gap-5'>
				{socials.map((social: SocialLink) => {
					return (
						<li
							key={social.label}
							className='bg-social-icon-bg flex h-8 w-8 items-center justify-center rounded-md'
						>
							<Link
								href={social.url}
								target='_blank'
								rel='noopener noreferrer'
							>
								<Image
									src={social.icon}
									alt={social.label}
									width={18}
									height={18}
								/>
							</Link>
						</li>
					);
				})}
			</ul>
		</footer>
	);
}

export default Footer;
