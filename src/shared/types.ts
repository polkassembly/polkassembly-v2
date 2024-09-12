// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { EWallet } from './enum';

export type TAddress = string;

export type ServerComponentProps<T, U> = {
	params?: T;
	searchParams?: U;
};

export interface IDBPost {
	id: string;
	title: string;
	content: string;
	hash: string;
	proposer: TAddress;
	post_id: string;
}

export interface IUser {
	id: string;
	username: string;
	name: string;
	email: string;
	addresses: [TAddress];
	wallet: EWallet;
}

export interface IPost {
	id: string;
	title: string;
	content: string;
	hash: string;
	proposer: TAddress;
	postId: string;
}
