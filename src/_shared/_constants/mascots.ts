// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
export interface MascotGif {
	type: 'error' | 'loading' | 'taskdone' | 'welcome';
	url: string;
}

export const mascotGifs: MascotGif[] = [
	{
		type: 'error',
		url: 'https://polkassembly-ai.s3.us-east-1.amazonaws.com/mascot_structured/error/Error_1.gif'
	},
	{
		type: 'error',
		url: 'https://polkassembly-ai.s3.us-east-1.amazonaws.com/mascot_structured/error/Error_2.gif'
	},
	{
		type: 'loading',
		url: 'https://polkassembly-ai.s3.us-east-1.amazonaws.com/mascot_structured/loading/Loading_1.gif'
	},
	{
		type: 'loading',
		url: 'https://polkassembly-ai.s3.us-east-1.amazonaws.com/mascot_structured/loading/Loading_2.gif'
	},
	{
		type: 'taskdone',
		url: 'https://polkassembly-ai.s3.us-east-1.amazonaws.com/mascot_structured/taskdone/task_1.gif'
	},
	{
		type: 'taskdone',
		url: 'https://polkassembly-ai.s3.us-east-1.amazonaws.com/mascot_structured/taskdone/task_2.gif'
	},
	{
		type: 'welcome',
		url: 'https://polkassembly-ai.s3.us-east-1.amazonaws.com/mascot_structured/welcome/Welcome_1.gif'
	},
	{
		type: 'welcome',
		url: 'https://polkassembly-ai.s3.us-east-1.amazonaws.com/mascot_structured/welcome/Welcome_2.gif'
	}
];
