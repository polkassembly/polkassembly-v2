// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import React from 'react';
import style from './Navbar.module.scss';

function Navbar() {
	return (
		<header className={style.navbar}>
			<div>
				<p className={style.navbar_title}>OpenGov</p>
			</div>
		</header>
	);
}

export default Navbar;
