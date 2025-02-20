/** @type {import('tailwindcss').Config} */
export default {
	darkMode: ["class"],
	content: [
		"./index.html",
		"./src/**/*.{js,ts,jsx,tsx}",
	],
	theme: {
		extend: {
			fontFamily: {
				'geist': ['Geist', 'serif'],
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			colors: {

				/* Surface & Background Colors */
				"surface-background": "hsl(var(--surface-background))",
				background: "hsl(var(--background))",
				foreground: "hsl(var(--foreground))",

				/* Text Colors */
				"primary": "hsl(var(--text-primary))",
				"secondary": "hsl(var(--text-secondary))",

				/* Brand / Primary Colors */
				"brand-primary": "hsl(var(--brand-primary))",
				"brand-primary-foreground": "hsl(var(--brand-primary-foreground))",

				/* Status Colors */
				"status-danger": "hsl(var(--status-danger))",
				"status-danger-foreground": "hsl(var(--status-danger-foreground))",

				/* Accent / Indigo Shades */
				"accent-indigo": "hsl(var(--accent-indigo))",
				"accent-indigo-foreground": "hsl(var(--accent-indigo-foreground))",
				"accent-indigo-light": "hsl(var(--accent-indigo-light))",
				"accent-indigo-dark": "hsl(var(--accent-indigo-dark))",

				/* Neutral Colors (for dark mode usage) */
				"neutral-white": "hsl(var(--neutral-white))",
				"neutral-black": "hsl(var(--neutral-black))",

				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				// secondary: {
				// 	DEFAULT: 'hsl(var(--secondary))',
				// 	foreground: 'hsl(var(--secondary-foreground))'
				// },
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				boxShadow: {
					'custom-bold': '0 0.46875rem 2.1875rem rgba(90,97,105,.1), 0 0.9375rem 1.40625rem rgba(90,97,105,.1), 0 0.25rem 0.53125rem rgba(90,97,105,.12), 0 0.125rem 0.1875rem rgba(90,97,105,.1)',
					'custom': '0 0.375rem 1.75rem rgba(90,97,105,.03),0 0.75rem 1.125rem rgba(90,97,105,.03),0 0.1875rem 0.40625rem rgba(90,97,105,.1),0 0.0625rem 0.15625rem rgba(90,97,105,.03)',
					'custom-medium': '0 0.375rem 1.75rem rgba(90,97,105,.03),0 0.75rem 1.125rem rgba(90,97,105,.03),0 0.1875rem 0.40625rem rgba(90,97,105,.1),0 0.0625rem 0.15625rem rgba(90,97,105,.03)',
					'custom-blue': '0 2px 6px #82d3f8',
					'custom-green': '0 2px 6px #8edc9c',
					'custom-red': '0 2px 6px #fd9b96',
					'custom-bark': '0 2px 6px #728394',
					'custom-war': '0 2px 6px #ffc473',
					'custom-pri': '0 2px 6px #acb5f6',
					'custom-purpul': '0 2px 8px -3px #7b5295',
					'custom-gray': '0 2px 6px #E9ECEF'
				},
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				chart: {
					'1': 'hsl(var(--chart-1))',
					'2': 'hsl(var(--chart-2))',
					'3': 'hsl(var(--chart-3))',
					'4': 'hsl(var(--chart-4))',
					'5': 'hsl(var(--chart-5))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				}
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
}