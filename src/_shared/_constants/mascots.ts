// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import ErrorMascot from '@assets/klara/error.svg';
import LoadingMascot from '@assets/klara/klara-thinking.svg';
import WelcomeMascot from '@assets/klara/klara-welcome.svg';

export interface MascotGif {
	type: 'error' | 'loading' | 'welcome';
	url: string;
}

export const mascotGifs: MascotGif[] = [
	{
		type: 'error',
		url: ErrorMascot
	},
	{
		type: 'loading',
		url: LoadingMascot
	},
	{
		type: 'welcome',
		url: WelcomeMascot
	}
];
