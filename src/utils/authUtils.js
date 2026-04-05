export const ALLOWED_DOMAIN = "@vitstudent.ac.in";

export function isAllowedDomainEmail(email, allowedDomain = ALLOWED_DOMAIN) {
	return typeof email === "string" && email.endsWith(allowedDomain);
}

export function getDomainRestrictionMessage(allowedDomain = ALLOWED_DOMAIN) {
	return `Only ${allowedDomain} email addresses are allowed.`;
}

export function getPopupDomainRestrictionMessage(
	email,
	allowedDomain = ALLOWED_DOMAIN,
) {
	return `Access restricted to ${allowedDomain} email addresses only. You signed in with ${email}`;
}

export function shouldSuppressPopupError(errorCode) {
	return (
		errorCode === "auth/popup-closed-by-user" ||
		errorCode === "auth/cancelled-popup-request"
	);
}
