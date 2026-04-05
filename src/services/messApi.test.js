import { fetchAndProcessMenu } from "./messApi";

describe("fetchAndProcessMenu", () => {
	const originalFetch = global.fetch;
	const consoleErrorSpy = jest
		.spyOn(console, "error")
		.mockImplementation(() => {});

	afterEach(() => {
		global.fetch = originalFetch;
		jest.clearAllMocks();
	});

	afterAll(() => {
		consoleErrorSpy.mockRestore();
	});

	test("transforms API response into normalized menu items", async () => {
		global.fetch = jest.fn().mockResolvedValue({
			ok: true,
			json: async () => ({
				menu: [
					{
						date: "2026-04-05",
						menu: [
							{ type: 1, menu: "Idli, Tea" },
							{ type: 2, menu: "Chicken Curry, Roti" },
						],
					},
				],
			}),
		});

		const result = await fetchAndProcessMenu();
		expect(Array.isArray(result)).toBe(true);
		expect(result).toHaveLength(4);

		const breakfast = result.find((i) => i.name === "Idli");
		const tea = result.find((i) => i.name === "Tea");
		const chicken = result.find((i) => i.name === "Chicken Curry");

		expect(breakfast.mealType).toEqual(["breakfast"]);
		expect(tea.credits).toBe(15);
		expect(chicken.isVeg).toBe(false);
		expect(chicken.credits).toBe(70);
		expect(chicken.dateAvailable).toBe("2026-04-05");
	});

	test("returns null when network request fails", async () => {
		global.fetch = jest.fn().mockRejectedValue(new Error("boom"));
		const result = await fetchAndProcessMenu();
		expect(result).toBeNull();
		expect(consoleErrorSpy).toHaveBeenCalled();
	});

	test("returns null when response is not ok", async () => {
		global.fetch = jest.fn().mockResolvedValue({ ok: false });
		const result = await fetchAndProcessMenu();
		expect(result).toBeNull();
		expect(consoleErrorSpy).toHaveBeenCalled();
	});
});
