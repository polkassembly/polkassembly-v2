// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/intl/intlRequest.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
	rewrites: async () => ({
		beforeFiles: [
			{
				source: '/_next/static/chunks/app/@:routeGroup/:path*',
				destination: '/_next/static/chunks/app/%40:routeGroup/:path*'
			}
			// more parrallel rewrites
		],
		afterFiles: [],
		fallback: []
	}),
	async headers() {
		return [
			{
				// matching all API routes
				source: '/api/:path*',
				headers: [
					{ key: 'Access-Control-Allow-Credentials', value: 'true' },
					// Remove the wildcard origin - we'll handle this dynamically in middleware
					// { key: 'Access-Control-Allow-Origin', value: '*' },
					{ key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT' },
					{
						key: 'Access-Control-Allow-Headers',
						value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization, x-network, x-api-key'
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
