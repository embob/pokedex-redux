import type { AppDispatch, RootState } from "../../app/store";
import { useDispatch, useSelector } from "react-redux";
import { fetchPokemonList } from "./pokemonSlice";
import { useEffect } from "react";

export const PokemonList = () => {
	const dispatch = useDispatch<AppDispatch>();

	const { list, status, error } = useSelector(
		(state: RootState) => state.pokemon,
	);

	useEffect(() => {
		if (status === "idle") {
			dispatch(fetchPokemonList());
		}
	}, [status, dispatch]);

	if (status === "loading") return <p>Loading Pokemon</p>;
	if (status === "failed") return <p>Error: {error}</p>;

	return (
		<section>
			<h2>Pokedex 151</h2>
			{list.map((pokemon) => (
				<h3 key={pokemon.name}>{pokemon.name}</h3>
			))}
		</section>
	);
};
