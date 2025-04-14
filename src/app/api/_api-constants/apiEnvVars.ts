// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

export const ACCESS_TOKEN_PRIVATE_KEY = (process.env.ACCESS_TOKEN_PRIVATE_KEY || '').replace(/\\n/gm, '\n');
export const ACCESS_TOKEN_PUBLIC_KEY = (process.env.ACCESS_TOKEN_PUBLIC_KEY || '').replace(/\\n/gm, '\n');

export const REFRESH_TOKEN_PRIVATE_KEY = (process.env.REFRESH_TOKEN_PRIVATE_KEY || '').replace(/\\n/gm, '\n');
export const REFRESH_TOKEN_PUBLIC_KEY = (process.env.REFRESH_TOKEN_PUBLIC_KEY || '').replace(/\\n/gm, '\n');

export const {
	REDIS_URL = '',
	FIREBASE_SERVICE_ACC_CONFIG = '',
	ACCESS_TOKEN_PASSPHRASE = '',
	REFRESH_TOKEN_PASSPHRASE = '',
	NOTIFICATION_ENGINE_API_KEY = '',
	SUBSCAN_API_KEY = '',
	TOOLS_PASSPHRASE = '',
	AI_SERVICE_URL = '',
	REQUEST_JUDGEMENT_CF_URL = '',
	IDENTITY_JUDGEMENT_AUTH = '',
	VERIFICATION_CALLBACK_URL = '',
	TWITTER_CONSUMER_API_KEY = '',
	TWITTER_CONSUMER_API_SECRET_KEY = ''
} = process.env;

export const IS_CACHE_ENABLED = process.env.IS_CACHE_ENABLED === 'true';
export const IS_AI_ENABLED = process.env.IS_AI_ENABLED === 'true';
export const IS_NOTIFICATION_SERVICE_ENABLED = process.env.IS_NOTIFICATION_SERVICE_ENABLED === 'true';
