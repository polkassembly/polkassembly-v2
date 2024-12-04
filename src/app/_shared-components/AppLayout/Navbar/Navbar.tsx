// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React from 'react';

function Navbar() {
	return (
		<header className='flex h-16 shrink-0 items-center gap-2 px-4 transition-[width,height] ease-linear'>
			<div>
				<p className='ml-5 text-lg font-medium text-[#243A57]'>OpenGov</p>
			</div>
		</header>
	);
}

export default Navbar;
