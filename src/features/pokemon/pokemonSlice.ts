import {
	createAsyncThunk,
	createSlice,
	type PayloadAction,
} from "@reduxjs/toolkit";
import {
	calculateDamageRelations,
	fetchDamageRelationsForTypes,
} from "../../shared/utils/pokemonUtils";
import type {
	PokemonDetail,
	PokemonListItem,
	PokemonState,
} from "./pokemonTypes";

import * as pokemonApi from "./pokemonApi";

const initialState: PokemonState = {
	list: [],
	status: "idle",
	error: null,
	selectedPokemon: null,
	selectedStatus: "idle",
	selectedError: null,
	// favourites: [],
};

// Thunks

// Fetch the top 151 pokemon
export const fetchPokemonList = createAsyncThunk(
	"pokemon/fetchPokemonList",
	async () => {
		return await pokemonApi.fetchPokemonList();
	},
);

export const fetchPokemonDetail = createAsyncThunk(
	"pokemon/fetchPokemonDetail",
	async (name: string) => {
		const pokemonData = await pokemonApi.fetchPokemonDetailData(name);
		const damageRelationsPerType = await fetchDamageRelationsForTypes(
			pokemonData.types,
		);
		const damageRelationMultipliers = calculateDamageRelations(
			damageRelationsPerType,
		);

		return {
			...pokemonData,
			damageRelationMultipliers,
		} as PokemonDetail;
	},
);

export const navigateToNextPokemon = createAsyncThunk(
	"pokemon/navigateToNextPokemon",
	async (_, { getState }) => {
		// getState() gives us access to the current Redux state
		const state = getState() as { pokemon: PokemonState };
		const { selectedPokemon, list } = state.pokemon;

		// Safety checks
		if (!selectedPokemon || list.length === 0) {
			throw new Error("No Pokemon selected or list is empty");
		}

		// Find current Pokemon's position in the list
		const currentIndex = list.findIndex(
			(pokemon) => pokemon.name === selectedPokemon.name,
		);

		// Check if we can go to next Pokemon
		if (currentIndex === -1 || currentIndex >= list.length - 1) {
			throw new Error("No next Pokemon available");
		}

		// Get the next Pokemon from the list
		const nextPokemon = list[currentIndex + 1];

		// Fetch full details for the next Pokemon (same as fetchPokemonDetail)
		const pokemonData = await pokemonApi.fetchPokemonDetailData(
			nextPokemon.name,
		);
		const damageRelationsPerType = await fetchDamageRelationsForTypes(
			pokemonData.types,
		);
		const damageRelationMultipliers = calculateDamageRelations(
			damageRelationsPerType,
		);

		return {
			...pokemonData,
			damageRelationMultipliers,
		} as PokemonDetail;
	},
);

export const navigateToPreviousPokemon = createAsyncThunk(
	"pokemon/navigateToPreviousPokemon",
	async (_, { getState }) => {
		// getState() gives us access to the current Redux state
		const state = getState() as { pokemon: PokemonState };
		const { selectedPokemon, list } = state.pokemon;

		// Safety checks
		if (!selectedPokemon || list.length === 0) {
			throw new Error("No Pokemon selected or list is empty");
		}

		// Find current Pokemon's position in the list
		const currentIndex = list.findIndex(
			(pokemon) => pokemon.name === selectedPokemon.name,
		);

		// Check if we can go to previous Pokemon
		if (currentIndex <= 0) {
			throw new Error("No previous Pokemon available");
		}

		// Get the previous Pokemon from the list
		const previousPokemon = list[currentIndex - 1];

		// Fetch full details for the next Pokemon (same as fetchPokemonDetail)
		const pokemonData = await pokemonApi.fetchPokemonDetailData(
			previousPokemon.name,
		);
		const damageRelationsPerType = await fetchDamageRelationsForTypes(
			pokemonData.types,
		);
		const damageRelationMultipliers = calculateDamageRelations(
			damageRelationsPerType,
		);

		return {
			...pokemonData,
			damageRelationMultipliers,
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
		builder.addCase(navigateToNextPokemon.pending, (state) => {
			state.selectedStatus = "loading";
			state.selectedError = null;
		});
		builder.addCase(
			navigateToNextPokemon.fulfilled,
			(state, action: PayloadAction<PokemonDetail>) => {
				state.selectedStatus = "succeeded";
				state.selectedPokemon = action.payload;
			},
		);
		builder.addCase(navigateToNextPokemon.rejected, (state, action) => {
			state.selectedStatus = "failed";
			state.selectedError =
				action.error.message ?? "Failed to navigate to next Pokemon";
		});
		builder.addCase(navigateToPreviousPokemon.pending, (state) => {
			state.selectedStatus = "loading";
			state.selectedError = null;
		});
		builder.addCase(
			navigateToPreviousPokemon.fulfilled,
			(state, action: PayloadAction<PokemonDetail>) => {
				state.selectedStatus = "succeeded";
				state.selectedPokemon = action.payload;
			},
		);
		builder.addCase(navigateToPreviousPokemon.rejected, (state, action) => {
			state.selectedStatus = "failed";
			state.selectedError =
				action.error.message ?? "Failed to navigate to previous Pokemon";
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
