import {
	createAsyncThunk,
	createSlice,
	type PayloadAction,
} from "@reduxjs/toolkit";
import {
	calculateDamageRelations,
	fetchDamageRelationsForTypes,
	getRandomItems,
} from "../../shared/utils/pokemonUtils";

const moveCache = new Map<string, Move>();

interface Pokemon {
	id: number;
	name: string;
	image: string;
	types: string[];
}

interface PokemonState {
	list: Pokemon[];
	status: "idle" | "loading" | "succeeded" | "failed";
	error: string | null;
	selectedPokemon: PokemonDetail | null;
	selectedStatus: "idle" | "loading" | "succeeded" | "failed";
	selectedError: string | null;
	// favourites: string[];
}

interface PokemonListItem {
	id: number;
	name: string;
	image: string;
	types: string[];
}

const initialState: PokemonState = {
	list: [],
	status: "idle",
	error: null,
	selectedPokemon: null,
	selectedStatus: "idle",
	selectedError: null,
	// favourites: [],
};

interface EvolvesFrom {
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

// Thunks

// Fetch the top 151 pokemon
export const fetchPokemonList = createAsyncThunk(
	"pokemon/fetchPokemonList",
	async () => {
		const response = await fetch("https://pokeapi.co/api/v2/pokemon?limit=151");
		const data = await response.json();

		const pokemonDetails = await Promise.all(
			data.results.map(async (pokemon: { name: string; url: string }) => {
				const res = await fetch(pokemon.url);
				const details = await res.json();

				return {
					id: details.id,
					name: details.name,
					image: details.sprites.other["official-artwork"].front_default,
					types: details.types.map(
						(t: { type: { name: string } }) => t.type.name,
					),
				};
			}),
		);
		return pokemonDetails as PokemonListItem[];
	},
);

export const fetchPokemonDetail = createAsyncThunk(
	"pokemon/fetchPokemonDetail",
	async (name: string) => {
		const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);
		const data = await response.json();
		console.log("🚀 , data:", data);

		const image = data.sprites.other["official-artwork"].front_default;

		const types = data.types.map(
			(t: { type: { name: string } }) => t.type.name,
		);

		// to get genus, we need to get the species
		const species = await fetch(data.species.url);
		const speciesData = await species.json();
		const genus = speciesData.genera.find(
			(g: { language: { name: string } }) => g.language.name === "en",
		).genus;

		const description = speciesData.flavor_text_entries
			.find((f: { version: { name: string } }) => f.version.name === "firered")
			.flavor_text.replace(/\n/g, " ");

		const height = data.height * 10; // convert to cm
		const weight = data.weight / 10; // convert to kg

		const hp = data.stats.find(
			(s: { stat: { name: string } }) => s.stat.name === "hp",
		).base_stat;

		const evolvesFrom = speciesData.evolves_from_species
			? {
					name: speciesData.evolves_from_species.name,
					image: await (async () => {
						const evolvesFromPokemonResponse = await fetch(
							`https://pokeapi.co/api/v2/pokemon/${speciesData.evolves_from_species.name}`,
						);
						const evolvesFromPokemonData =
							await evolvesFromPokemonResponse.json();
						return evolvesFromPokemonData.sprites.other["official-artwork"]
							.front_default;
					})(),
					stage: await (async () => {
						// Fetch the evolution chain
						const chainResponse = await fetch(speciesData.evolution_chain.url);
						const chainData = await chainResponse.json();

						// Traverse the chain to count the stage
						let stage = 1;
						let current = chainData.chain;

						while (current) {
							if (
								current.species.name === speciesData.evolves_from_species.name
							) {
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
					})(),
				}
			: null;

		const damageRelationsPerType = await fetchDamageRelationsForTypes(types);
		const damageRelationMultipliers = calculateDamageRelations(
			damageRelationsPerType,
		);

		const randomMoveNames: { move: { name: string; url: string } }[] =
			getRandomItems(data.moves, 20);
		console.log("🚀 , randomMoveNames:", randomMoveNames);
		// Fetch moves data
		const moves: Move[] = await Promise.all(
			randomMoveNames.map(
				async (moveEntry: { move: { name: string; url: string } }) => {
					try {
						const moveName = moveEntry.move.name;

						// Check cache first
						if (moveCache.has(moveName)) {
							console.log(`✅ Cache hit for move: ${moveName}`);
							const cachedMove = moveCache.get(moveName);
							if (cachedMove) {
								return cachedMove;
							}
						}

						// not in cache - fetch from API
						console.log(`🌐 Fetching move from API: ${moveName}`);
						const moveResponse = await fetch(moveEntry.move.url);
						const moveData = await moveResponse.json();

						// Get the flavor text for black-white version in English
						const flavorTextEntry = moveData.flavor_text_entries.find(
							(entry: {
								version_group: { name: string };
								language: { name: string };
							}) =>
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

						moveCache.set(moveName, move);
						return move;
					} catch (error) {
						console.error(`Failed to fetch move data:`, error);
						return null;
					}
				},
			),
		).then((moves) => moves.filter((move): move is Move => move !== null));

		return {
			id: data.id,
			name: data.name,
			image,
			types,
			height,
			weight,
			genus,
			hp,
			description,
			evolvesFrom,
			damageRelationMultipliers,
			moves,
		} as PokemonDetail;
	},
);

const pokemonSlice = createSlice({
	name: "pokemon",
	initialState,
	// handle simple immediate state changes - synchronous actions
	reducers: {
		clearSelectedPokemon: (state) => {
			state.selectedPokemon = null;
			state.selectedStatus = "idle";
			state.selectedError = null;
		},
	},
	// handle async actions (api calls outside of the reducer that take time)
	extraReducers: (builder) => {
		builder.addCase(fetchPokemonList.pending, (state) => {
			state.status = "loading";
			state.error = null;
		});
		builder.addCase(
			fetchPokemonList.fulfilled,
			(state, action: PayloadAction<PokemonListItem[]>) => {
				state.status = "succeeded";
				state.list = action.payload;
			},
		);
		builder.addCase(fetchPokemonList.rejected, (state, action) => {
			state.status = "failed";
			state.error = action.error.message ?? "Failed to load Pokemon";
		});
		builder.addCase(fetchPokemonDetail.pending, (state) => {
			state.selectedStatus = "loading";
			state.selectedError = null;
		});
		builder.addCase(
			fetchPokemonDetail.fulfilled,
			(state, action: PayloadAction<PokemonDetail>) => {
				state.selectedStatus = "succeeded";
				state.selectedPokemon = action.payload;
			},
		);
		builder.addCase(fetchPokemonDetail.rejected, (state, action) => {
			state.selectedStatus = "failed";
			state.selectedError =
				action.error.message ?? "Failed to load Pokemon details";
		});
	},
});

// Export the action so components can dispatch it
export const { clearSelectedPokemon } = pokemonSlice.actions;
export default pokemonSlice.reducer;

/**
 *
 * // 1. You export the ACTION CREATOR
export const { clearSelectedPokemon } = pokemonSlice.actions;

// 2. Component calls the ACTION CREATOR
dispatch(clearSelectedPokemon());

// 3. This CREATES an ACTION OBJECT
{
	type: "pokemon/clearSelectedPokemon"
}

// 4. Redux sends this action to the REDUCER
// The reducer function you wrote runs:
clearSelectedPokemon: (state) => {
	state.selectedPokemon = null;
}

// 5. State is updated!
 */
