import { useMemo } from "react";
import { backgroundImages, colors, typeIcons } from "./pokemonConstants";
import {
	capitaliseWord,
	capitaliseWords,
	getBackgroundType,
	getRandomItems,
	normalizeDescription,
} from "../../shared/utils/pokemonUtils";
import type { PokemonDetail } from "./pokemonTypes";

const CARD_SIZE = "w-[550px] h-[765px]";

const FONT_FAMILY = "font-['Cabin']";

const CARD_STYLES = {
	goldGradient:
		"linear-gradient(135deg, #fdf5c8 0%, #f9e89f 25%, #f5d203 50%, #daa520 75%, #c9a020 100%)",
	silverGradient:
		"linear-gradient(180deg, #ffffff 0%, #c8c8c8 50%, #969696 100%)",
	yellowGradient:
		"linear-gradient(90deg, #e6b800 0%, #fff4a3 50%, #e6b800 100%)",
	typeIconOverlay:
		"linear-gradient(180deg, rgba(255, 255, 255, 0.4) 0%, transparent 50%, rgba(0, 0, 0, 0.2) 100%)",
	goldBoxShadow:
		"2px 2px 4px rgba(0, 0, 0, 0.3), inset 1px 1px 2px rgba(255, 255, 255, 0.5)",
	frameBoxShadow: "6px 6px 15px rgba(0, 0, 0, 0.7)",
} as const;

const TypeIconWithOverlay = ({
	Icon,
	className = "w-8 h-8",
}: {
	Icon: React.ComponentType<{ className?: string }>;
	className?: string;
}) => (
	<div className="relative rounded-full">
		<Icon className={className} />
		<div
			className="absolute inset-0 rounded-full pointer-events-none"
			style={{ background: CARD_STYLES.typeIconOverlay }}
		/>
	</div>
);
interface PokemonCardProps {
	pokemon: PokemonDetail;
}

