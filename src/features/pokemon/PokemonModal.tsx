import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../app/store";
import {
	clearSelectedPokemon,
	navigateToNextPokemon,
	navigateToPreviousPokemon,
} from "./pokemonSlice";
import { PokemonCard, PokemonCardLoading } from "./PokemonCard";
import { useEffect, useRef } from "react";
import type { PokemonDetail } from "./pokemonTypes";

interface PokemonModalProps {
	pokemon: PokemonDetail | null;
}

export const PokemonModal = ({ pokemon }: PokemonModalProps) => {
	const dispatch = useDispatch<AppDispatch>();

	const { list, selectedStatus } = useSelector(
		(state: RootState) => state.pokemon,
	);

	// add a ref to access the DOM element
	const dialogRef = useRef<HTMLDialogElement>(null);

	const canNavigatePrevious =
		pokemon &&
		list.length > 0 &&
		list.findIndex((p) => p.name === pokemon.name) > 0;

	const canNavigateNext =
		pokemon &&
		list.length > 0 &&
		list.findIndex((p) => p.name === pokemon.name) < list.length - 1;

	// for keyboard navigation
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "ArrowLeft" && canNavigatePrevious) {
				dispatch(navigateToPreviousPokemon());
			} else if (e.key === "ArrowRight" && canNavigateNext) {
				dispatch(navigateToNextPokemon());
			} else if (e.key === "Escape") {
				dispatch(clearSelectedPokemon());
			}
		};

		document.addEventListener("keydown", handleKeyDown);
		return () => document.removeEventListener("keydown", handleKeyDown);
	}, [canNavigatePrevious, canNavigateNext, dispatch]);

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
					className="absolute -top-8 -right-8 text-white hover:text-gray-300 bg-gray-800 hover:bg-gray-700 rounded-full w-10 h-10 flex items-center justify-center transition-all z-50 cursor-pointer"
					aria-label="Close modal"
				>
					✕
				</button>

				{canNavigatePrevious && (
					<button
						type="button"
						onClick={() => dispatch(navigateToPreviousPokemon())}
						disabled={selectedStatus === "loading"}
						className="absolute -left-16 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 bg-gray-800 hover:bg-gray-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-full w-12 h-12 flex items-center justify-center transition-all z-50 cursor-pointer"
						aria-label="Previous Pokemon"
					>
						←
					</button>
				)}

				{canNavigateNext && (
					<button
						type="button"
						onClick={() => dispatch(navigateToNextPokemon())}
						disabled={selectedStatus === "loading"}
						className="absolute -right-16 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 bg-gray-800 hover:bg-gray-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-full w-12 h-12 flex items-center justify-center transition-all z-50 cursor-pointer"
						aria-label="Next Pokemon"
					>
						→
					</button>
				)}

				{!pokemon ? <PokemonCardLoading /> : <PokemonCard pokemon={pokemon} />}
			</div>
		</dialog>
	);
};
