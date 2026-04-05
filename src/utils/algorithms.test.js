import {
	calculateDailyBudget,
	calculateSafeLimit,
	calculateBurnRate,
	checkMonthlyProgress,
	getRemainingBudget,
	getDynamicDailyBudget,
	calculateBurnRateForecast,
	estimateBudgetDays,
	getMonthSummary,
	recommendMeals,
	generateMealCombos,
} from "./algorithms";

describe("algorithms", () => {
	afterEach(() => {
		jest.useRealTimers();
	});

	test("calculateDailyBudget and calculateSafeLimit return expected values", () => {
		expect(calculateDailyBudget(5000)).toBe(166);
		expect(calculateSafeLimit(5000)).toBe(3500);
	});

	test("calculateBurnRate handles zero days and normal division", () => {
		expect(calculateBurnRate(100, 0)).toBe(0);
		expect(calculateBurnRate(120, 6)).toBe(20);
	});

	test("checkMonthlyProgress returns expected status buckets", () => {
		const onTrack = checkMonthlyProgress(100, 1, 5000);
		const onPace = checkMonthlyProgress(166, 1, 5000);
		const overTrack = checkMonthlyProgress(250, 1, 5000);

		expect(onTrack.status).toBe("on_track");
		expect(onPace.status).toBe("on_pace");
		expect(overTrack.status).toBe("over_track");
	});

	test("getRemainingBudget never goes below zero", () => {
		expect(getRemainingBudget(1200, 5000)).toBe(3800);
		expect(getRemainingBudget(7000, 5000)).toBe(0);
	});

	test("estimateBudgetDays handles zero spend and regular spend", () => {
		expect(estimateBudgetDays(1000, 0)).toBe(Infinity);
		expect(estimateBudgetDays(1000, 80)).toBe(12);
	});

	test("getDynamicDailyBudget computes budget based on remaining days", () => {
		jest.useFakeTimers().setSystemTime(new Date("2026-04-05T12:00:00.000Z"));
		expect(getDynamicDailyBudget(2000, 5000)).toBe(115);
	});

	test("calculateBurnRateForecast creates projection and averages recent spend", () => {
		jest.useFakeTimers().setSystemTime(new Date("2026-04-05T12:00:00.000Z"));
		const tx = [
			{ date: "2026-04-05T08:00:00.000Z", totalCredits: 60 },
			{ date: "2026-04-04T08:00:00.000Z", totalCredits: 30 },
			{ date: "2026-04-03T08:00:00.000Z", totalCredits: 0 },
		];

		const forecast = calculateBurnRateForecast(tx, 1000, 5000);
		expect(forecast.avgRecentSpend).toBe(30);
		expect(forecast.projection.length).toBe(26);
		expect(forecast.projection[0].balance).toBe(4000);
	});

	test("getMonthSummary returns consistent totals", () => {
		jest.useFakeTimers().setSystemTime(new Date("2026-04-05T12:00:00.000Z"));
		const user = { monthlyLimit: 5000 };
		const tx = [{ totalCredits: 100 }, { totalCredits: 200 }];

		const summary = getMonthSummary(user, tx);
		expect(summary.totalSpent).toBe(300);
		expect(summary.remainingBudget).toBe(4700);
		expect(summary.daysElapsed).toBe(5);
		expect(summary.daysRemaining).toBe(25);
	});

	test("recommendMeals respects budget, preference and mealType", () => {
		const menuItems = [
			{ id: "1", credits: 20, isVeg: true, mealType: ["breakfast"] },
			{ id: "2", credits: 30, isVeg: false, mealType: ["breakfast"] },
			{ id: "3", credits: 15, isVeg: true, mealType: ["breakfast"] },
			{ id: "4", credits: 12, isVeg: true, mealType: ["lunch"] },
		];

		const result = recommendMeals(
			40,
			{ mealType: "breakfast", preference: "veg" },
			menuItems,
		);
		expect(result.items.map((i) => i.id)).toEqual(["3", "1"]);
		expect(result.totalCredits).toBe(35);
		expect(result.remainingBudget).toBe(5);
	});

	test("generateMealCombos returns combos within budget and preference", () => {
		const menuItems = [
			{
				id: "m1",
				name: "Paneer",
				category: "main",
				credits: 50,
				popularity: 5,
				isVeg: true,
				mealType: ["lunch"],
			},
			{
				id: "s1",
				name: "Roti",
				category: "side",
				credits: 10,
				popularity: 4,
				isVeg: true,
				mealType: ["lunch"],
			},
			{
				id: "m2",
				name: "Chicken Curry",
				category: "main",
				credits: 70,
				popularity: 5,
				isVeg: false,
				mealType: ["lunch"],
			},
			{
				id: "b1",
				name: "Idli",
				category: "main",
				credits: 20,
				popularity: 3,
				isVeg: true,
				mealType: ["breakfast"],
			},
		];

		const result = generateMealCombos(
			90,
			{ mealTypes: ["breakfast", "lunch"], preference: "veg" },
			menuItems,
		);

		expect(result.combos.length).toBeGreaterThan(0);
		for (const combo of result.combos) {
			expect(combo.totalCredits).toBeLessThanOrEqual(90);
			expect(combo.items.every((i) => i.isVeg)).toBe(true);
		}
	});
});
