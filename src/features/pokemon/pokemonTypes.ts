export interface Pokemon {
	id: number;
	name: string;
	image: string;
	types: string[];
}

export interface PokemonState {
	list: Pokemon[];
	status: "idle" | "loading" | "succeeded" | "failed";
	error: string | null;
	selectedPokemon: PokemonDetail | null;
	selectedStatus: "idle" | "loading" | "succeeded" | "failed";
	selectedError: string | null;
	// favourites: string[];
}

export interface PokemonListItem {
	id: number;
	name: string;
	image: string;
	types: string[];
}

export interface EvolvesFrom {
	name: string;
	image: string;
	stage: number;
}

export interface Move {
	name: string;
	description: string;
	type: string;
}

export interface PokemonDetail {
	id: number;
	name: string;
	image: string;
	types: string[];
	height: number;
	weight: number;
	hp: number;
	description: string;
	genus: string;
	evolvesFrom: EvolvesFrom;
	moves?: Move[];
	damageRelationMultipliers?: {
		weakTo: string[];
		resistantTo: string[];
		immuneTo: string[];
	};
}

// API Response types (what PokeAPI actually returns)
export interface PokeApiPokemon {
	id: number;
	name: string;
	sprites: {
		other: {
			"official-artwork": {
				front_default: string;
			};
		};
	};
	types: Array<{
		type: {
			name: string;
		};
	}>;
	height: number;
	weight: number;
	stats: Array<{
		base_stat: number;
		stat: {
			name: string;
		};
	}>;
	moves: Array<{
		move: {
			name: string;
			url: string;
		};
	}>;
	species: {
		url: string;
	};
}

export interface PokeApiSpecies {
	genera: Array<{
		genus: string;
		language: {
			name: string;
		};
	}>;
	flavor_text_entries: Array<{
		flavor_text: string;
		version: {
			name: string;
		};
	}>;
	evolves_from_species: {
		name: string;
	} | null;
	evolution_chain: {
		url: string;
	};
}

export interface PokeApiEvolutionChain {
	chain: {
		species: {
			name: string;
		};
		evolves_to: Array<{
			species: {
				name: string;
			};
			evolves_to: Array<any>; // We'll fix this later
		}>;
	};
}

export interface PokeApiMove {
	name: string;
	type: {
		name: string;
	};
	flavor_text_entries: Array<{
		flavor_text: string;
		version_group: {
			name: string;
		};
		language: {
			name: string;
		};
	}>;
}
