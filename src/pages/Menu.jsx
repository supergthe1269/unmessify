import React, { useState, useMemo, useEffect } from "react";
import { useMenu } from "../context/MenuContext";
import "../styles/Menu.css";

export default function MenuPage() {
	const { menuItems, loadingMenu, mealTypes } = useMenu();
	const today = new Date();
	const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

	const [selectedDate, setSelectedDate] = useState("");

	// Extract available dates from the menu data to populate a date selector
	const availableDates = useMemo(() => {
		const dates = new Set();
		menuItems.forEach((item) => {
			if (item.dateAvailable) {
				dates.add(item.dateAvailable);
			}
		});
		return Array.from(dates).sort();
	}, [menuItems]);

	// Set initial selected date
	useEffect(() => {
		if (!selectedDate && availableDates.length > 0) {
			if (availableDates.includes(todayStr)) {
				setSelectedDate(todayStr);
			} else {
				// Find nearest future date or just first date
				const futureDate = availableDates.find((d) => d >= todayStr);
				setSelectedDate(futureDate || availableDates[0]);
			}
		}
	}, [availableDates, selectedDate, todayStr]);

	const itemsForSelectedDate = useMemo(() => {
		if (!selectedDate) return [];
		return menuItems.filter((item) => item.dateAvailable === selectedDate);
	}, [menuItems, selectedDate]);

	if (loadingMenu) {
		return (
			<div className="page-container">
				<div className="page-header">
					<h1>Mess Menu</h1>
				</div>
				<div className="center-message">Loading menu...</div>
			</div>
		);
	}

	return (
		<div className="page-container menu-page">
			<div className="page-header">
				<div>
					<h1>Mess Menu</h1>
					<p>Browse the full monthly menu items by date.</p>
				</div>

				{availableDates.length > 0 && (
					<div className="date-selector">
						<select
							value={selectedDate}
							onChange={(e) => setSelectedDate(e.target.value)}
							className="date-dropdown"
						>
							{availableDates.map((date) => (
								<option key={date} value={date}>
									{new Date(date + "T12:00:00").toLocaleDateString("en-US", {
										weekday: "short",
										month: "short",
										day: "numeric",
										year: "numeric",
									})}
								</option>
							))}
						</select>
					</div>
				)}
			</div>

			{!itemsForSelectedDate.length ? (
				<div className="empty-menu">
					<p>No menu data available for selected date.</p>
				</div>
			) : (
				<div className="daily-menu-grid">
  {mealTypes.map((mealTime) => {
    const meals = itemsForSelectedDate.filter((item) =>
      item.mealType.includes(mealTime),
    );
    if (meals.length === 0) return null;
    const vegItems = meals.filter(item => item.isVeg);
    const nonVegItems = meals.filter(item => !item.isVeg);
    return (
      <div key={mealTime} className="meal-time-card">
        <h2 className="meal-title">
          {mealTime.charAt(0).toUpperCase() + mealTime.slice(1)}
        </h2>
        <div className="meal-content">
          {vegItems.length > 0 && (
            <div className="diet-section veg-section">
              <h4 className="diet-header">
                <span className="veg-indicator veg" title="Veg"></span> Veg
              </h4>
              <ul className="meal-items-list">
                {vegItems.map(item => (
                  <li key={item.id} className="meal-item-row">
                    <span className="item-name">{item.name}</span>
                    <span className="item-credits">{item.credits} pts</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {nonVegItems.length > 0 && (
            <div className="diet-section non-veg-section">
              <h4 className="diet-header">
                <span className="veg-indicator non-veg" title="Non Veg"></span> Non Veg
              </h4>
              <ul className="meal-items-list">
                {nonVegItems.map(item => (
                  <li key={item.id} className="meal-item-row">
                    <span className="item-name">{item.name}</span>
                    <span className="item-credits">{item.credits} pts</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    );
  })}
</div>
)}
		</div>
	);
}




