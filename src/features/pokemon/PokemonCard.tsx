import { backgroundImages, colors, typeIcons } from "./pokemonConstants";
import type { PokemonDetail } from "./pokemonSlice";
import {
	capitaliseWord,
	capitaliseWords,
	getRandomItems,
	normalizeDescription,
} from "../../shared/utils/pokemonUtils";
import { useMemo } from "react";

interface PokemonCardProps {
	pokemon: PokemonDetail;
}

export const PokemonCard = ({ pokemon }: PokemonCardProps) => {
	const backgroundColor = colors[pokemon.types[0] as keyof typeof colors];
	const backgroundImage =
		backgroundImages[pokemon.types[0] as keyof typeof backgroundImages];
	const TypeIcon = typeIcons[pokemon.types[0] as keyof typeof typeIcons];

	const height =
		pokemon.height > 99 ? `${pokemon.height / 100}m` : `${pokemon.height}cm`;
	const subtitle = `${capitaliseWord(pokemon.genus)}. Height: ${height}, Weight: ${pokemon.weight}kg.`;

	const moves = useMemo(() => {
		return getRandomItems(pokemon.moves || [], 2);
	}, [pokemon.moves]);

	const renderDamageRelation = (types: string[] | undefined, label: string) => {
		if (!types || types.length === 0) return null;

		return (
			<div className="flex flex-col items-center gap-[1px]">
				<p className="font-['Cabin'] text-[16px] font-bold leading-none">
					{label}
				</p>
				<div className="flex items-center gap-[3px] justify-center">
					{types.map((type) => {
						const TypeIcon = typeIcons[type as keyof typeof typeIcons];
						return (
							<div className="relative rounded-full" key={type}>
								<TypeIcon className="w-8 h-8" />
								<div
									className="absolute inset-0 rounded-full pointer-events-none"
									style={{
										background:
											"linear-gradient(180deg, rgba(255, 255, 255, 0.4) 0%, transparent 50%, rgba(0, 0, 0, 0.2) 100%)",
									}}
								/>
							</div>
						);
					})}
				</div>
			</div>
		);
	};

	return (
		<div
			className={`rounded-2xl w-[550px] h-[765px] shadow-2xl flex flex-col overflow-hidden`}
			style={{
				backgroundColor,
			}}
		>
			<div className="relative border-26 border-[#f5d203] h-full flex flex-col">
				{pokemon.evolvesFrom && (
					<div
						className="absolute top-[8px] left-[8px] flex flex-col items-center w-[78px]"
						style={{
							background:
								"linear-gradient(135deg, #fdf5c8 0%, #f9e89f 25%, #f5d203 50%, #daa520 75%, #c9a020 100%)",
							boxShadow:
								"2px 2px 4px rgba(0, 0, 0, 0.3), inset 1px 1px 2px rgba(255, 255, 255, 0.5)",
						}}
					>
						<div className="font-['Cabin'] font-bold uppercase text-[12px] leading-tight text-center px-3 py-[1px]">
							Stage {pokemon.evolvesFrom.stage}
						</div>

						<div
							className="flex items-center justify-center mx-[4px] mb-[4px]"
							style={{
								background:
									"linear-gradient(180deg, #ffffff 0%, #c8c8c8 50%, #969696 100%)",
							}}
						>
							<img
								src={pokemon.evolvesFrom.image}
								alt={pokemon.evolvesFrom.name}
								className="object-contain"
							/>
						</div>
					</div>
				)}

				{/* top section */}
				<div className={"px-[30px] flex flex-col items-center flex-shrink-0"}>
					<div className="w-full">
						{pokemon.evolvesFrom ? (
							<p className="font-['Cabin'] font-semibold italic text-[14px] leading-none border-b-2 border-yellow-400 pt-2 pb-[2px] -mr-[10px] pl-[65px]">
								Evolves from {capitaliseWord(pokemon.evolvesFrom.name)}
							</p>
						) : (
							<p className="font-['Cabin'] font-bold text-[16px] leading-none pt-3">
								Basic Pokémon
							</p>
						)}
						<div
							className={`flex justify-between items-end pb-1 ${pokemon.evolvesFrom ? "-mt-[14px]" : "-mt-[8px]"}`}
						>
							<h2
								className={`font-['Cabin'] text-[34px] font-bold capitalize leading-[0.8] ${pokemon.evolvesFrom ? "pl-[74px]" : ""}`}
							>
								{pokemon.name}
							</h2>
							<div className="flex gap-1 items-end">
								<p className="font-['Cabin'] text-[32px] font-bold leading-[0.8]">
									{pokemon.hp}HP
								</p>
								{TypeIcon && (
									<div className="relative rounded-full">
										<TypeIcon className="w-11 h-11" />
										<div
											className="absolute inset-0 rounded-full pointer-events-none"
											style={{
												background:
													"linear-gradient(180deg, rgba(255, 255, 255, 0.4) 0%, transparent 50%, rgba(0, 0, 0, 0.2) 100%)",
											}}
										/>
									</div>
								)}
							</div>
						</div>
					</div>

					<div
						style={{
							padding: "10px",
							background:
								"linear-gradient(135deg, #fdf5c8 0%, #f9e89f 25%, #f5d203 50%, #daa520 75%, #c9a020 100%)",
							boxShadow: "6px 6px 12px rgba(0, 0, 0, 0.5)",
						}}
					>
						<div
							className="h-[290px] w-[418px] flex items-end justify-center pb-2"
							style={{
								backgroundImage: backgroundImage
									? `url(${backgroundImage})`
									: "none",
								backgroundColor,
							}}
						>
							<img
								src={pokemon.image}
								alt={pokemon.name}
								className="max-h-[90%] max-w-[90%] object-contain"
							/>
						</div>
					</div>
					<div className="w-full flex justify-center">
						<div
							className="px-7 py-1 text-center font-['Cabin'] text-[16px] font-bold italic leading-none mt-3"
							style={{
								background:
									"linear-gradient(90deg, #e6b800 0%, #fff4a3 50%, #e6b800 100%)",
								color: "#000000",
							}}
						>
							{subtitle}
						</div>
					</div>
				</div>

				{/* moves section */}
				<div
					className={`mx-[20px] flex flex-col flex-1 border-b-2 border-black`}
				>
					{moves.map((move, index) => {
						const MoveIcon = typeIcons[move.type as keyof typeof typeIcons];
						const name = capitaliseWords(move.name);
						return (
							<div
								key={move.name}
								className={`w-full flex items-center gap-3 px-[10px] flex-1 ${
									index !== moves.length - 1 ? "border-b-2 border-black" : ""
								}`}
							>
								<div className="relative rounded-full flex-shrink-0">
									<MoveIcon className="w-[35px] h-[35px]" />
									<div
										className="absolute inset-0 rounded-full pointer-events-none"
										style={{
											background:
												"linear-gradient(180deg, rgba(255, 255, 255, 0.4) 0%, transparent 50%, rgba(0, 0, 0, 0.2) 100%)",
										}}
									/>
								</div>
								{/* reduce line height */}
								<div className="font-['Cabin'] leading-[1.2] flex-1">
									<h3 className="inline text-[20px] font-bold">{name} </h3>
									<span className="inline text-[18px] font-normal">
										{move.description}
									</span>
								</div>
							</div>
						);
					})}
				</div>

				{/* bottom section */}
				<div className="flex-shrink-0">
					<div className="flex items-start justify-evenly w-full pt-1 pb-2">
						{renderDamageRelation(
							pokemon.damageRelationMultipliers?.weakTo,
							"weakness",
						)}
						{renderDamageRelation(
							pokemon.damageRelationMultipliers?.resistantTo,
							"resistance",
						)}
						{renderDamageRelation(
							pokemon.damageRelationMultipliers?.immuneTo,
							"immunity",
						)}
					</div>
					<div className="px-[30px] mb-2">
						<div
							style={{
								padding: "3px",
								background:
									"linear-gradient(135deg, #fdf5c8 0%, #f9e89f 25%, #f5d203 50%, #daa520 75%, #c9a020 100%)",
							}}
						>
							<div
								className="px-[10px] py-[2px] font-['Cabin'] font-bold italic leading-[1.2]"
								style={{
									backgroundColor,
								}}
							>
								{normalizeDescription(pokemon.description)}
								<span> {`#${pokemon.id}`}</span>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

// NEW: Loading card with exact same styling
export const PokemonCardLoading = () => {
	return (
		<div className="bg-white rounded-2xl w-[400px] max-h-[90vh] overflow-y-auto shadow-2xl">
			<div className="p-8">
				<div>Loading...</div>
			</div>
		</div>
	);
};
