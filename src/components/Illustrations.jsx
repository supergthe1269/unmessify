import React from "react";

/* ─── Reusable SVG Illustrations for UNMESSIFY ─── */

// Animated floating food bowl used in hero section
export function HeroBowlGraphic({ className = "" }) {
	return (
		<svg
			className={className}
			viewBox="0 0 400 360"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
		>
			{/* Steam wisps */}
			<g className="steam-group">
				<path
					d="M160 80 Q165 50 155 20"
					stroke="rgba(82,245,216,0.4)"
					strokeWidth="3"
					strokeLinecap="round"
					fill="none"
				>
					<animate
						attributeName="d"
						values="M160 80 Q165 50 155 20;M160 80 Q150 45 160 15;M160 80 Q165 50 155 20"
						dur="3s"
						repeatCount="indefinite"
					/>
					<animate
						attributeName="opacity"
						values="0.4;0.1;0.4"
						dur="3s"
						repeatCount="indefinite"
					/>
				</path>
				<path
					d="M200 70 Q205 35 195 5"
					stroke="rgba(82,245,216,0.3)"
					strokeWidth="2.5"
					strokeLinecap="round"
					fill="none"
				>
					<animate
						attributeName="d"
						values="M200 70 Q205 35 195 5;M200 70 Q190 30 200 0;M200 70 Q205 35 195 5"
						dur="3.5s"
						repeatCount="indefinite"
					/>
					<animate
						attributeName="opacity"
						values="0.3;0.08;0.3"
						dur="3.5s"
						repeatCount="indefinite"
					/>
				</path>
				<path
					d="M240 80 Q250 50 238 18"
					stroke="rgba(252,211,77,0.3)"
					strokeWidth="2"
					strokeLinecap="round"
					fill="none"
				>
					<animate
						attributeName="d"
						values="M240 80 Q250 50 238 18;M240 80 Q235 42 245 12;M240 80 Q250 50 238 18"
						dur="4s"
						repeatCount="indefinite"
					/>
					<animate
						attributeName="opacity"
						values="0.3;0.06;0.3"
						dur="4s"
						repeatCount="indefinite"
					/>
				</path>
			</g>
			{/* Bowl body */}
			<ellipse cx="200" cy="200" rx="160" ry="60" fill="url(#bowlGrad)" />
			<path
				d="M40 200 Q40 310 200 310 Q360 310 360 200"
				fill="url(#bowlBodyGrad)"
			/>
			<ellipse cx="200" cy="200" rx="140" ry="48" fill="#1e2435" />
			{/* Food items in bowl */}
			<circle cx="160" cy="190" r="22" fill="url(#foodGrad1)" opacity="0.9" />
			<circle cx="215" cy="185" r="18" fill="url(#foodGrad2)" opacity="0.85" />
			<circle cx="245" cy="198" r="15" fill="url(#foodGrad3)" opacity="0.8" />
			<circle cx="180" cy="205" r="12" fill="url(#foodGrad1)" opacity="0.7" />
			<rect
				x="195"
				y="195"
				width="30"
				height="8"
				rx="4"
				fill="url(#foodGrad2)"
				opacity="0.75"
				transform="rotate(-15 210 199)"
			/>
			{/* Bowl rim highlight */}
			<ellipse
				cx="200"
				cy="200"
				rx="160"
				ry="60"
				fill="none"
				stroke="rgba(82,245,216,0.2)"
				strokeWidth="2"
			/>
			{/* Spoon */}
			<g transform="translate(290, 160) rotate(30)">
				<rect x="0" y="0" width="6" height="80" rx="3" fill="url(#spoonGrad)" />
				<ellipse cx="3" cy="-10" rx="14" ry="18" fill="url(#spoonGrad)" />
				<ellipse cx="3" cy="-10" rx="10" ry="14" fill="#252b3b" />
			</g>
			{/* Defs */}
			<defs>
				<linearGradient id="bowlGrad" x1="40" y1="200" x2="360" y2="200">
					<stop offset="0%" stopColor="#08c4a8" />
					<stop offset="100%" stopColor="#039e8a" />
				</linearGradient>
				<linearGradient id="bowlBodyGrad" x1="200" y1="200" x2="200" y2="310">
					<stop offset="0%" stopColor="#077e70" />
					<stop offset="100%" stopColor="#0e524a" />
				</linearGradient>
				<radialGradient id="foodGrad1">
					<stop offset="0%" stopColor="#fbbf24" />
					<stop offset="100%" stopColor="#f59e0b" />
				</radialGradient>
				<radialGradient id="foodGrad2">
					<stop offset="0%" stopColor="#34d399" />
					<stop offset="100%" stopColor="#059669" />
				</radialGradient>
				<radialGradient id="foodGrad3">
					<stop offset="0%" stopColor="#fb7185" />
					<stop offset="100%" stopColor="#e11d48" />
				</radialGradient>
				<linearGradient id="spoonGrad" x1="0" y1="0" x2="6" y2="80">
					<stop offset="0%" stopColor="#a8afc0" />
					<stop offset="100%" stopColor="#636c82" />
				</linearGradient>
			</defs>
		</svg>
	);
}

