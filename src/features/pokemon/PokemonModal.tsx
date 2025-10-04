import { useDispatch } from "react-redux";
import type { AppDispatch } from "../../app/store";
import { clearSelectedPokemon, type PokemonDetail } from "./pokemonSlice";
import { PokemonCard, PokemonCardLoading } from "./PokemonCard";
import { useEffect, useRef } from "react";

interface PokemonModalProps {
	pokemon: PokemonDetail | null;
}

export const PokemonModal = ({ pokemon }: PokemonModalProps) => {
	const dispatch = useDispatch<AppDispatch>();

	// add a ref to access the DOM element
	const dialogRef = useRef<HTMLDialogElement>(null);

	useEffect(() => {
		const dialog = dialogRef.current;
		if (!dialog) return;

		const handleClose = () => {
			dispatch(clearSelectedPokemon());
		};

		dialog.showModal();
		document.body.style.overflow = "hidden";

		const handleCancel = (e: Event) => {
			e.preventDefault();
			handleClose();
		};

		const handleClick = (e: MouseEvent) => {
			if (e.target === dialog) {
				handleClose();
			}
		};

		dialog.addEventListener("click", handleClick);
		dialog.addEventListener("cancel", handleCancel);

		return () => {
			dialog.removeEventListener("click", handleClick);
			dialog.removeEventListener("cancel", handleCancel);
			// Close dialog and restore scroll on unmount
			dialog.close();
			document.body.style.overflow = "auto";
		};
	}, [dispatch]);

	return (
		<dialog
			ref={dialogRef}
			className="backdrop:bg-black/70 backdrop:animate-in backdrop:fade-in-0 bg-transparent p-0 max-w-none max-h-none border-0 overflow-visible fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-in fade-in-0 zoom-in-95 duration-200"
		>
			<div className="relative p-4">
				<button
					type="button"
					onClick={() => dispatch(clearSelectedPokemon())}
					className="absolute top-7 right-7 text-white hover:text-gray-300 bg-gray-800 hover:bg-gray-700 rounded-full w-10 h-10 flex items-center justify-center transition-all z-10 cursor-pointer"
					aria-label="Close modal"
				>
					✕
				</button>

				{!pokemon ? <PokemonCardLoading /> : <PokemonCard pokemon={pokemon} />}
			</div>
		</dialog>
	);
};
