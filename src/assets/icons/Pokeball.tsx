import type { SVGProps } from "react";

interface PokeballProps extends SVGProps<SVGSVGElement> {
	size?: number;
	color?: string;
}

export function Pokeball({
	size = 24,
	color = "currentColor",
	...props
}: PokeballProps) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 24 24"
			width={size}
			height={size}
			fill="none"
			stroke={color}
			strokeWidth="2.5"
			aria-labelledby="pokeballTitle"
			role="img"
			{...props}
		>
			<title id="pokeballTitle">Pokeball Icon</title>
			<circle cx="12" cy="12" r="10" />
			<circle cx="12" cy="12" r="3.5" />
			<path d="M2 12h7" />
			<path d="M15 12h7" />
		</svg>
	);
}
