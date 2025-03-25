// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/intl/intlRequest.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
	images: {
		remotePatterns: [
			{
				protocol: 'https',
				hostname: 'i.ibb.co',
				pathname: '/**'
			}
		]
	},
	compiler: {
		removeConsole: process.env.NEXT_PUBLIC_APP_ENV === 'production' ? { exclude: ['error'] } : false
	}
};

// eslint-disable-next-line import/no-default-export
export default withNextIntl(nextConfig);
