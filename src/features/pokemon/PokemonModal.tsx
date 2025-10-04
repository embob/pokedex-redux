/** biome-ignore-all lint/a11y/noStaticElementInteractions: <explanation> */
/** biome-ignore-all lint/a11y/useKeyWithClickEvents: <explanation> */
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../../app/store";
import { clearSelectedPokemon, type PokemonDetail } from "./pokemonSlice";
import { PokemonCard, PokemonCardLoading } from "./PokemonCard";

interface PokemonModalProps {
	pokemon: PokemonDetail | null;
}

export const PokemonModal = ({ pokemon }: PokemonModalProps) => {
	const dispatch = useDispatch<AppDispatch>();

	const handleClose = () => {
		dispatch(clearSelectedPokemon());
	};

	return (
		<div
			className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4"
			onClick={handleClose}
		>
			{/* Wrapper with relative positioning - same for both states */}
			<div className="relative" onClick={(e) => e.stopPropagation()}>
				{/* Close button - always positioned the same way */}
				<button
					type="button"
					onClick={handleClose}
					className="absolute -top-10 -right-10 text-white hover:text-gray-300 bg-gray-800 hover:bg-gray-700 rounded-full w-10 h-10 flex items-center justify-center transition-all z-10 cursor-pointer"
					aria-label="Close modal"
				>
					✕
				</button>

				{!pokemon ? <PokemonCardLoading /> : <PokemonCard pokemon={pokemon} />}
			</div>
		</div>
	);
};
