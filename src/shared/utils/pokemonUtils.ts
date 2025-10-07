export const getBackgroundType = (types: string[], name: string): string => {
	// fallback to normal
	if (!types || types.length === 0) return "normal";

	if (
		name === "dratini" ||
		name === "dragonair" ||
		name === "kabuto" ||
		name === "omanyte" ||
		name === "omastar" ||
		name === "cloyster"
	)
		return "water";

	if (
		name === "slowpoke" ||
		name === "slowbro" ||
		name === "lapras" ||
		name === "psyduck" ||
		name === "golduck" ||
		name === "blastoise"
	)
		return "waterSand";

	if (name === "machop" || name === "machoke" || name === "machamp") {
		return "rock";
	}

	if (name === "dragonite" || name === "tauros" || name === "kangaskhan") {
		return "ground";
	}

	if (name === "moltres" || name === "aerodactyl" || name === "fearow") {
		return "flying";
	}

	if (name === "hitmonlee" || name === "hitmonchan") {
		return "city";
	}

	if (name === "primeape" || name === "mankey") {
		return "forest";
	}

	if (types.length === 1) return types[0];
	const typeCombination = `${types[0]}-${types[1]}`;

	const dualTypeRules: Record<string, string> = {
		"poison-ground": "ground",
		"normal-fairy": "fairy",
		"water-ice": "ice",
		"electric-steel": "steel",
		"grass-poison": "poison",
	};

	if (dualTypeRules[typeCombination]) {
		return dualTypeRules[typeCombination];
	}

	return types[0];
};

export const capitaliseWord = (word: string): string => {
	return word.charAt(0).toUpperCase() + word.slice(1);
};

export const capitaliseWords = (sentence: string): string => {
	return sentence
		.split(/[-\s]+/)
		.map(capitaliseWord)
		.join(" ");
};

export const normalizeDescription = (description: string): string => {
	return (
		description
			// Replace POKéMON (in any case variation) with proper Pokémon
			.replace(/POK[ÉEée]MON/gi, "Pokémon")
			// Convert all-caps words (likely Pokemon names) to title case
			// Matches words that are 3+ characters and all uppercase
			.replace(
				/\b[A-Z]{3,}\b/g,
				(match) => match.charAt(0).toUpperCase() + match.slice(1).toLowerCase(),
			)
	);
};

export const getRandomItems = <T>(array: T[], count: number): T[] => {
	if (!array || array.length === 0) return [];
	if (array.length <= count) return [...array];

	const shuffled = [...array].sort(() => Math.random() - 0.5);
	return shuffled.slice(0, count);
};
export interface DamageRelations {
	noDamageFrom: string[];
	halfDamageFrom: string[];
	doubleDamageFrom: string[];
}

const damageRelationsCache = new Map<string, DamageRelations>();

export const fetchDamageRelationsForType = async (
	type: string,
): Promise<DamageRelations> => {
	const cached = damageRelationsCache.get(type);
	if (cached) {
		return cached;
	}

	const response = await fetch(`https://pokeapi.co/api/v2/type/${type}`);
	const { damage_relations } = await response.json();

	const extractNames = (types: { name: string; url: string }[]) => {
		return types.map((type) => type.name);
	};

	const damageRelations = {
		noDamageFrom: extractNames(damage_relations.no_damage_from),
		halfDamageFrom: extractNames(damage_relations.half_damage_from),
		doubleDamageFrom: extractNames(damage_relations.double_damage_from),
	};

	damageRelationsCache.set(type, damageRelations);

	// Cache the result
	damageRelationsCache.set(type, damageRelations);

	return damageRelations;
};

export const fetchDamageRelationsForTypes = (types: string[]) => {
	return Promise.all(
		types.map(async (type: string) => {
			return fetchDamageRelationsForType(type);
		}),
	);
};

export const collectAllDamageTypes = (damageRelations: DamageRelations[]) => {
	return new Set([
		...damageRelations.flatMap((relation) => relation.noDamageFrom),
		...damageRelations.flatMap((relation) => relation.halfDamageFrom),
		...damageRelations.flatMap((relation) => relation.doubleDamageFrom),
	]);
};

export const calculateDamageMultipliers = (
	damageRelations: DamageRelations[],
) => {
	const candidates = collectAllDamageTypes(damageRelations);

	const weakTo: { type: string; multiplier: number }[] = [];
	const resistantTo: { type: string; multiplier: number }[] = [];
	const immuneTo: { type: string; multiplier: number }[] = [];

	for (const pokemonType of candidates) {
		let multiplier = 1;
		for (const relation of damageRelations) {
			if (relation.noDamageFrom.includes(pokemonType)) {
				multiplier = 0;
				break;
			}
			if (relation.halfDamageFrom.includes(pokemonType)) {
				multiplier = multiplier * 0.5;
			}
			if (relation.doubleDamageFrom.includes(pokemonType)) {
				multiplier = multiplier * 2;
			}
		}

		if (multiplier === 0) {
			immuneTo.push({ type: pokemonType, multiplier });
		} else if (multiplier < 1) {
			resistantTo.push({ type: pokemonType, multiplier });
		} else if (multiplier > 1) {
			weakTo.push({ type: pokemonType, multiplier });
		}
	}

	weakTo.sort((a, b) => b.multiplier - a.multiplier); // 4× before 2×
	resistantTo.sort((a, b) => a.multiplier - b.multiplier); // most resistant first 0.25× before 0.5×

	return {
		weakTo,
		resistantTo,
		immuneTo,
	};
};

export const calculateDamageRelations = (
	damageRelations: DamageRelations[],
) => {
	const { weakTo, resistantTo, immuneTo } =
		calculateDamageMultipliers(damageRelations);

	const sortAndExtractNames = (arr: { type: string; multiplier: number }[]) => {
		return arr
			.sort((a, b) => b.multiplier - a.multiplier)
			.map((item) => item.type);
	};

	return {
		weakTo: sortAndExtractNames(weakTo),
		resistantTo: sortAndExtractNames(resistantTo),
		immuneTo: immuneTo.map((item) => item.type),
	};
};
