import type { AppDispatch, RootState } from "../../app/store";
import { useDispatch, useSelector } from "react-redux";
import { fetchPokemonDetail, fetchPokemonList } from "./pokemonSlice";
import { useEffect } from "react";
import { Pokeball } from "../../assets/icons/Pokeball";

const colors = {
	bug: "#CAE48D",
	dark: "#C3BFCA",
	dragon: "#B0CCED",
	electric: "#FAE9A3",
	fairy: "#F7D0F4",
	fighting: "#F1CAD5",
	fire: "#F5B886",
	flying: "#C8D6EF",
	ghost: "#C8D6EF",
	grass: "#A5D8A0",
	ground: "#EAB294",
	ice: "#B9E6E0",
	normal: "#C8CCD0",
	poison: "#CFADE0",
	psychic: "#F9CBCE",
	rock: "#E2DAC5",
	steel: "#A6BEC9",
	water: "#99C0E7",
};

export const PokemonList = () => {
	const dispatch = useDispatch<AppDispatch>();

	const {
		list,
		status,
		error,
		selectedStatus,
		selectedPokemon,
		selectedError,
	} = useSelector((state: RootState) => state.pokemon);

	useEffect(() => {
		if (status === "idle") {
			dispatch(fetchPokemonList());
		}
	}, [status, dispatch]);

	const handlePokemonClick = (name: string) => {
		dispatch(fetchPokemonDetail(name));
	};

	// (Optional) log when detail finishes, so you can verify it worked
	useEffect(() => {
		if (selectedStatus === "succeeded" && selectedPokemon) {
			console.log("Detail fetched:", selectedPokemon);
		}
		if (selectedStatus === "failed") {
			console.error("Detail fetch failed:", selectedError);
		}
	}, [selectedStatus, selectedPokemon, selectedError]);

	if (status === "loading") return <p>Loading Pokemon</p>;
	if (status === "failed") return <p>Error: {error}</p>;

	const formatPokemonId = (id: number) => {
		return id.toString().padStart(4, "0");
	};

	const getCardBackground = (types: string[]) => {
		if (types.length === 0) return { backgroundColor: colors.normal };
		if (types.length > 1) {
			const color1 = colors[types[0] as keyof typeof colors];
			const color2 = colors[types[1] as keyof typeof colors];
			return {
				background: `linear-gradient(to bottom, ${color1}, ${color2})`,
			};
		}
		return { backgroundColor: colors[types[0] as keyof typeof colors] };
	};

	return (
		<section className="container mx-auto w-4/5">
			<div className="grid grid-cols-[repeat(auto-fill,240px)] justify-center gap-10">
				{list.map((pokemon) => {
					return (
						<button
							type="button"
							tabIndex={0}
							key={pokemon.name}
							className="h-[240px] rounded-lg pt-[20px] flex flex-col cursor-pointer group transition-all duration-150 ease-in-out active:scale-95 active:shadow-inner relative overflow-hidden"
							style={getCardBackground(pokemon.types)}
							onClick={() => handlePokemonClick(pokemon.name)}
						>
							<div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-15 transition-all duration-300 ease-in-out rounded-lg pointer-events-none" />

							<div className="h-[calc(100%-40px)] flex items-center justify-center overflow-hidden relative z-10">
								<img
									src={pokemon.image}
									alt={pokemon.name}
									className="max-w-full max-h-full object-contain"
								/>
							</div>
							<div className="h-[40px] flex items-center gap-2 justify-center flex-shrink-0 flex-shrink-0 relative z-10">
								<span className="flex items-center gap-1 text-md">
									<Pokeball size={16} /> {formatPokemonId(pokemon.id)}
								</span>
								<h3 className="text-lg font-semibold">
									{pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}
								</h3>
							</div>
						</button>
					);
				})}
			</div>
		</section>
	);
};