// Decorative floating circle set
export function FloatingOrbs({ className = "" }) {
	return (
		<div className={`floating-orbs ${className}`} aria-hidden="true">
			<div className="orb orb-teal orb-1"></div>
			<div className="orb orb-amber orb-2"></div>
			<div className="orb orb-teal orb-3"></div>
			<div className="orb orb-amber orb-4"></div>
		</div>
	);
}

// Custom icon components (replacing emojis)
export function IconDashboard({ size = 20 }) {
	return (
		<svg
			width={size}
			height={size}
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<rect x="3" y="3" width="7" height="9" rx="2" />
			<rect x="14" y="3" width="7" height="5" rx="2" />
			<rect x="14" y="12" width="7" height="9" rx="2" />
			<rect x="3" y="16" width="7" height="5" rx="2" />
		</svg>
	);
}

export function IconSuggestions({ size = 20 }) {
	return (
		<svg
			width={size}
			height={size}
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<path d="M9 18h6" />
			<path d="M10 22h4" />
			<path d="M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2z" />
			<line x1="12" y1="6" x2="12" y2="10" />
			<line x1="10" y1="8" x2="14" y2="8" />
		</svg>
	);
}

export function IconPlanner({ size = 20 }) {
	return (
		<svg
			width={size}
			height={size}
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<rect x="3" y="4" width="18" height="18" rx="3" />
			<line x1="16" y1="2" x2="16" y2="6" />
			<line x1="8" y1="2" x2="8" y2="6" />
			<line x1="3" y1="10" x2="21" y2="10" />
			<circle cx="12" cy="16" r="2" fill="currentColor" />
		</svg>
	);
}

export function IconWallet({ size = 24 }) {
	return (
		<svg
			width={size}
			height={size}
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<path d="M20 12V8a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
			<rect x="16" y="10" width="6" height="4" rx="1" />
			<circle cx="18" cy="12" r="0.5" fill="currentColor" />
		</svg>
	);
}

export function IconTarget({ size = 24 }) {
	return (
		<svg
			width={size}
			height={size}
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<circle cx="12" cy="12" r="10" />
			<circle cx="12" cy="12" r="6" />
			<circle cx="12" cy="12" r="2" fill="currentColor" />
		</svg>
	);
}

export function IconTrend({ size = 24 }) {
	return (
		<svg
			width={size}
			height={size}
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
			<polyline points="16 7 22 7 22 13" />
		</svg>
	);
}

export function IconClock({ size = 24 }) {
	return (
		<svg
			width={size}
			height={size}
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<circle cx="12" cy="12" r="10" />
			<polyline points="12 6 12 12 16 14" />
		</svg>
	);
}

export function IconPlus({ size = 18 }) {
	return (
		<svg
			width={size}
			height={size}
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2.5"
			strokeLinecap="round"
		>
			<line x1="12" y1="5" x2="12" y2="19" />
			<line x1="5" y1="12" x2="19" y2="12" />
		</svg>
	);
}

export function IconTrash({ size = 16 }) {
	return (
		<svg
			width={size}
			height={size}
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<polyline points="3 6 5 6 21 6" />
			<path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
		</svg>
	);
}

