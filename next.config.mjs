// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { withSentryConfig } from '@sentry/nextjs';

import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/intl/intlRequest.ts');

// Change src/_shared/_constants/allowedOutboundIFrameDomains.ts if you change this
export const ALLOWED_OUTBOUND_IFRAME_DOMAINS = ['https://app.mimir.global', 'https://www.youtube.com'];

const NETWORKS = ['polkadot', 'kusama'];
const DOMAINS = ['polkassembly.io', 'polkassembly.network'];

/** @type {import('next').NextConfig} */
const nextConfig = {
	// Enable standalone output for Docker deployments
	output: 'standalone',
	async headers() {
		return [
			{
				// Comprehensive security headers for all pages
				source: '/(.*)',
				headers: [
					{ key: 'X-Frame-Options', value: 'SAMEORIGIN' },
					{ key: 'X-XSS-Protection', value: '1; mode=block' },
					{ key: 'X-Content-Type-Options', value: 'nosniff' },
					{ key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
					{ key: 'Permissions-Policy', value: 'camera=self, microphone=(), geolocation=self' },
					{
						key: 'Content-Security-Policy',
						value: [
							"default-src 'self'",
							"script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://js.sentry-cdn.com",
							"style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
							"font-src 'self' https://fonts.gstatic.com",
							"img-src 'self' data: blob: https:",
							"media-src 'self' data: blob:",
							"object-src 'none'",
							"base-uri 'self'",
							"form-action 'self'",
							"connect-src 'self' https://api.github.com https://*.polkassembly.io https://*.polkassembly.network https://*.firebaseapp.com https://*.googleapis.com https://sentry.io https://o4504609384013824.ingest.sentry.io wss: https://www.google-analytics.com https://*.algolia.net https://*.algolianet.com https://*.algolia.io https://api.imgbb.com https://www.googletagmanager.com",
							`frame-src 'self' ${ALLOWED_OUTBOUND_IFRAME_DOMAINS.join(' ')}`,
							`frame-ancestors 'self' ${ALLOWED_OUTBOUND_IFRAME_DOMAINS.join(' ')}`,
							'upgrade-insecure-requests'
						].join('; ')
					}
				]
			},
			{
				// Additional headers for API routes
				source: '/api/:path*',
				headers: [
					{ key: 'Access-Control-Allow-Credentials', value: 'true' },
					{ key: 'Access-Control-Allow-Origin', value: '*' },
					{ key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT' },
					{
						key: 'Access-Control-Allow-Headers',
						value: '*'
					},
					{ key: 'Cache-Control', value: 's-maxage=60, stale-while-revalidate=59' }
				]
			}
		];
	},
	async redirects() {
		const ARCHIVE_ROUTES = ['proposal', 'referendum', 'treasury', 'tip', 'motion', 'tech'];

		const dynamicNetworkRedirects = NETWORKS.flatMap((network) =>
			DOMAINS.flatMap((domain) =>
				ARCHIVE_ROUTES.map((route) => ({
					source: `/${route}/:id`,
					has: [
						{
							type: 'host',
							value: `${network}.${domain}`
						}
					],
					destination: `https://${network}-old.polkassembly.io/${route}/:id`,
					permanent: true
				}))
			)
		);

		return [
			{
				source: '/opengov',
				destination: '/',
				permanent: true
			},
			// Archive proposal types redirects (host-conditional per network)
			...dynamicNetworkRedirects
		];
	},
	async rewrites() {
		const dynamicNetworkRewrites = NETWORKS.flatMap((network) =>
			DOMAINS.map((domain) => ({
				source: '/api/v1/:path*',
				has: [
					{
						type: 'host',
						value: `${network}.${domain}`
					}
				],
				destination: `https://${network}-old.polkassembly.io/api/v1/:path*`
			}))
		);

		return [...dynamicNetworkRewrites];
	},
	images: {
		remotePatterns: [
			{
				protocol: 'https',
				hostname: '**',
				pathname: '/**'
			}
		]
	},
	// Experimental features for better performance
	experimental: {
		// Optimize for both Vercel and Cloud Run
		optimizePackageImports: ['@polkadot/api', '@polkadot/util', 'firebase-admin']
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
