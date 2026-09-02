import { env } from '$env/dynamic/public';
const configuredName = env.PUBLIC_STATUS_NAME?.trim();
const configuredLogo = env.PUBLIC_STATUS_LOGO_URL?.trim();

export const statusSite = {
	name: configuredName || 'ProductClient',
	logo: configuredLogo || '/brand-mark.svg'
};