export function IconSearch({ size = 18 }) {
	return (
		<svg
			width={size}
			height={size}
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2.5"
			strokeLinecap="round"
		>
			<circle cx="11" cy="11" r="8" />
			<line x1="21" y1="21" x2="16.65" y2="16.65" />
		</svg>
	);
}

export function IconCart({ size = 18 }) {
	return (
		<svg
			width={size}
			height={size}
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<circle cx="9" cy="21" r="1" />
			<circle cx="20" cy="21" r="1" />
			<path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
		</svg>
	);
}

export function IconLeaf({ size = 16 }) {
	return (
		<svg
			width={size}
			height={size}
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<path d="M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66.95-2.3c.48.17.98.3 1.34.3C19 20 22 3 22 3c-1 2-8 2.25-13 3.25S2 11.5 2 13.5s1.75 3.75 1.75 3.75" />
		</svg>
	);
}

export function IconDrumstick({ size = 16 }) {
	return (
		<svg
			width={size}
			height={size}
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<path d="M15.5 2.5c3 0 5.5 2.5 5.5 5.5 0 2.5-3 5-5 7l-1.5 1.5c-1 1-2 2.5-2 4.5 0 0-2 0-3.5-1.5S7.5 16 7.5 16c2 0 3.5-1 4.5-2L13.5 12.5c2-2 4.5-5 7-5" />
			<path d="M8 16l-4 4" />
			<path d="M4 20l-1 1" />
		</svg>
	);
}

export function IconLogout({ size = 20 }) {
	return (
		<svg
			width={size}
			height={size}
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
			<polyline points="16 17 21 12 16 7" />
			<line x1="21" y1="12" x2="9" y2="12" />
		</svg>
	);
}

export function IconCheck({ size = 18 }) {
	return (
		<svg
			width={size}
			height={size}
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="3"
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<polyline points="20 6 9 17 4 12" />
		</svg>
	);
}

export function IconFire({ size = 16 }) {
	return (
		<svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
			<path d="M12 23c-3.866 0-7-3.134-7-7 0-3.175 2.774-6.498 5-9 .702.876 1.378 1.756 2 2.656C14.106 6.31 16 3 16 3c0 3.5 1.5 5.5 3 7.5s2 4 2 5.5c0 3.866-3.134 7-7 7h-2z" />
		</svg>
	);
}

export function IconStar({ size = 16 }) {
	return (
		<svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
			<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
		</svg>
	);
}

