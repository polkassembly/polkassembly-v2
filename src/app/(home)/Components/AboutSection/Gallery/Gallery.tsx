// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { MdPlayCircleFilled } from '@react-icons/all-files/md/MdPlayCircleFilled';
import { IoIosDesktop } from '@react-icons/all-files/io/IoIosDesktop';
import { FaRegFileAlt } from '@react-icons/all-files/fa/FaRegFileAlt';
import Image from 'next/image';
import GavinKeynote from '@assets/gallery/gavin-keynote.png';
import Gov2InfoBg2 from '@assets/gallery/gov2-info-bg-2.png';
import Gov2InfoBg3 from '@assets/gallery/gov2-info-bg-3.png';

const GalleryData = [
	{
		id: 1,
		bgImage: GavinKeynote,
		className: 'mr-12 lg:mr-9',
		icon: <MdPlayCircleFilled className='text-xl text-white' />,
		link: 'https://www.youtube.com/watch?v=FhC10CCw9Qg',
		subText: '1:40 hours',
		text: "Gavin's keynote @Decoded 2023"
	},
	{
		id: 2,
		bgImage: Gov2InfoBg2,
		className: 'mr-12 lg:mr-9',
		icon: <IoIosDesktop className='text-xl text-white' />,
		link: 'https://medium.com/polkadot-network/gov2-polkadots-next-generation-of-decentralised-governance-4d9ef657d11b',
		subText: '17 min read',
		text: "Gavin's blog on Medium"
	},
	{
		id: 3,
		bgImage: Gov2InfoBg3,
		className: 'mr-12 lg:mr-0',
		icon: <FaRegFileAlt className='text-xl text-white' />,
		link: 'https://docs.polkassembly.io',
		subText: 'Wiki',
		text: 'Polkassembly user guide'
	}
];

function Gallery() {
	return (
		<div className='flex flex-wrap gap-4 p-4 lg:gap-8'>
			{GalleryData.map((item) => (
				<a
					href={item.link}
					target='_blank'
					key={item.id}
					rel='noreferrer'
					className={`${item.className} group flex min-w-[260px] max-w-[260px]`}
				>
					<div className='relative mr-3 h-[75px] min-w-[132px]'>
						<Image
							src={item.bgImage}
							alt={item.text}
							fill
							className='object-cover'
						/>
						<div className='absolute inset-0 flex items-center justify-center'>
							<span className='group-hover:text-pink_secondary'>{item.icon}</span>
						</div>
					</div>

					<div className='flex flex-col justify-between text-btn_secondary_text hover:text-text_pink'>
						<div className='text-sm font-semibold leading-[150%]'>{item.text}</div>
						<div className='text-xs font-medium'>{item.subText}</div>
					</div>
				</a>
			))}
		</div>
	);
}

export default Gallery;
