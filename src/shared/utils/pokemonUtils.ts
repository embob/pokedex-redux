export interface DamageRelations {
	noDamageFrom: string[];
	halfDamageFrom: string[];
	doubleDamageFrom: string[];
}

interface DamageFromTypes {
	weakTo: string[];
	resistantTo: string[];
	immuneTo: string[];
}

export const calculateDamageRelations = (
	damageRelationsPerType: DamageRelations[],
): DamageRelations => {
	// Merge (keeping duplicates)
	const no: string[] = [];
	const half: string[] = [];
	const dbl: string[] = [];

	for (const bucket of damageRelationsPerType) {
		for (const type of bucket.noDamageFrom) no.push(type);
		for (const type of bucket.halfDamageFrom) half.push(type);
		for (const type of bucket.doubleDamageFrom) dbl.push(type);
	}

	const damageRelations = {
		noDamageFrom: no,
		halfDamageFrom: half,
		doubleDamageFrom: dbl,
	};

	// Additional calculations for multi-type Pokemon
	if (damageRelationsPerType.length > 1) {
		console.log(
			`Multi-type Pokemon detected with ${damageRelationsPerType.length} types`,
		);

		// Check for conflicting damage relationships
		const allTypes = [...no, ...half, ...dbl];
		const uniqueTypes = [...new Set(allTypes)];

		for (const type of uniqueTypes) {
			const categories = [];
			if (no.includes(type)) categories.push("noDamageFrom");
			if (half.includes(type)) categories.push("halfDamageFrom");
			if (dbl.includes(type)) categories.push("doubleDamageFrom");

			if (categories.length > 1) {
				console.log(`${type} is in more than one category`);
			}
		}
	}

	return damageRelations;
};

// const calculateTypeMultipliers = () => {}; // const calculateDamageWithMultipliers = (
// // 	damageRelations: DamageRelations[],
// // ):  => {};
