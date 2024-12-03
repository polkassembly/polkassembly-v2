/** @type {import('next').NextConfig} */
const nextConfig = {
	i18n: {
		locales: ['default', 'en', 'de', 'fr'],
		defaultLocale: 'default',
		localeDetection: false,
		domains: [
			{
				domain: 'polkassembly.io',
				defaultLocale: 'en-US'
			}
		]
	},
	trailingSlash: true
};

export default nextConfig;
