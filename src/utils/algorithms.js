// Core algorithms for UNMESSIFY

// Calculate daily budget based on monthly limit
export function calculateDailyBudget(monthlyLimit) {
	const daysInMonth = 30; // Standard month
	return Math.floor(monthlyLimit / daysInMonth);
}

// Calculate safe limit (70% of budget)
export function calculateSafeLimit(monthlyLimit) {
	return Math.floor(monthlyLimit * 0.7);
}

// Calculate monthly burn rate (credits spent per day on average)
export function calculateBurnRate(totalSpent, daysElapsed) {
	if (daysElapsed === 0) return 0;
	return totalSpent / daysElapsed;
}

// Check if user is on track with monthly budget
export function checkMonthlyProgress(totalSpent, daysElapsed, monthlyLimit) {
	if (daysElapsed === 0) return { status: "on_track", percentage: 0 };

	const dailyBudget = calculateDailyBudget(monthlyLimit);
	const expectedSpend = dailyBudget * daysElapsed;
	const percentage = (totalSpent / expectedSpend) * 100;

	if (percentage <= 90) return { status: "on_track", percentage };
	if (percentage <= 110) return { status: "on_pace", percentage };
	return { status: "over_track", percentage };
}

// Get remaining budget for the month
export function getRemainingBudget(totalSpent, monthlyLimit) {
	return Math.max(0, monthlyLimit - totalSpent);
}

// Calculate dynamic daily safe limit (dynamic budget updation based on remaining days)
export function getDynamicDailyBudget(totalSpent, monthlyLimit) {
	const now = new Date();
	const daysInMonth = new Date(
		now.getFullYear(),
		now.getMonth() + 1,
		0,
	).getDate();
	const daysRemaining = daysInMonth - now.getDate() + 1; // including today
	const remainingBudget = Math.max(0, monthlyLimit - totalSpent);
	return Math.floor(remainingBudget / daysRemaining);
}

// Forecast burn rate mapping (linear projection based on last 3 days average)
export function calculateBurnRateForecast(
	transactions,
	totalSpent,
	monthlyLimit,
) {
	const now = new Date();
	const daysInMonth = new Date(
		now.getFullYear(),
		now.getMonth() + 1,
		0,
	).getDate();
	const remainingBudget = Math.max(0, monthlyLimit - totalSpent);

	// Calculate average spending over the last 3 days
	let recentSpend = 0;
	for (let i = 0; i < 3; i++) {
		const targetDate = new Date();
		targetDate.setDate(now.getDate() - i);
		const dateStr = targetDate.toISOString().split("T")[0];
		recentSpend += transactions
			.filter((t) => t.date && t.date.startsWith(dateStr))
			.reduce((sum, t) => sum + (t.totalCredits || 0), 0);
	}
	const avgRecentSpend = recentSpend / 3;

	const projection = [];
	let projectedBalance = monthlyLimit - totalSpent;
	const currentDate = now.getDate();

	// Create projection for the remaining days of the month
	for (let i = currentDate; i <= daysInMonth; i++) {
		const labelDate = new Date(now.getFullYear(), now.getMonth(), i);
		const dayLabel = labelDate.toLocaleDateString("en-US", {
			month: "short",
			day: "numeric",
		});

		projection.push({
			day: dayLabel,
			balance: Math.max(0, Math.floor(projectedBalance)),
		});

		projectedBalance -= avgRecentSpend;
	}

	return {
		projection,
		zeroBalanceDate:
			projectedBalance <= 0
				? new Date(
						now.getFullYear(),
						now.getMonth(),
						currentDate + Math.floor(remainingBudget / (avgRecentSpend || 1)),
					)
				: null,
		avgRecentSpend,
	};
}

// Estimate remaining days budget can last
export function estimateBudgetDays(remainingBudget, avgDailySpend) {
	if (avgDailySpend === 0) return Infinity;
	return Math.floor(remainingBudget / avgDailySpend);
}

// Calculate dates elapsed in current month
export function getDaysElapsedInMonth() {
	const now = new Date();
	return now.getDate();
}

// Get days remaining in month
export function getDaysRemainingInMonth() {
	const now = new Date();
	const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
	return lastDay.getDate() - now.getDate();
}

