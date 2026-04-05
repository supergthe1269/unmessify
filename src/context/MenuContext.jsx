import React, { createContext, useContext, useState, useEffect } from "react";
import { fetchAndProcessMenu } from "../services/messApi";

const MenuContext = createContext();
const categories = ["main", "side", "dessert", "beverage"];
const mealTypes = ["breakfast", "lunch", "snack", "dinner"];

export function MenuProvider({ children }) {
	const [menuItems, setMenuItems] = useState([]);
	const [loadingMenu, setLoadingMenu] = useState(true);

	// Fetch the dynamic menu items from API
	useEffect(() => {
		const loadAPI = async () => {
			const liveData = await fetchAndProcessMenu();
			if (liveData) {
				setMenuItems(liveData);
			}
			setLoadingMenu(false);
		};
		loadAPI();
	}, []);

	// Helper functions based on state
	const getItemsByMealType = (mealType) => {
		return menuItems.filter((item) => item.mealType.includes(mealType));
	};

	const getItemsByCategory = (category) => {
		return menuItems.filter((item) => item.category === category);
	};

	const getItemsByPreference = (preference) => {
		if (preference === "both") return menuItems;
		if (preference === "veg") return menuItems.filter((item) => item.isVeg);
		return menuItems.filter((item) => !item.isVeg);
	};

	// Get menu item by ID
	const getItemById = (id) => {
		return menuItems.find((item) => item.id === id);
	};

	// Get multiple items by IDs
	const getItemsByIds = (ids) => {
		return ids.map((id) => getItemById(id)).filter(Boolean);
	};

	// Search items by name
	const searchItems = (query) => {
		const lowerQuery = query.toLowerCase();
		return menuItems.filter((item) =>
			item.name.toLowerCase().includes(lowerQuery),
		);
	};

	// Get items within a budget
	const getAffordableItems = (budget, options = {}) => {
		const { mealType, preference } = options;
		let items = menuItems;

		if (mealType) {
			items = items.filter((item) => item.mealType.includes(mealType));
		}

		if (preference && preference !== "both") {
			items = items.filter((item) =>
				preference === "veg" ? item.isVeg : !item.isVeg,
			);
		}

		return items.filter((item) => item.credits <= budget);
	};

	// Calculate total credits for a list of items
	const calculateTotal = (items) => {
		return items.reduce((sum, item) => sum + item.credits, 0);
	};

	const value = {
		menuItems,
		loadingMenu,
		categories,
		mealTypes,
		getItemById,
		getItemsByIds,
		getItemsByMealType,
		getItemsByCategory,
		getItemsByPreference,
		searchItems,
		getAffordableItems,
		calculateTotal,
	};

	return <MenuContext.Provider value={value}>{children}</MenuContext.Provider>;
}

// Custom hook for using menu context
export function useMenu() {
	const context = useContext(MenuContext);
	if (context === undefined) {
		throw new Error("useMenu must be used within a MenuProvider");
	}
	return context;
}

export { MenuContext };

