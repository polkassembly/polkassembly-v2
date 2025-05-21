// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { withSentryConfig } from '@sentry/nextjs';

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
			},
			// Archive proposal types redirects
			{
				source: '/proposal/:id',
				destination: 'https://polkadot-old.polkassembly.io/proposal/:id',
				permanent: true
			},
			{
				source: '/referendum/:id',
				destination: 'https://polkadot-old.polkassembly.io/referendum/:id',
				permanent: true
			},
			{
				source: '/treasury/:id',
				destination: 'https://polkadot-old.polkassembly.io/treasury/:id',
				permanent: true
			},
			{
				source: '/tip/:id',
				destination: 'https://polkadot-old.polkassembly.io/tip/:id',
				permanent: true
			},
			{
				source: '/motion/:id',
				destination: 'https://polkadot-old.polkassembly.io/motion/:id',
				permanent: true
			},
			{
				source: '/tech/:id',
				destination: 'https://polkadot-old.polkassembly.io/tech/:id',
				permanent: true
			}
		];
	},
	async rewrites() {
		return [
			{
				source: '/api/v1/:path*',
				destination: 'https://polkadot-old.polkassembly.io/api/v1/:path*'
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
export default withSentryConfig(withNextIntl(nextConfig), {
	// For all available options, see:
	// https://www.npmjs.com/package/@sentry/webpack-plugin#options

	org: 'polkassembly-oo',
	project: 'polkassembly-v2',

	// Only print logs for uploading source maps in CI
	silent: !process.env.CI,

	// For all available options, see:
	// https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

	// Upload a larger set of source maps for prettier stack traces (increases build time)
	widenClientFileUpload: true,

	// Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
	// This can increase your server load as well as your hosting bill.
	// Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
	// side errors will fail.
	tunnelRoute: '/monitoring',

	// Automatically tree-shake Sentry logger statements to reduce bundle size
	disableLogger: true,

	// Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
	// See the following for more information:
	// https://docs.sentry.io/product/crons/
	// https://vercel.com/docs/cron-jobs
	automaticVercelMonitors: true
});