// Recommend meals based on budget using greedy algorithm
export function recommendMeals(budget, preferences = {}, menuItems = []) {
	const { mealType = null, preference = "both", excludeIds = [] } = preferences;

	// Filter items based on preferences
	let availableItems = menuItems.filter((item) => {
		if (excludeIds.includes(item.id)) return false;
		if (preference && preference !== "both") {
			const isVeg = item.isVeg;
			if (preference === "veg" && !isVeg) return false;
			if (preference === "non-veg" && isVeg) return false;
		}
		if (mealType && !item.mealType.includes(mealType)) return false;
		return true;
	});

	// Sort by credits (ascending) - greedy approach: pick cheapest first for variety
	availableItems.sort((a, b) => a.credits - b.credits);

	// Find best combination
	const recommendations = [];
	let totalSpent = 0;

	for (const item of availableItems) {
		if (totalSpent + item.credits <= budget) {
			recommendations.push(item);
			totalSpent += item.credits;
		}

		// Get diverse recommendations (max 5 items)
		if (recommendations.length >= 5) break;
	}

	return {
		items: recommendations,
		totalCredits: totalSpent,
		remainingBudget: budget - totalSpent,
	};
}

// Check if month is about to end
export function isMonthEnding() {
	return getDaysRemainingInMonth() <= 3;
}

// Get month status summary
export function getMonthSummary(user, transactions) {
	const totalSpent = transactions.reduce((sum, t) => sum + t.totalCredits, 0);
	const daysElapsed = getDaysElapsedInMonth();
	const daysRemaining = getDaysRemainingInMonth();
	const monthlyLimit = user.monthlyLimit;
	const remainingBudget = getRemainingBudget(totalSpent, monthlyLimit);
	const avgDailySpend = daysElapsed > 0 ? totalSpent / daysElapsed : 0;
	const estimatedDaysRemaining = estimateBudgetDays(
		remainingBudget,
		avgDailySpend,
	);

	const progress = checkMonthlyProgress(totalSpent, daysElapsed, monthlyLimit);

	return {
		totalSpent,
		remainingBudget,
		daysElapsed,
		daysRemaining,
		avgDailySpend: Math.round(avgDailySpend * 100) / 100,
		estimatedDaysRemaining,
		progress,
		isEnding: isMonthEnding(),
	};
}

export function generateMealCombos(budget, preferences = {}, menuItems = []) {
	const mealTypes = preferences.mealTypes || ["breakfast", "lunch", "dinner"];
	const preference = preferences.preference || "both";

	if (!mealTypes || mealTypes.length === 0) return { combos: [] };

	// Filter by preference
	const filteredItems = menuItems.filter((item) => {
		if (preference === "veg" && !item.isVeg) return false;
		if (preference === "non-veg" && item.isVeg) return false;
		return true;
	});

	// Group by requested types and ensure combos have multiple items
	const validGroups = mealTypes
		.map((type) => {
			const items = filteredItems.filter((item) =>
				item.mealType.includes(type),
			);

			const sideKeywords = [
				"roti",
				"chapati",
				"chapathi",
				"chappathi",
				"rice",
				"pulao",
				"biryani",
				"naan",
				"puri",
				"poori",
				"paratha",
				"bhatura",
				"salad",
				"papad",
				"pickle",
				"curd",
				"raita",
				"dal",
			];
			const isSide = (name) =>
				sideKeywords.some((kw) => name.toLowerCase().includes(kw));

			const mains = items.filter(
				(i) => i.category === "main" && !isSide(i.name),
			);
			const sides = items.filter(
				(i) =>
					i.category === "side" ||
					i.category === "bread" ||
					(i.category === "main" && isSide(i.name)),
			);
			const combosForType = [];

			if (
				(type === "lunch" || type === "dinner") &&
				mains.length > 0 &&
				sides.length > 0
			) {
				mains.forEach((main) => {
					sides.forEach((side) => {
						combosForType.push([main, side]);
					});
				});
			} else {
				items.forEach((item) => combosForType.push([item]));
			}
			return combosForType;
		})
		.filter((group) => group.length > 0);

	if (validGroups.length === 0) return { combos: [] };

	// Create all combinations
	const calcCartesian = (arrays) => {
		return arrays.reduce(
			(acc, curr) => {
				const res = [];
				acc.forEach((a) => curr.forEach((c) => res.push([...a, ...c])));
				return res;
			},
			[[]],
		);
	};

	const allCombos = calcCartesian(validGroups);

	// Calculate totals, average popularity and filter by budget
	const validCombos = allCombos
		.map((combo) => {
			const totalCredits = combo.reduce((sum, item) => sum + item.credits, 0);
			const totalPopularity = combo.reduce(
				(sum, item) => sum + (item.popularity || 0),
				0,
			);
			return {
				items: combo,
				totalCredits,
				averagePopularity: totalPopularity / combo.length,
			};
		})
		.filter((combo) => combo.totalCredits <= budget)
		.sort((a, b) => {
			// Primary sort: Closest to budget limit
			const diff = b.totalCredits - a.totalCredits;
			if (diff === 0) {
				// Secondary sort: Highest average popularity/rating
				return b.averagePopularity - a.averagePopularity;
			}
			return diff;
		});

	return { combos: validCombos.slice(0, 5) }; // return top 5 combos
}
