import React, { useState, useCallback } from "react";
import "../styles/GuestMode.css";
import {
	HeroBowlGraphic,
	FloatingOrbs,
	PatternDots,
	IconDashboard,
	IconSuggestions,
	IconPlanner,
	IconWallet,
	IconLeaf,
	IconTrend,
	IconStar,
} from "../components/Illustrations";

import { useAuth } from "../context/AuthContext";
import { useMenu } from "../context/MenuContext";

export default function GuestMode() {
	const [showCalculator, setShowCalculator] = useState(false);
	const [calcBudget, setCalcBudget] = useState(100);
	const [groupedMeals, setGroupedMeals] = useState({
		breakfast: [],
		lunch: [],
		dinner: [],
	});
	const { signInWithGoogle, authError, clearAuthError } = useAuth();
	const { menuItems } = useMenu();

	const calculateMeals = useCallback(
		(budget) => {
			const today = new Date();
			const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
			const availableDates = Array.from(
				new Set(menuItems.map((item) => item.dateAvailable).filter(Boolean)),
			).sort();
			let targetDate = todayStr;
			if (availableDates.length > 0) {
				if (!availableDates.includes(todayStr)) {
					targetDate =
						availableDates.find((d) => d >= todayStr) || availableDates[0];
				}
			}

			const todaysItems = menuItems.filter(
				(item) => !item.dateAvailable || item.dateAvailable === targetDate,
			);
			const affordable = todaysItems.filter((item) => item.credits <= budget);
			const sortByPop = (items) =>
				[...items].sort((a, b) => b.popularity - a.popularity);
			setGroupedMeals({
				breakfast: sortByPop(
					affordable.filter((i) => i.mealType.includes("breakfast")),
				),
				lunch: sortByPop(
					affordable.filter((i) => i.mealType.includes("lunch")),
				),
				dinner: sortByPop(
					affordable.filter((i) => i.mealType.includes("dinner")),
				),
			});
		},
		[menuItems],
	);

	React.useEffect(() => {
		if (showCalculator && menuItems.length > 0) {
			calculateMeals(calcBudget);
		}
	}, [showCalculator, menuItems, calcBudget, calculateMeals]);

	const handleGetStarted = async () => {
		clearAuthError();
		await signInWithGoogle();
	};

	const features = [
		{
			icon: <IconDashboard size={32} />,
			title: "Smart Dashboard",
			description:
				"Track your monthly spending with visual progress indicators and safety limits",
		},
		{
			icon: <IconSuggestions size={32} />,
			title: "AI Suggestions",
			description:
				"Get personalized meal recommendations based on your budget and preferences",
		},
		{
			icon: <IconPlanner size={32} />,
			title: "Menu Planner",
			description:
				"Plan meals for the entire month with an interactive calendar view",
		},
		{
			icon: <IconWallet size={32} />,
			title: "Budget Control",
			description:
				"Set monthly limits and get alerts when approaching safe spending threshold",
		},
		{
			icon: <IconLeaf size={32} />,
			title: "Preference Based",
			description:
				"Customize recommendations based on your dietary preferences",
		},
		{
			icon: <IconTrend size={32} />,
			title: "Analytics",
			description:
				"Analyze your spending patterns and get insights for better planning",
		},
	];

	const handleToggleCalculator = () => {
		setShowCalculator(!showCalculator);
		if (!showCalculator) {
			calculateMeals(calcBudget);
		}
	};

	const handleBudgetChange = (e) => {
		const val = Number(e.target.value);
		setCalcBudget(val);
		calculateMeals(val);
	};

	const renderMealGroupList = (meals, title) => {
		if (meals.length === 0) return null;
		const vegList = meals.filter((m) => m.isVeg);
		const nonVegList = meals.filter((m) => !m.isVeg);

		const renderItem = (meal) => (
			<div
				key={meal.id}
				className="quick-meal-item"
				style={{
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
					padding: "10px 14px",
					background: "var(--bg-glass)",
					borderRadius: "var(--radius-md)",
					border: "1px solid var(--border-light)",
					boxShadow: "var(--shadow-sm)",
				}}
			>
				<div style={{ display: "flex", flexDirection: "column" }}>
					<div style={{ display: "flex", alignItems: "center", gap: 8 }}>
						<span
							title={meal.isVeg ? "Veg" : "Non-Veg"}
							style={{
								display: "inline-flex",
								alignItems: "center",
								justifyContent: "center",
								width: 14,
								height: 14,
								border: `1px solid ${meal.isVeg ? "#10b981" : "#f43f5e"}`,
								borderRadius: 3,
							}}
						>
							<span
								style={{
									width: 6,
									height: 6,
									borderRadius: "50%",
									backgroundColor: meal.isVeg ? "#10b981" : "#f43f5e",
								}}
							/>
						</span>
						<span
							style={{
								fontWeight: 600,
								color: "var(--text-primary)",
								fontSize: 14,
							}}
						>
							{meal.name}
						</span>
					</div>
					<div
						style={{
							display: "flex",
							alignItems: "center",
							gap: 2,
							marginTop: 4,
							marginLeft: 22,
						}}
					>
						{[...Array(5)].map((_, i) => (
							<span
								key={i}
								style={{
									color: i < meal.popularity ? "#fbbf24" : "#e2e8f0",
									display: "flex",
								}}
							>
								<IconStar size={12} />
							</span>
						))}
					</div>
				</div>
				<span
					style={{
						color: "var(--primary-600)",
						fontWeight: "700",
						fontFamily: "var(--font-display)",
						fontSize: 13,
					}}
				>
					{meal.credits} pts
				</span>
			</div>
		);

		return (
			<div style={{ marginBottom: 20 }}>
				<h5
					style={{
						fontSize: 14,
						color: "var(--text-secondary)",
						textTransform: "uppercase",
						letterSpacing: 0.5,
						marginBottom: 12,
						borderBottom: "1px solid var(--border-light)",
						paddingBottom: 6,
					}}
				>
					{title}
				</h5>
				{vegList.length > 0 && (
					<div style={{ marginBottom: 12 }}>
						<p
							style={{
								fontSize: 12,
								fontWeight: 600,
								color: "#10b981",
								marginBottom: 8,
							}}
						>
							Vegetarian
						</p>
						<div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
							{vegList.map(renderItem)}
						</div>
					</div>
				)}
				{nonVegList.length > 0 && (
					<div>
						<p
							style={{
								fontSize: 12,
								fontWeight: 600,
								color: "#f43f5e",
								marginBottom: 8,
							}}
						>
							Non-Vegetarian
						</p>
						<div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
							{nonVegList.map(renderItem)}
						</div>
					</div>
				)}
			</div>
		);
	};

	return (
		<div className="guest-mode">
			{/* Hero Section */}
			<section className="hero-section">
				<PatternDots className="hero-pattern left" />
				<PatternDots className="hero-pattern right" />
				<FloatingOrbs />

				<div className="hero-graphics">
					<HeroBowlGraphic className="hero-bowl" />
				</div>

				<div className="hero-content">
					<h1>Welcome to UNMESSIFY</h1>
					<p>
						Take control of your meal spending with smart budgeting & planning
					</p>
					<div
						className="hero-buttons"
						style={{
							display: "flex",
							flexDirection: "column",
							gap: "16px",
							alignItems: "center",
						}}
					>
						<div style={{ display: "flex", gap: "16px" }}>
							<button
								className="btn btn-primary btn-lg"
								onClick={handleGetStarted}
								style={{
									display: "flex",
									alignItems: "center",
									gap: "10px",
									background: "#fff",
									color: "#333",
									border: "1px solid #ccc",
									boxShadow: "var(--shadow-sm)",
								}}
							>
								Sign in with Google
							</button>
							<button
								className="btn btn-secondary btn-lg"
								onClick={handleToggleCalculator}
							>
								Quick Calculator
							</button>
						</div>
						{authError && (
							<div
								style={{
									background: "var(--danger-500)",
									color: "white",
									padding: "10px 16px",
									borderRadius: "8px",
									fontSize: "14px",
									maxWidth: "400px",
									textAlign: "center",
									animation: "fadeInUp 0.3s",
								}}
							>
								{authError}
							</div>
						)}
					</div>
				</div>

				{showCalculator && (
					<div className="demo-preview">
						<div className="demo-card calculator-card">
							<h3
								style={{
									display: "flex",
									alignItems: "center",
									gap: 8,
									justifyContent: "center",
								}}
							>
								<IconWallet size={24} /> Quick Budget Calculator
							</h3>
							<p
								style={{
									marginBottom: 20,
									color: "var(--text-secondary)",
									textAlign: "center",
								}}
							>
								See what you can afford today without signing in!
							</p>

							<div
								className="calculator-input-group"
								style={{
									display: "flex",
									gap: 10,
									marginBottom: 24,
									padding: "0 20px",
								}}
							>
								<div style={{ flex: 1, position: "relative" }}>
									<span
										style={{
											position: "absolute",
											left: 14,
											top: 12,
											color: "var(--text-tertiary)",
											fontWeight: "bold",
										}}
									>
										Pts
									</span>
									<input
										type="number"
										value={calcBudget}
										onChange={handleBudgetChange}
										min="10"
										max="1000"
										className="calc-input"
										style={{
											width: "100%",
											padding: "12px 14px 12px 40px",
											borderRadius: "var(--radius-lg)",
											border: "2px solid var(--border-light)",
											backgroundColor: "var(--slate-50)",
											fontSize: "16px",
											color: "var(--text-primary)",
											fontWeight: 600,
											outline: "none",
											transition: "border-color 0.2s",
										}}
									/>
								</div>
								<button
									className="btn btn-primary"
									onClick={() => calculateMeals(calcBudget)}
									style={{ padding: "0 24px" }}
								>
									Recalculate
								</button>
							</div>

							<div
								className="affordable-meals-results"
								style={{
									padding: "0 10px",
									maxHeight: "400px",
									overflowY: "auto",
								}}
							>
								<h4
									style={{
										fontSize: "14px",
										color: "var(--text-primary)",
										marginBottom: "16px",
										textAlign: "left",
									}}
								>
									You could afford these meals:
								</h4>
								{groupedMeals.breakfast.length > 0 ||
								groupedMeals.lunch.length > 0 ||
								groupedMeals.dinner.length > 0 ? (
									<div className="affordable-meals-list">
										{renderMealGroupList(groupedMeals.breakfast, "Breakfast")}
										{renderMealGroupList(groupedMeals.lunch, "Lunch")}
										{renderMealGroupList(groupedMeals.dinner, "Dinner")}
									</div>
								) : (
									<div
										style={{
											padding: "20px",
											textAlign: "center",
											background: "var(--slate-50)",
											borderRadius: "var(--radius-lg)",
											border: "1px dashed var(--danger-300)",
										}}
									>
										<p
											style={{
												color: "var(--danger-500)",
												fontSize: 14,
												fontWeight: 500,
												margin: 0,
											}}
										>
											Budget is too low to find matching meals. Try increasing
											it!
										</p>
									</div>
								)}
							</div>
						</div>
					</div>
				)}
			</section>

			{/* Features Section */}
			<section className="features-section">
				<div className="section-header">
					<h2>Powerful Features</h2>
					<p>Everything you need to manage your meal budget effectively</p>
				</div>

				<div className="features-grid">
					{features.map((feature, idx) => (
						<div key={idx} className="feature-card">
							<div className="feature-icon">{feature.icon}</div>
							<h3>{feature.title}</h3>
							<p>{feature.description}</p>
						</div>
					))}
				</div>
			</section>

			{/* How It Works */}
			<section className="how-it-works">
				<div className="section-header">
					<h2>How It Works</h2>
					<p>Simple 3-step process to master your meal budget</p>
				</div>

				<div className="steps-grid">
					<div className="step">
						<div className="step-number">1</div>
						<h3>Set Your Budget</h3>
						<p>
							Define your monthly spending limit and we'll calculate your daily
							budget automatically
						</p>
					</div>
					<div className="step">
						<div className="step-number">2</div>
						<h3>Get Recommendations</h3>
						<p>
							Receive AI-powered meal suggestions tailored to your budget and
							food preferences
						</p>
					</div>
					<div className="step">
						<div className="step-number">3</div>
						<h3>Track & Plan</h3>
						<p>
							Monitor your spending with interactive dashboard and plan meals
							for the entire month
						</p>
					</div>
				</div>
			</section>

			{/* Benefits */}
			<section className="benefits-section">
				<div className="section-header">
					<h2>Why Choose UNMESSIFY</h2>
				</div>

				<div className="benefits-grid">
					<div className="benefit">
						<div className="benefit-check">✓</div>
						<h3>Save Money</h3>
						<p>
							Reduce impulse spending with smart budget tracking and
							recommendations
						</p>
					</div>
					<div className="benefit">
						<div className="benefit-check">✓</div>
						<h3>Save Time</h3>
						<p>AI suggestions eliminate meal planning paralysis</p>
					</div>
					<div className="benefit">
						<div className="benefit-check">✓</div>
						<h3>Smart Insights</h3>
						<p>Understand your spending patterns and optimize your choices</p>
					</div>
					<div className="benefit">
						<div className="benefit-check">✓</div>
						<h3>Easy to Use</h3>
						<p>Intuitive interface designed for everyone</p>
					</div>
				</div>
			</section>

			{/* CTA Section */}
			<section className="cta-section">
				<h2>Ready to Take Control?</h2>
				<p>Join thousands of users who've mastered their meal budgets</p>
				<button className="btn btn-primary btn-lg" onClick={handleGetStarted}>
					Get Started Now 🚀
				</button>
			</section>
		</div>
	);
}
