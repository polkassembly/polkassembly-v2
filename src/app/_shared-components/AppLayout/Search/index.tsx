// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { IoIosSearch } from 'react-icons/io';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@ui/Dialog/Dialog';
import { Input } from '@ui/Input';
import Image from 'next/image';
import searchGif from '@assets/search/search.gif';
import PaLogo from '../PaLogo';

function Search() {
	return (
		<Dialog>
			<DialogTrigger asChild>
				<IoIosSearch className='cursor-pointer text-2xl text-text_primary' />
			</DialogTrigger>
			<DialogContent className='w-full max-w-4xl rounded-lg px-6 pt-4'>
				<DialogHeader>
					<DialogTitle className='text-xl font-bold text-btn_secondary_text'>Search</DialogTitle>
				</DialogHeader>
				<div>
					<div className='relative'>
						<Input
							className='border-bg_pink pr-10 placeholder:text-text_primary'
							placeholder='Type here to search for something'
						/>
						<div className='absolute right-0 top-1/2 h-10 -translate-y-1/2 rounded-r-md bg-bg_pink p-2'>
							<IoIosSearch className='text-xl text-white' />
						</div>
					</div>

					<div className='mt-8 flex h-[360px] flex-col items-center justify-center text-sm font-medium text-btn_secondary_text'>
						<Image
							src={searchGif}
							alt='search-icon'
							width={274}
							height={274}
							className='-my-[40px]'
							priority
						/>
						<span className='mt-8 text-center tracking-[0.01em]'>Welcome to the all new & supercharged search!</span>
						<div className='mt-2 flex items-center gap-1 text-xs font-medium tracking-[0.01em]'>
							powered by
							<PaLogo className='h-[30px] w-[99px]' />
						</div>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}

export default Search;
