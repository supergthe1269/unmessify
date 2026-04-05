import React, { useMemo } from "react";
import { useUser } from "../context/UserContext";
import { useTransactions } from "../context/TransactionContext";
import {
	calculateSafeLimit,
	getRemainingBudget,
	getMonthSummary,
	getDynamicDailyBudget,
	calculateBurnRateForecast,
} from "../utils/algorithms";
import {
	BarChart,
	Bar,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ResponsiveContainer,
	Area,
	AreaChart,
} from "recharts";
import {
	IconWallet,
	IconTarget,
	IconTrend,
	IconClock,
	IconPlanner,
	IconPlus,
} from "../components/Illustrations";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { useMenu } from "../context/MenuContext";
import { plannedMealStorage } from "../services/storageService";
import { pushPlannedMealsToCloud, debouncedSync } from "../services/cloudSync";
import { AddMealModal } from "./MenuPlanner";
import "../styles/Dashboard.css";

export default function Dashboard() {
	const { user } = useUser();
	const { authUser } = useAuth();
	const { transactions, addTransaction, deleteTransaction } = useTransactions();
	const { theme } = useTheme();
	const { menuItems } = useMenu();

	const [plannedMeals, setPlannedMeals] = React.useState(() => {
		const syncResult = plannedMealStorage.getAllSync();
		return Array.isArray(syncResult) ? syncResult : [];
	});
	const [showAddModal, setShowAddModal] = React.useState(false);

	React.useEffect(() => {
		const loadMeals = async () => {
			const saved = await plannedMealStorage.getAll();
			if (Array.isArray(saved)) {
				setPlannedMeals(saved);
			}
		};
		loadMeals();
	}, []);

	const handleAddMeal = async (meals) => {
		const mealsToAdd = Array.isArray(meals) ? meals : [meals];

		// Add to planned meals
		const newMeals = [...plannedMeals, ...mealsToAdd];
		setPlannedMeals(newMeals);
		await plannedMealStorage.save(newMeals);
		if (authUser && authUser.uid) {
			debouncedSync(authUser.uid, pushPlannedMealsToCloud, 2000);
		}

		// ALSO ADD to transactions so it charges the budget metrics immediately
		mealsToAdd.forEach((meal) => {
			addTransaction({
				mealName: meal.mealName,
				mealId: meal.mealId || meal.id,
				totalCredits: meal.credits,
				mealType: meal.mealType,
				isVeg: meal.isVeg,
				date: new Date().toISOString(), // stamp it for today
				linkedPlannedMealDate: meal.date, // link to planned meal so we can delete later
			});
		});
	};

	const handleDeleteMeal = async (date, mealType, mealName) => {
		// Delete from planned meals
		const newMeals = plannedMeals.filter(
			(m) =>
				!(
					m.date === date &&
					m.mealType === mealType &&
					m.mealName === mealName
				),
		);
		setPlannedMeals(newMeals);
		await plannedMealStorage.save(newMeals);
		if (authUser && authUser.uid) {
			debouncedSync(authUser.uid, pushPlannedMealsToCloud, 2000);
		}

		// ALSO DELETE from transactions
		const matchedTransaction = transactions.find(
			(t) =>
				t.linkedPlannedMealDate === date &&
				t.mealType === mealType &&
				t.mealName === mealName,
		);
		if (matchedTransaction) {
			deleteTransaction(matchedTransaction.id);
		}
	};

	const todayStr = useMemo(() => {
		const today = new Date();
		return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
	}, []);

	const todaysMeals = useMemo(() => {
		const meals = plannedMeals.filter((m) => m.date === todayStr);
		const order = { breakfast: 1, lunch: 2, snack: 3, dinner: 4 };
		return meals.sort(
			(a, b) => (order[a.mealType] || 99) - (order[b.mealType] || 99),
		);
	}, [plannedMeals, todayStr]);

	const monthlyTransactions = useMemo(() => {
		if (!transactions) return [];
		const now = new Date();
		return transactions.filter((t) => {
			const date = new Date(t.date);
			return (
				date.getMonth() === now.getMonth() &&
				date.getFullYear() === now.getFullYear()
			);
		});
	}, [transactions]);

	const summary = useMemo(() => {
		if (!user) return null;
		return getMonthSummary(user, monthlyTransactions);
	}, [user, monthlyTransactions]);

	// Build last 7 days chart data
	const chartData = useMemo(() => {
		const days = [];
		for (let i = 6; i >= 0; i--) {
			const d = new Date();
			d.setDate(d.getDate() - i);
			const dateStr = d.toISOString().split("T")[0];
			const dayLabel = d.toLocaleDateString("en-US", { weekday: "short" });
			const daySpent = transactions
				.filter((t) => t.date && t.date.startsWith(dateStr))
				.reduce((sum, t) => sum + (t.totalCredits || 0), 0);
			days.push({ day: dayLabel, credits: daySpent, date: dateStr });
		}
		return days;
	}, [transactions]);

	const burnRateData = useMemo(() => {
		if (!transactions || !user || !summary)
			return { projection: [], zeroBalanceDate: null, avgRecentSpend: 0 };
		return calculateBurnRateForecast(
			transactions,
			summary.totalSpent,
			user.monthlyLimit,
		);
	}, [transactions, summary, user]);

	if (!user || !summary) {
		return <div className="dashboard">Loading...</div>;
	}

	const dynamicDailyBudget = getDynamicDailyBudget(
		summary.totalSpent,
		user.monthlyLimit,
	);

	const safeLimit = calculateSafeLimit(user.monthlyLimit);
	const remainingBudget = getRemainingBudget(
		summary.totalSpent,
		user.monthlyLimit,
	);
	const isSafeLimitReached = summary.totalSpent >= safeLimit;
	const isBudgetExceeded = summary.totalSpent > user.monthlyLimit;

	const CustomTooltip = ({ active, payload, label }) => {
		if (active && payload && payload.length) {
			return (
				<div
					style={{
						background: theme === "dark" ? "var(--bg-card)" : "white",
						padding: "10px 14px",
						borderRadius: "10px",
						boxShadow: "var(--shadow-md)",
						border: "1px solid var(--border-medium)",
						fontSize: "13px",
						color: "var(--text-primary)",
					}}
				>
					<p style={{ fontWeight: 600, margin: "0 0 4px" }}>{label}</p>
					<p
						style={{ color: "var(--primary-600)", fontWeight: 700, margin: 0 }}
					>
						{payload[0].value} credits
					</p>
				</div>
			);
		}
		return null;
	};

	return (
		<div className="dashboard">
			<div className="dashboard-header">
				<h1>Welcome back, {user?.name?.split(" ")[0] || "Student"}!</h1>
				<p>Month Overview</p>
			</div>

			{/* Alert Messages */}
			{isBudgetExceeded && (
				<div className="alert alert-danger">
					⚠️ Alert: You've exceeded your monthly budget by{" "}
					{summary.totalSpent - user.monthlyLimit} credits!
				</div>
			)}
			{isSafeLimitReached && !isBudgetExceeded && (
				<div className="alert alert-warning">
					⚡ Caution: You've reached 70% of your monthly budget. Be mindful of
					spending!
				</div>
			)}

			{/* Quick Stats */}
			<div className="quick-stats">
				<div className="stat-card">
					<div className="stat-icon spent">
						<IconWallet size={24} />
					</div>
					<div className="stat-content">
						<p className="stat-label">Total Spent</p>
						<p className="stat-value">{summary.totalSpent}</p>
						<p className="stat-subtext">of {user.monthlyLimit}</p>
					</div>
				</div>

				<div className="stat-card">
					<div className="stat-icon remaining">
						<IconTarget size={24} />
					</div>
					<div className="stat-content">
						<p className="stat-label">Remaining</p>
						<p className="stat-value">{remainingBudget}</p>
						<p className="stat-subtext">credits left</p>
					</div>
				</div>

				<div className="stat-card">
					<div className="stat-icon rate">
						<IconTrend size={24} />
					</div>
					<div className="stat-content">
						<p className="stat-label">Today's Safe Limit</p>
						<p className="stat-value">{dynamicDailyBudget}</p>
						<p className="stat-subtext">changes dynamically based on spend</p>
					</div>
				</div>

				<div className="stat-card">
					<div className="stat-icon days">
						<IconClock size={24} />
					</div>
					<div className="stat-content">
						<p className="stat-label">Days Left</p>
						<p className="stat-value">{summary.daysRemaining}</p>
						<p className="stat-subtext">in this month</p>
					</div>
				</div>
			</div>

			{/* Budget Progress */}
			<div className="budget-section">
				<h2>Monthly Budget Progress</h2>
				<div className="progress-container">
					<div className="progress-bar-wrapper">
						<div className="progress-label">
							<span>Spending</span>
							<span>
								{summary.totalSpent} / {user.monthlyLimit}
							</span>
						</div>
						<div className="progress-bar">
							<div
								className={`progress-fill ${
									isBudgetExceeded
										? "exceeded"
										: isSafeLimitReached
											? "caution"
											: "safe"
								}`}
								style={{
									width: `${Math.min((summary.totalSpent / user.monthlyLimit) * 100, 100)}%`,
								}}
							></div>
							<div
								className="safe-limit-marker"
								style={{
									left: `${(safeLimit / user.monthlyLimit) * 100}%`,
								}}
								title="Safe Limit (70%)"
							></div>
						</div>
					</div>
				</div>
			</div>

			{/* Today's Meal Plan */}
			<div className="todays-plan-section" style={{ marginBottom: 24 }}>
				<div
					style={{
						display: "flex",
						justifyContent: "space-between",
						alignItems: "center",
						marginBottom: "16px",
					}}
				>
					<h2>Today's Meal Plan</h2>
					<button
						className="btn btn-primary"
						style={{
							padding: "6px 12px",
							fontSize: "13px",
							display: "flex",
							alignItems: "center",
							gap: 4,
						}}
						onClick={() => setShowAddModal(true)}
					>
						<IconPlus size={14} /> Add
					</button>
				</div>

				{todaysMeals.length > 0 ? (
					<div
						className="meals-list"
						style={{ display: "flex", flexDirection: "column", gap: "12px" }}
					>
						{todaysMeals.map((meal, idx) => (
							<div
								key={idx}
								className="meal-item"
								style={{
									display: "flex",
									alignItems: "center",
									padding: "12px 16px",
									background: "var(--bg-glass)",
									borderRadius: "var(--radius-md)",
									border: "1px solid var(--border-light)",
								}}
							>
								<div
									className="meal-info"
									style={{ flex: 1, display: "flex", flexDirection: "column" }}
								>
									<p
										className="meal-time"
										style={{
											fontSize: "12px",
											color: "var(--text-secondary)",
											textTransform: "uppercase",
											letterSpacing: "0.5px",
											fontWeight: 600,
											margin: "0 0 4px 0",
										}}
									>
										{meal.mealType}
									</p>
									<p
										className="meal-name"
										style={{
											fontSize: "14px",
											fontWeight: 600,
											color: "var(--text-primary)",
											margin: 0,
										}}
									>
										{meal.mealName}
									</p>
								</div>
								<span
									className="meal-credits"
									style={{
										fontSize: "14px",
										fontWeight: 700,
										color: "var(--primary-600)",
										fontFamily: "var(--font-display)",
										marginRight: "16px",
									}}
								>
									{meal.credits} pts
								</span>
								<button
									className="btn-delete"
									style={{
										background: "none",
										border: "none",
										color: "#f43f5e",
										cursor: "pointer",
										outline: "none",
										fontSize: "20px",
										padding: "0 8px",
										display: "flex",
									}}
									onClick={() =>
										handleDeleteMeal(meal.date, meal.mealType, meal.mealName)
									}
									title="Remove meal"
								>
									×
								</button>
							</div>
						))}
					</div>
				) : (
					<div
						className="no-transactions"
						style={{
							textAlign: "center",
							padding: "30px",
							background: "var(--bg-glass)",
							borderRadius: "var(--radius-md)",
							border: "1px dashed var(--border-medium)",
							color: "var(--text-secondary)",
						}}
					>
						<p
							style={{
								display: "flex",
								flexDirection: "column",
								alignItems: "center",
								gap: "8px",
								margin: 0,
							}}
						>
							<IconPlanner size={32} style={{ color: "var(--primary-400)" }} />
							No meals planned for today.
							<br />
							Click Add to start planning!
						</p>
					</div>
				)}
			</div>

			{/* Spending Trend — Real Chart */}
			<div className="trend-section">
				<h2>Spending Trend (Last 7 Days)</h2>
				<div className="trend-chart">
					{chartData.some((d) => d.credits > 0) ? (
						<ResponsiveContainer width="100%" height={280}>
							<BarChart data={chartData} barCategoryGap="20%">
								<CartesianGrid
									strokeDasharray="3 3"
									stroke="#e2e8f0"
									vertical={false}
								/>
								<XAxis
									dataKey="day"
									axisLine={false}
									tickLine={false}
									tick={{ fill: "#94a3b8", fontSize: 12, fontWeight: 500 }}
								/>
								<YAxis
									axisLine={false}
									tickLine={false}
									tick={{ fill: "#94a3b8", fontSize: 12 }}
								/>
								<Tooltip
									content={<CustomTooltip />}
									cursor={{ fill: "rgba(99, 102, 241, 0.05)" }}
								/>
								<defs>
									<linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
										<stop offset="0%" stopColor="#6366f1" />
										<stop offset="100%" stopColor="#a855f7" />
									</linearGradient>
								</defs>
								<Bar
									dataKey="credits"
									fill="url(#barGradient)"
									radius={[6, 6, 0, 0]}
									maxBarSize={48}
								/>
							</BarChart>
						</ResponsiveContainer>
					) : (
						<div className="chart-empty">
							<p>📊 No spending data yet.</p>
							<p>Add meals from the Suggestions page to start tracking!</p>
						</div>
					)}
				</div>
			</div>

			{/* Burn Rate Visualization - Linear Projection */}
			<div className="trend-section">
				<h2>Burn Rate Visualization</h2>
				<p
					style={{
						fontSize: "14px",
						color: "var(--text-secondary)",
						marginBottom: "16px",
					}}
				>
					Linear projection based on your recent 3-day average spend (
					{Math.round(burnRateData.avgRecentSpend)} credits/day).
					{burnRateData.zeroBalanceDate && (
						<strong
							style={{
								color: "var(--danger-500)",
								display: "block",
								marginTop: "4px",
							}}
						>
							Estimated Zero Balance:{" "}
							{burnRateData.zeroBalanceDate.toLocaleDateString("en-US", {
								month: "short",
								day: "numeric",
								year: "numeric",
							})}
						</strong>
					)}
				</p>
				<div className="trend-chart">
					{burnRateData.projection.length > 0 ? (
						<ResponsiveContainer width="100%" height={280}>
							<AreaChart data={burnRateData.projection}>
								<defs>
									<linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
										<stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
										<stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
									</linearGradient>
								</defs>
								<CartesianGrid
									strokeDasharray="3 3"
									stroke="#e2e8f0"
									vertical={false}
								/>
								<XAxis
									dataKey="day"
									axisLine={false}
									tickLine={false}
									tick={{ fill: "#94a3b8", fontSize: 12, fontWeight: 500 }}
								/>
								<YAxis
									axisLine={false}
									tickLine={false}
									tick={{ fill: "#94a3b8", fontSize: 12 }}
								/>
								<Tooltip content={<CustomTooltip />} />
								<Area
									type="monotone"
									dataKey="balance"
									stroke="#ef4444"
									strokeWidth={3}
									fillOpacity={1}
									fill="url(#colorBalance)"
								/>
							</AreaChart>
						</ResponsiveContainer>
					) : (
						<div className="chart-empty">
							<p>📊 Not enough data for projection.</p>
						</div>
					)}
				</div>
			</div>

			{showAddModal && (
				<AddMealModal
					date={todayStr}
					menuItems={menuItems}
					onAdd={handleAddMeal}
					onClose={() => setShowAddModal(false)}
				/>
			)}
		</div>
	);
}
