const mealTypeMap = {
	1: "breakfast",
	2: "lunch",
	3: "snack", // Keep in sync with mealTypes in MenuContext
	4: "dinner",
};

const API_URL = "https://messit.vinnovateit.com/menu-data/hostel-1-mess-1.json";

export const fetchAndProcessMenu = async () => {
	try {
		const response = await fetch(API_URL);
		if (!response.ok) throw new Error("Network response was not ok");

		const rawData = await response.json();

		// The data is an object with a "menu" array which contains `{ date: '...', menu: [...] }`
		const menuDays = rawData.menu || [];

		let newMenuItems = [];
		let idCounter = 1;

		menuDays.forEach((dayObject) => {
			dayObject.menu.forEach((mealChunk) => {
				const mealTime = mealTypeMap[mealChunk.type];

				// Split by comma
				const items = mealChunk.menu
					.split(",")
					.map((item) => item.trim().replace(/\n/g, " "));

				items.forEach((itemName) => {
					if (itemName) {
						// Base logic to assign credits based on heuristics/keywords
						let assignedCredits = 30; // Default
						const normalizedName = itemName.toLowerCase();

						if (
							normalizedName.includes("chicken") ||
							normalizedName.includes("mutton")
						)
							assignedCredits = 70;
						else if (normalizedName.includes("fish")) assignedCredits = 60;
						else if (
							normalizedName.includes("egg") ||
							normalizedName.includes("paneer")
						)
							assignedCredits = 50;
						else if (
							normalizedName.includes("biryani") ||
							normalizedName.includes("pulao") ||
							normalizedName.includes("rice")
						)
							assignedCredits = 40;
						else if (
							normalizedName.includes("dal") ||
							normalizedName.includes("curd") ||
							normalizedName.includes("raita")
						)
							assignedCredits = 20;
						else if (
							normalizedName.includes("roti") ||
							normalizedName.includes("chapati") ||
							normalizedName.includes("naan") ||
							normalizedName.includes("paratha")
						)
							assignedCredits = 15;
						else if (
							normalizedName.includes("tea") ||
							normalizedName.includes("milk") ||
							normalizedName.includes("coffee")
						)
							assignedCredits = 15;

						// Base logic to assign popularity to higher credit / premium items
						const popularityScore =
							assignedCredits >= 50 ? 5 : assignedCredits <= 20 ? 3 : 4;

						newMenuItems.push({
							id: `api_${dayObject.date}_${idCounter++}`,
							name: itemName,
							credits: assignedCredits,
							category: "main",
							mealType: [mealTime],
							// Basic check for Veg
							isVeg:
								!itemName.toLowerCase().includes("chicken") &&
								!itemName.toLowerCase().includes("egg") &&
								!itemName.toLowerCase().includes("fish") &&
								!itemName.toLowerCase().includes("mutton"),
							popularity: popularityScore,
							calories: 250,
							dateAvailable: dayObject.date, // Tag it with a specific date
						});
					}
				});
			});
		});

		return newMenuItems;
	} catch (error) {
		console.error("Failed to load mess menu", error);
		return null;
	}
};