// Empty state illustration for no data
export function EmptyStateGraphic({ type = "default", size = 200 }) {
	if (type === "no-transactions") {
		return (
			<svg width={size} height={size} viewBox="0 0 200 200" fill="none">
				<circle cx="100" cy="100" r="80" fill="rgba(8,196,168,0.05)" />
				<circle cx="100" cy="100" r="50" fill="rgba(8,196,168,0.08)" />
				<rect
					x="70"
					y="65"
					width="60"
					height="75"
					rx="8"
					fill="#1e2435"
					stroke="rgba(8,196,168,0.3)"
					strokeWidth="2"
				/>
				<line
					x1="82"
					y1="82"
					x2="118"
					y2="82"
					stroke="#363d4e"
					strokeWidth="2"
					strokeLinecap="round"
				/>
				<line
					x1="82"
					y1="92"
					x2="110"
					y2="92"
					stroke="#363d4e"
					strokeWidth="2"
					strokeLinecap="round"
				/>
				<line
					x1="82"
					y1="102"
					x2="115"
					y2="102"
					stroke="#363d4e"
					strokeWidth="2"
					strokeLinecap="round"
				/>
				<line
					x1="82"
					y1="112"
					x2="105"
					y2="112"
					stroke="#363d4e"
					strokeWidth="2"
					strokeLinecap="round"
				/>
				<circle
					cx="140"
					cy="60"
					r="20"
					fill="rgba(251,191,36,0.1)"
					stroke="rgba(251,191,36,0.3)"
					strokeWidth="2"
				/>
				<text
					x="140"
					y="66"
					textAnchor="middle"
					fill="rgba(251,191,36,0.6)"
					fontSize="18"
					fontWeight="bold"
				>
					?
				</text>
			</svg>
		);
	}

	if (type === "no-meals") {
		return (
			<svg width={size} height={size} viewBox="0 0 200 200" fill="none">
				<circle cx="100" cy="100" r="80" fill="rgba(8,196,168,0.04)" />
				<ellipse
					cx="100"
					cy="130"
					rx="55"
					ry="20"
					fill="#1e2435"
					stroke="rgba(8,196,168,0.2)"
					strokeWidth="2"
				/>
				<path
					d="M45 130 Q45 170 100 170 Q155 170 155 130"
					fill="#1a2030"
					stroke="rgba(8,196,168,0.15)"
					strokeWidth="2"
				/>
				<line
					x1="100"
					y1="60"
					x2="100"
					y2="120"
					stroke="#363d4e"
					strokeWidth="3"
					strokeLinecap="round"
					strokeDasharray="6 6"
				>
					<animate
						attributeName="strokeDashoffset"
						values="0;12"
						dur="1.5s"
						repeatCount="indefinite"
					/>
				</line>
				<circle
					cx="100"
					cy="53"
					r="8"
					stroke="rgba(8,196,168,0.3)"
					strokeWidth="2"
					fill="none"
				>
					<animate
						attributeName="r"
						values="8;10;8"
						dur="2s"
						repeatCount="indefinite"
					/>
				</circle>
			</svg>
		);
	}

	return (
		<svg width={size} height={size} viewBox="0 0 200 200" fill="none">
			<circle cx="100" cy="100" r="80" fill="rgba(8,196,168,0.04)" />
			<circle cx="100" cy="100" r="40" fill="rgba(8,196,168,0.08)" />
			<path
				d="M85 100 L95 110 L115 90"
				stroke="rgba(8,196,168,0.4)"
				strokeWidth="4"
				strokeLinecap="round"
				strokeLinejoin="round"
				fill="none"
			/>
		</svg>
	);
}

// Decorative pattern dots for backgrounds
export function PatternDots({ className = "" }) {
	return (
		<svg
			className={`pattern-dots ${className}`}
			width="200"
			height="200"
			viewBox="0 0 200 200"
			fill="none"
			aria-hidden="true"
		>
			{Array.from({ length: 10 }).map((_, row) =>
				Array.from({ length: 10 }).map((_, col) => (
					<circle
						key={`${row}-${col}`}
						cx={10 + col * 20}
						cy={10 + row * 20}
						r="1.5"
						fill="rgba(8, 196, 168, 0.12)"
					/>
				)),
			)}
		</svg>
	);
}

// Brand Logo
export function BrandLogo({ size = 28 }) {
	return (
		<svg width={size} height={size} viewBox="0 0 32 32" fill="none">
			<rect width="32" height="32" rx="8" fill="url(#logoGrad)" />
			<path
				d="M8 20 Q8 12 16 10 Q24 12 24 20"
				stroke="white"
				strokeWidth="2.5"
				strokeLinecap="round"
				fill="none"
			/>
			<circle cx="12" cy="17" r="2" fill="white" opacity="0.9" />
			<circle cx="20" cy="17" r="2" fill="white" opacity="0.9" />
			<circle cx="16" cy="15" r="1.5" fill="rgba(251,191,36,0.9)" />
			<defs>
				<linearGradient id="logoGrad" x1="0" y1="0" x2="32" y2="32">
					<stop offset="0%" stopColor="#08c4a8" />
					<stop offset="100%" stopColor="#039e8a" />
				</linearGradient>
			</defs>
		</svg>
	);
}

export function IconMenuBoard({ size = 20 }) {
	return (
		<svg
			width={size}
			height={size}
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
			<line x1="16" y1="2" x2="16" y2="6" />
			<line x1="8" y1="2" x2="8" y2="6" />
			<line x1="3" y1="10" x2="21" y2="10" />
			<line x1="8" y1="14" x2="16" y2="14" />
			<line x1="8" y1="18" x2="16" y2="18" />
		</svg>
	);
}

export function IconSettings({ size = 20 }) {
	return (
		<svg
			width={size}
			height={size}
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<circle cx="12" cy="12" r="3"></circle>
			<path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
		</svg>
	);
}
