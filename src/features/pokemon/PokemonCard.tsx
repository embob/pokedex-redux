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
	console.log("🚀 , PokemonCard , pokemon:", pokemon);
	const backgroundColor = colors[pokemon.types[0] as keyof typeof colors];
	const backgroundImage =
		backgroundImages[pokemon.types[0] as keyof typeof backgroundImages];
	const TypeIcon = typeIcons[pokemon.types[0] as keyof typeof typeIcons];
	const evolvesFromLabel = pokemon.evolvesFrom
		? `Evolves from ${capitaliseWord(pokemon.evolvesFrom.name)}`
		: "Basic Pokémon";

	const height =
		pokemon.height > 99 ? `${pokemon.height / 100}m` : `${pokemon.height}cm`;
	const subtitle = `${capitaliseWord(pokemon.genus)}. Height: ${height}, Weight: ${pokemon.weight}kg.`;

	const moves = useMemo(() => {
		return getRandomItems(pokemon.moves || [], 2);
	}, [pokemon.moves]);

	return (
		<div
			className={`rounded-2xl w-[550px] h-[765px] overflow-y-auto shadow-2xl flex flex-col`}
			style={{ backgroundColor }}
		>
			<div className="border-26 border-[#f5d203] h-full">
				<div className="px-[30px]">
					<div>
						<p>{evolvesFromLabel}</p>
						<h2 className="text-2xl font-bold capitalize">{pokemon.name}</h2>
					</div>

					<div>
						<p>{pokemon.hp}HP</p>
						{TypeIcon && (
							<div>
								<TypeIcon className="w-8 h-8" />
							</div>
						)}
					</div>
				</div>
				{pokemon.evolvesFrom && (
					<div>
						<p>{`Stage ${pokemon.evolvesFrom.stage}`}</p>
						<img
							src={pokemon.evolvesFrom.image}
							alt={pokemon.evolvesFrom.name}
							className="w-[60px]"
						/>
					</div>
				)}

				<div
					className="h-[294px] w-[410px] flex items-end justify-center pb-2 border-8 border-yellow-400"
					style={{
						backgroundImage: backgroundImage
							? `url(${backgroundImage})`
							: "none",
						backgroundColor,
						boxShadow: "6px 6px 12px rgba(0, 0, 0, 0.5)",
					}}
				>
					<img
						src={pokemon.image}
						alt={pokemon.name}
						className="max-h-[90%] max-w-[90%] object-contain"
					/>
				</div>
				<div>{subtitle}</div>

				{moves.map((move) => {
					const MoveIcon = typeIcons[move.type as keyof typeof typeIcons];
					const name = capitaliseWords(move.name);
					return (
						<div key={move.name}>
							<div>
								<MoveIcon className="w-8 h-8" />
							</div>
							{name}
							{move.description}
						</div>
					);
				})}

				<div>
					{normalizeDescription(pokemon.description)}
					<p>{`#${pokemon.id}`}</p>
				</div>

				<div>
					{pokemon.damageRelationMultipliers?.weakTo &&
						pokemon.damageRelationMultipliers?.weakTo.length > 0 && (
							<div>
								<p>Weakness</p>
								{pokemon.damageRelationMultipliers?.weakTo.map((type) => {
									const TypeIcon = typeIcons[type as keyof typeof typeIcons];
									return (
										<div key={type}>
											<TypeIcon className="w-8 h-8" />
										</div>
									);
								})}
							</div>
						)}
					{pokemon.damageRelationMultipliers?.resistantTo &&
						pokemon.damageRelationMultipliers?.resistantTo.length > 0 && (
							<div>
								<p>Resistance</p>
								{pokemon.damageRelationMultipliers?.resistantTo.map((type) => {
									const TypeIcon = typeIcons[type as keyof typeof typeIcons];
									return (
										<div key={type}>
											<TypeIcon className="w-8 h-8" />
										</div>
									);
								})}
							</div>
						)}
					{pokemon.damageRelationMultipliers?.immuneTo &&
						pokemon.damageRelationMultipliers?.immuneTo.length > 0 && (
							<div>
								<p>Immunity</p>
								{pokemon.damageRelationMultipliers?.immuneTo.map((type) => {
									const TypeIcon = typeIcons[type as keyof typeof typeIcons];
									return (
										<div key={type}>
											<TypeIcon className="w-8 h-8" />
										</div>
									);
								})}
							</div>
						)}
				</div>

				{/* Add more Pokemon details here later */}
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
