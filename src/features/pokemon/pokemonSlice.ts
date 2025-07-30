import {
	createAsyncThunk,
	createSlice,
	type PayloadAction,
} from "@reduxjs/toolkit";

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
	// favourites: [],
};

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
	},
});

export default pokemonSlice.reducer;
