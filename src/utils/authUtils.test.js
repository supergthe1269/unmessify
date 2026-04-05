import {
	ALLOWED_DOMAIN,
	isAllowedDomainEmail,
	getDomainRestrictionMessage,
	getPopupDomainRestrictionMessage,
	shouldSuppressPopupError,
} from "./authUtils";

describe("authUtils", () => {
	test("isAllowedDomainEmail validates allowed domain correctly", () => {
		expect(isAllowedDomainEmail(`user${ALLOWED_DOMAIN}`)).toBe(true);
		expect(isAllowedDomainEmail("user@example.com")).toBe(false);
		expect(isAllowedDomainEmail(undefined)).toBe(false);
		expect(isAllowedDomainEmail(null)).toBe(false);
	});

	test("getDomainRestrictionMessage returns expected text", () => {
		expect(getDomainRestrictionMessage()).toBe(
			"Only @vitstudent.ac.in email addresses are allowed.",
		);
	});

	test("getPopupDomainRestrictionMessage includes the signed-in email", () => {
		expect(getPopupDomainRestrictionMessage("user@example.com")).toBe(
			"Access restricted to @vitstudent.ac.in email addresses only. You signed in with user@example.com",
		);
	});

	test("shouldSuppressPopupError handles popup cancellation codes", () => {
		expect(shouldSuppressPopupError("auth/popup-closed-by-user")).toBe(true);
		expect(shouldSuppressPopupError("auth/cancelled-popup-request")).toBe(true);
		expect(shouldSuppressPopupError("auth/network-request-failed")).toBe(false);
	});
});
