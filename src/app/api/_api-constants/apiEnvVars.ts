// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

export const JWT_PRIVATE_KEY = (process.env.JWT_PRIVATE_KEY || '').replace(/\\n/gm, '\n');
export const JWT_PUBLIC_KEY = (process.env.JWT_PUBLIC_KEY || '').replace(/\\n/gm, '\n');

export const REFRESH_TOKEN_PRIVATE_KEY = (process.env.REFRESH_TOKEN_PRIVATE_KEY || '').replace(/\\n/gm, '\n');
export const REFRESH_TOKEN_PUBLIC_KEY = (process.env.REFRESH_TOKEN_PUBLIC_KEY || '').replace(/\\n/gm, '\n');

export const { REDIS_URL = '', FIREBASE_SERVICE_ACC_CONFIG = '', JWT_KEY_PASSPHRASE = '', REFRESH_TOKEN_PASSPHRASE = '' } = process.env;
