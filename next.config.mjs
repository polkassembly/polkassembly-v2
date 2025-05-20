// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/intl/intlRequest.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
	async headers() {
		return [
			{
				// matching all API routes
				source: '/api/:path*',
				headers: [
					{ key: 'Access-Control-Allow-Credentials', value: 'true' },
					{ key: 'Access-Control-Allow-Origin', value: '*' },
					{ key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT' },
					{
						key: 'Access-Control-Allow-Headers',
						value: '*'
					},
					{ key: 'X-Frame-Options', value: 'SAMEORIGIN' },
					{ key: 'X-XSS-Protection', value: '1; mode=block' },
					{ key: 'X-Content-Type-Options', value: 'nosniff' },
					{ key: 'Content-Security-Policy', value: "default-src 'self'; img-src '*' data:; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';" },
					{ key: 'Cache-Control', value: 's-maxage=60, stale-while-revalidate=59' }
				]
			}
		];
	},
	async redirects() {
		return [
			{
				source: '/opengov',
				destination: '/',
				permanent: true
			}
		];
	},
	async rewrites() {
		return [
			{
				source: '/api/v1/:path*',
				destination: 'https://polkadot-old.polkassembly.io/api/v1/:path*'
			},
			// Archive proposal types reroutes
			{
				source: '/proposal/:id',
				destination: 'https://polkadot-old.polkassembly.io/proposal/:id'
			},
			{
				source: '/referendum/:id',
				destination: 'https://polkadot-old.polkassembly.io/referendum/:id'
			},
			{
				source: '/treasury/:id',
				destination: 'https://polkadot-old.polkassembly.io/treasury/:id'
			},
			{
				source: '/tip/:id',
				destination: 'https://polkadot-old.polkassembly.io/tip/:id'
			},
			{
				source: '/motion/:id',
				destination: 'https://polkadot-old.polkassembly.io/motion/:id'
			},
			{
				source: '/tech/:id',
				destination: 'https://polkadot-old.polkassembly.io/tech/:id'
			}
		];
	},
	images: {
		remotePatterns: [
			{
				protocol: 'https',
				hostname: '**',
				pathname: '/**'
			}
		]
	}
};

// eslint-disable-next-line import/no-default-export
export default withNextIntl(nextConfig);
