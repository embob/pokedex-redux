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
	resistantTo.sort((a, b) => b.multiplier - a.multiplier); // 0.5× before 0.25×

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