export const PokemonCard = ({ pokemon }: PokemonCardProps) => {
	const backgroundType = getBackgroundType(pokemon.types, pokemon.name);
	const backgroundColor = colors[pokemon.types[0] as keyof typeof colors];
	const backgroundImage =
		backgroundImages[backgroundType as keyof typeof backgroundImages];
	const TypeIcon = typeIcons[pokemon.types[0] as keyof typeof typeIcons];

	const formatHeight = (height: number): string =>
		height > 99 ? `${height / 100}m` : `${height}cm`;

	const subtitle = `${capitaliseWord(pokemon.genus)}. Height: ${formatHeight(
		pokemon.height,
	)}, Weight: ${pokemon.weight}kg.`;

	const moves = useMemo(() => {
		return getRandomItems(pokemon.moves || [], 2);
	}, [pokemon.moves]);

	const damageTypeTotal =
		(pokemon.damageRelationMultipliers?.weakTo?.length ?? 0) +
		(pokemon.damageRelationMultipliers?.resistantTo?.length ?? 0) +
		(pokemon.damageRelationMultipliers?.immuneTo?.length ?? 0);

	const renderDamageRelation = (types: string[] | undefined, label: string) => {
		if (!types || types.length === 0) return null;

		return (
			<div className="flex flex-col items-center gap-[1px]">
				<p className={`${FONT_FAMILY} text-[15px] font-bold leading-[1.3]`}>
					{label}
				</p>
				<div
					className={`flex items-center gap-[2px] justify-center flex-wrap max-w-[250px]`}
				>
					{types.map((type) => {
						const TypeIcon = typeIcons[type as keyof typeof typeIcons];
						return (
							<TypeIconWithOverlay
								Icon={TypeIcon}
								className={`${damageTypeTotal > 10 ? "w-7 h-7" : "w-8 h-8"}`}
								key={type}
							/>
						);
					})}
				</div>
			</div>
		);
	};

	return (
		<div
			className={`rounded-2xl ${CARD_SIZE} shadow-2xl flex flex-col overflow-hidden`}
			style={{
				backgroundColor,
			}}
		>
			<div className="relative border-26 border-[#f5d203] h-full flex flex-col">
				{pokemon.evolvesFrom && (
					<div
						className="absolute top-[8px] left-[8px] flex flex-col items-center w-[78px]"
						style={{
							background: CARD_STYLES.goldGradient,
							boxShadow: CARD_STYLES.goldBoxShadow,
						}}
					>
						<div
							className={`${FONT_FAMILY} font-bold uppercase text-[12px] leading-tight text-center px-3 py-[1px]`}
						>
							Stage {pokemon.evolvesFrom.stage}
						</div>

						<div
							className="flex items-center justify-center mx-[4px] mb-[4px]"
							style={{
								background: CARD_STYLES.silverGradient,
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
							<p
								className={`${FONT_FAMILY} font-bold italic text-[14px] leading-none border-b-2 border-yellow-400 pt-2 pb-[2px] -mr-[10px] pl-[65px]`}
							>
								Evolves from {capitaliseWord(pokemon.evolvesFrom.name)}
							</p>
						) : (
							<p
								className={`${FONT_FAMILY} font-bold text-[16px] leading-none pt-3`}
							>
								Basic Pokémon
							</p>
						)}
						<div
							className={`flex justify-between items-end ${pokemon.evolvesFrom ? "pb-1 -mt-[8px]" : "pb-1 -mt-[12px] -ml-[1px]"}`}
						>
							<h2
								className={`${FONT_FAMILY} text-[34px] font-bold capitalize leading-[1] ${pokemon.evolvesFrom ? "pl-[74px]" : ""}`}
							>
								{pokemon.name}
							</h2>
							<div className="flex gap-1 items-end">
								<p
									className={`${FONT_FAMILY} text-[32px] font-bold leading-[0.9]`}
								>
									{pokemon.hp}HP
								</p>
								{TypeIcon && (
									<TypeIconWithOverlay Icon={TypeIcon} className="w-11 h-11" />
								)}
							</div>
						</div>
					</div>

					<div
						style={{
							padding: "10px",
							background: CARD_STYLES.goldGradient,
							boxShadow: CARD_STYLES.frameBoxShadow,
						}}
					>
						<div
							className="h-[290px] w-[418px] flex items-end justify-center"
							style={{
								backgroundImage: backgroundImage
									? `url(${backgroundImage})`
									: "none",
								backgroundColor,
								backgroundSize: "cover",
								backgroundPosition: "center",
								backgroundRepeat: "no-repeat",
							}}
						>
							<img
								src={pokemon.image}
								alt={pokemon.name}
								className={`${pokemon.height > 70 ? "max-h-[95%] max-w-[95%]" : "max-h-[75%] max-w-[75%]"} object-contain`}
							/>
						</div>
					</div>
					<div className="w-full flex justify-center">
						<div
							className={`px-8 text-center ${FONT_FAMILY} text-[16px] font-bold italic leading-[1.4] mt-[10px]`}
							style={{
								background: CARD_STYLES.yellowGradient,
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
								<TypeIconWithOverlay
									Icon={MoveIcon}
									className="w-[35px] h-[35px]"
								/>

								{/* reduce line height */}
								<div className={`${FONT_FAMILY} leading-[1.2] flex-1`}>
									<h3 className="inline text-[19px] font-bold">{name} </h3>
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
					<div className="flex items-start justify-evenly w-full pb-2">
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
								background: CARD_STYLES.goldGradient,
							}}
						>
							<div
								className={`px-[10px] py-[2px] ${FONT_FAMILY} font-bold italic leading-[1.2]`}
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

export const PokemonCardLoading = () => {
	return (
		<div
			className={`bg-gray-200 rounded-2xl ${CARD_SIZE} shadow-2xl flex flex-col overflow-hidden`}
		>
			<div className="relative border-26 border-gray-300 h-full flex flex-col px-[30px] py-[15px]">
				{/* Header section */}
				<div className="flex flex-col gap-[3px] mb-3">
					{/* Basic Pokemon text */}
					<div className="h-4 w-32 bg-gray-300 rounded animate-pulse" />

					{/* Name and HP row */}
					<div className="flex justify-between items-end">
						<div className="h-10 w-40 bg-gray-300 rounded animate-pulse" />
						<div className="flex gap-2 items-end">
							<div className="h-10 w-20 bg-gray-300 rounded animate-pulse" />
							<div className="h-12 w-12 bg-gray-300 rounded-full animate-pulse" />
						</div>
					</div>
				</div>

				{/* Image container */}
				<div className="bg-gray-300 p-[10px] animate-pulse mb-2">
					<div className="h-[290px] w-[418px] bg-gray-400 flex items-center justify-center"></div>
				</div>

				{/* Subtitle bar */}
				<div className="flex justify-center">
					<div className="h-6 w-[300px] bg-gray-300 rounded animate-pulse mb-3" />
				</div>

				{/* Moves section */}
				<div className="flex-1 flex flex-col gap-3 mb-2 border-b-2 border-gray-300 pb-4">
					{/* Move 1 */}
					<div className="flex items-center gap-3 flex-1 border-b-2 border-gray-300 pb-3">
						<div className="h-[35px] w-[35px] bg-gray-300 rounded-full animate-pulse flex-shrink-0" />
						<div className="flex-1 space-y-2">
							<div className="h-4 w-95 bg-gray-300 rounded animate-pulse" />
							<div className="h-4 w-3/4 bg-gray-300 rounded animate-pulse" />
						</div>
					</div>

					{/* Move 2 */}
					<div className="flex items-center gap-3 flex-1">
						<div className="h-[35px] w-[35px] bg-gray-300 rounded-full animate-pulse flex-shrink-0" />
						<div className="flex-1 space-y-2">
							<div className="h-4 w-95 bg-gray-300 rounded animate-pulse" />
							<div className="h-4 w-3/4 bg-gray-300 rounded animate-pulse" />
						</div>
					</div>
				</div>

				{/* Damage relations section */}
				<div className="flex justify-evenly mb-3">
					{/* Weakness */}
					<div className="flex flex-col items-center gap-2">
						<div className="h-4 w-20 bg-gray-300 rounded animate-pulse" />
						<div className="flex gap-1">
							<div className="h-8 w-8 bg-gray-300 rounded-full animate-pulse" />
							<div className="h-8 w-8 bg-gray-300 rounded-full animate-pulse" />
						</div>
					</div>

					{/* Resistance */}
					<div className="flex flex-col items-center gap-2">
						<div className="h-4 w-20 bg-gray-300 rounded animate-pulse" />
						<div className="flex gap-1">
							<div className="h-8 w-8 bg-gray-300 rounded-full animate-pulse" />
							<div className="h-8 w-8 bg-gray-300 rounded-full animate-pulse" />
						</div>
					</div>

					{/* Immunity */}
					<div className="flex flex-col items-center gap-2">
						<div className="h-4 w-20 bg-gray-300 rounded animate-pulse" />
						<div className="flex gap-1">
							<div className="h-8 w-8 bg-gray-300 rounded-full animate-pulse" />
						</div>
					</div>
				</div>

				{/* Description box */}
				<div className="bg-gray-300 p-[3px] animate-pulse">
					<div className="bg-gray-200 px-[10px] py-[6px] space-y-1">
						<div className="h-4 w-full bg-gray-300 rounded" />
						<div className="h-4 w-3/4 bg-gray-300 rounded" />
					</div>
				</div>
			</div>
		</div>
	);
};
