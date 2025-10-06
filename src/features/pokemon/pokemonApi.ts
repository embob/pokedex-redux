import type {
	PokeApiPokemon,
	PokeApiSpecies,
	PokeApiEvolutionChain,
	PokeApiMove,
	PokemonListItem,
	EvolvesFrom,
	Move,
} from "./pokemonTypes";

const BASE_URL = "https://pokeapi.co/api/v2";

// Base API calls - these just fetch raw data
export const fetchPokemonData = async (
	name: string,
): Promise<PokeApiPokemon> => {
	const response = await fetch(`${BASE_URL}/pokemon/${name}`);
	if (!response.ok) throw new Error(`Failed to fetch Pokemon: ${name}`);
	return response.json();
};

export const fetchSpeciesData = async (
	url: string,
): Promise<PokeApiSpecies> => {
	const response = await fetch(url);
	if (!response.ok) throw new Error(`Failed to fetch species data`);
	return response.json();
};

export const fetchEvolutionChainData = async (
	url: string,
): Promise<PokeApiEvolutionChain> => {
	const response = await fetch(url);
	if (!response.ok) throw new Error(`Failed to fetch evolution chain`);
	return response.json();
};

export const fetchMoveData = async (url: string): Promise<PokeApiMove> => {
	const response = await fetch(url);
	if (!response.ok) throw new Error(`Failed to fetch move data`);
	return response.json();
};

export const transformPokemonListItem = (
	data: PokeApiPokemon,
): PokemonListItem => ({
	id: data.id,
	name: data.name,
	image: data.sprites.other["official-artwork"].front_default,
	types: data.types.map((t: { type: { name: string } }) => t.type.name),
});

export const extractBasicPokemonInfo = (data: PokeApiPokemon) => ({
	id: data.id,
	name: data.name,
	image: data.sprites.other["official-artwork"].front_default,
	types: data.types.map((t: { type: { name: string } }) => t.type.name),
	height: data.height * 10, // convert to cm
	weight: data.weight / 10, // convert to kg
	hp: data.stats.find((s) => s.stat.name === "hp")?.base_stat ?? 0,
});

export const extractSpeciesInfo = (speciesData: PokeApiSpecies) => {
	const genus =
		speciesData.genera.find((g) => g.language.name === "en")?.genus ??
		"Unknown";

	const description =
		speciesData.flavor_text_entries
			.find((f) => f.version.name === "firered")
			?.flavor_text.replace(/\n/g, " ") ?? "";

	return { genus, description };
};

export const findEvolutionStage = (
	chain: PokeApiEvolutionChain["chain"],
	targetName: string,
) => {
	let stage = 1;
	let current = chain;

	while (current) {
		if (current.species.name === targetName) {
			return stage;
		}
		// Move to next evolution
		if (current.evolves_to.length > 0) {
			current = current.evolves_to[0];
			stage++;
		} else {
			break;
		}
	}
	return stage;
};

export const fetchEvolutionData = async (
	speciesData: PokeApiSpecies,
): Promise<EvolvesFrom | null> => {
	if (!speciesData.evolves_from_species) {
		return null;
	}

	const evolvesFromName = speciesData.evolves_from_species.name;

	const [evolvesFromPokemon, chainData] = await Promise.all([
		fetchPokemonData(evolvesFromName),
		fetchEvolutionChainData(speciesData.evolution_chain.url),
	]);

	return {
		name: evolvesFromName,
		image: evolvesFromPokemon.sprites.other["official-artwork"].front_default,
		stage: findEvolutionStage(chainData.chain, evolvesFromName),
	};
};

const moveCache = new Map<string, Move>();

const fetchMove = async (
	moveName: string,
	moveUrl: string,
): Promise<Move | null> => {
	try {
		// check cache first
		if (moveCache.has(moveName)) {
			console.log(`✅ Cache hit for move: ${moveName}`);
			const cachedMove = moveCache.get(moveName);
			if (cachedMove) {
				return cachedMove;
			}
		}
		// otherwise fetch from API
		console.log(`🌐 Fetching move from API: ${moveName}`);
		const moveData = await fetchMoveData(moveUrl);

		const flavorTextEntry = moveData.flavor_text_entries.find(
			(entry) =>
				entry.version_group.name === "black-white" &&
				entry.language.name === "en",
		);

		const move: Move = {
			name: moveData.name,
			description: flavorTextEntry
				? flavorTextEntry.flavor_text.replace(/\n/g, " ")
				: "",
			type: moveData.type.name,
		};

		// cache result
		moveCache.set(moveName, move);
		return move;
	} catch (error) {
		console.error(`Failed to fetch move ${moveName}:`, error);
		return null;
	}
};

export const fetchMoves = async (
	moveEntries: Array<{ move: { name: string; url: string } }>,
	count: number = 20,
): Promise<Move[]> => {
	const randomMoves =
		moveEntries.length <= count
			? moveEntries
			: [...moveEntries].sort(() => Math.random() - 0.5).slice(0, count);

	const movePromises = randomMoves.map((entry) =>
		fetchMove(entry.move.name, entry.move.url),
	);

	const moves = await Promise.all(movePromises);
	return moves.filter((move): move is Move => move !== null);
};

export const fetchPokemonList = async (): Promise<PokemonListItem[]> => {
	const response = await fetch(`${BASE_URL}/pokemon?limit151`);
	if (!response.ok) throw new Error("Failed to fetch Pokemon list");
	const data = await response.json();

	// Fetch all pokemon details in parallel
	const pokemonPromises = data.results.map(
		async (pokemon: { name: string; url: string }) => {
			const details = await fetchPokemonData(pokemon.name);
			return transformPokemonListItem(details);
		},
	);

	return Promise.all(pokemonPromises);
};

export const fetchPokemonDetailData = async (name: string) => {
	const pokemonData = await fetchPokemonData(name);

	const basicInfo = extractBasicPokemonInfo(pokemonData);

	const speciesData = await fetchSpeciesData(pokemonData.species.url);
	const speciesInfo = extractSpeciesInfo(speciesData);

	const [evolvesFrom, moves] = await Promise.all([
		fetchEvolutionData(speciesData),
		fetchMoves(pokemonData.moves),
	]);
	return {
		...basicInfo,
		...speciesInfo,
		evolvesFrom,
		moves,
	};
};

// Clear the move cache (useful for testing or memory management)
export const clearMoveCache = () => {
	moveCache.clear();
};
