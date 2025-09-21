import {
	createAsyncThunk,
	createSlice,
	type PayloadAction,
} from "@reduxjs/toolkit";
import {
	calculateDamageRelations,
	type DamageRelations,
} from "../../shared/utils/pokemonUtils";

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
}

// interface DamageRelationBucket {
// 	noDamageFrom: { name: string; url: string }[];
// 	halfDamageFrom: { name: string; url: string }[];
// 	doubleDamageFrom: { name: string; url: string }[];
// }
interface PokemonDetail {
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
	moves?: string[];
	damageRelations?: DamageRelations;
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
				}
			: null;

		// to get damage relations we need to get all the types
		// for each type we then get the damage relation names - no_damage_from, half_damage_from, double_damage_from
		// merge all the damage relations into one object and return the object

		const damageRelationsPerType: DamageRelations[] = await Promise.all(
			types.map(async (type: string) => {
				const typeResponse = await fetch(
					`https://pokeapi.co/api/v2/type/${type}`,
				);
				const { damage_relations } = await typeResponse.json();

				const extractNames = (types: { name: string; url: string }[]) => {
					return types.map((type) => type.name);
				};

				return {
					noDamageFrom: extractNames(damage_relations.no_damage_from),
					halfDamageFrom: extractNames(damage_relations.half_damage_from),
					doubleDamageFrom: extractNames(damage_relations.double_damage_from),
				};
			}),
		);

		const damageRelations = calculateDamageRelations(damageRelationsPerType);
		console.log("🚀 , damageRelations:", damageRelations);

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
			damageRelations,
		} as PokemonDetail;
	},
);

const pokemonSlice = createSlice({
	name: "pokemon",
	initialState,
	reducers: {},
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

export default pokemonSlice.reducer;
