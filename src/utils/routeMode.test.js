import { getAppViewMode } from "./routeMode";

describe("getAppViewMode", () => {
	test("returns loading while auth is loading", () => {
		expect(
			getAppViewMode({
				authUser: null,
				user: null,
				isAuthLoading: true,
				isUserLoading: false,
			}),
		).toBe("loading");
	});

	test("returns loading when authenticated user profile is still loading", () => {
		expect(
			getAppViewMode({
				authUser: { uid: "u1" },
				user: null,
				isAuthLoading: false,
				isUserLoading: true,
			}),
		).toBe("loading");
	});

	test("returns guest when no auth user", () => {
		expect(
			getAppViewMode({
				authUser: null,
				user: null,
				isAuthLoading: false,
				isUserLoading: false,
			}),
		).toBe("guest");
	});

	test("returns setup when authenticated but no profile", () => {
		expect(
			getAppViewMode({
				authUser: { uid: "u1" },
				user: null,
				isAuthLoading: false,
				isUserLoading: false,
			}),
		).toBe("setup");
	});

	test("returns app when authenticated user profile exists", () => {
		expect(
			getAppViewMode({
				authUser: { uid: "u1" },
				user: { name: "Test" },
				isAuthLoading: false,
				isUserLoading: false,
			}),
		).toBe("app");
	});
});
