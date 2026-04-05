export function getAppViewMode({
	authUser,
	user,
	isAuthLoading,
	isUserLoading,
}) {
	if (isAuthLoading || (authUser && isUserLoading)) {
		return "loading";
	}

	if (!authUser) {
		return "guest";
	}

	if (!user) {
		return "setup";
	}

	return "app";
}
