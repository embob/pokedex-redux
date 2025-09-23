import { describe, it, expect, vi } from "vitest";
import {
	calculateDamageMultipliers,
	calculateDamageRelations,
	collectAllDamageTypes,
	fetchDamageRelationsForType,
	fetchDamageRelationsForTypes,
} from "./pokemonUtils";

const damageRelationsForGrassAndPoison = [
	{
		noDamageFrom: [],
		halfDamageFrom: ["ground", "water", "grass", "electric"],
		doubleDamageFrom: ["flying", "poison", "bug", "fire", "ice"],
	},
	{
		noDamageFrom: [],
		halfDamageFrom: ["fighting", "poison", "bug", "grass", "fairy"],
		doubleDamageFrom: ["ground", "psychic"],
	},
];

const damageRelationsForNormalAndFlying = [
	{
		noDamageFrom: ["ghost"],
		halfDamageFrom: [],
		doubleDamageFrom: ["fighting"],
	},
	{
		noDamageFrom: ["ground"],
		halfDamageFrom: ["fighting", "bug", "grass"],
		doubleDamageFrom: ["rock", "electric", "ice"],
	},
];

describe("fetchDamageRelationsForType", () => {
	it("should use cache on subsequent calls for the same type", async () => {
		const mockFetch = vi.fn();
		const originalFetch = globalThis.fetch;
		globalThis.fetch = mockFetch;

		const mockResponse = {
			damage_relations: {
				no_damage_from: [
					{ name: "ghost", url: "https://pokeapi.co/api/v2/type/ghost/" },
				],
				half_damage_from: [],
				double_damage_from: [
					{ name: "fighting", url: "https://pokeapi.co/api/v2/type/fighting/" },
				],
			},
		};

		mockFetch.mockResolvedValueOnce({
			json: () => Promise.resolve(mockResponse),
		});

		const input = "normal";

		// First call - should make API request
		const result1 = await fetchDamageRelationsForType(input);
		// Second call - should use cache, no API request
		const result2 = await fetchDamageRelationsForType(input);

		expect(result1).toEqual(result2);
		expect(result1).toEqual({
			noDamageFrom: ["ghost"],
			halfDamageFrom: [],
			doubleDamageFrom: ["fighting"],
		});

		expect(mockFetch).toHaveBeenCalledTimes(1);
		expect(mockFetch).toHaveBeenCalledWith(
			"https://pokeapi.co/api/v2/type/normal",
		);

		// Clean up: restore original fetch
		globalThis.fetch = originalFetch;
	});

	it("should fetch damage relations for a type", async () => {
		const result = await fetchDamageRelationsForType("normal");
		expect(result).toEqual({
			noDamageFrom: ["ghost"],
			halfDamageFrom: [],
			doubleDamageFrom: ["fighting"],
		});
	});
});

describe("fetchDamageRelationsForTypes", () => {
	it("should fetch damage relations for multiple types", async () => {
		const result = await fetchDamageRelationsForTypes(["grass", "poison"]);
		expect(result).toEqual(damageRelationsForGrassAndPoison);
	});
});

describe("calculateDamageRelations", () => {
	it("should collect all types into one object", () => {
		const result = collectAllDamageTypes(damageRelationsForGrassAndPoison);
		const resultToOrderedArray = Array.from(result).sort();
		expect(resultToOrderedArray).toEqual(
			[
				"ground",
				"water",
				"grass",
				"electric",
				"flying",
				"poison",
				"bug",
				"fire",
				"ice",
				"fighting",
				"fairy",
				"psychic",
			].sort(),
		);
	});

	it("should return correct damage relation multiplies for a Pokemon with types grass and poison", () => {
		const sortByType = (arr: { type: string; multiplier: number }[]) =>
			arr.sort((a, b) => a.type.localeCompare(b.type));

		const result = calculateDamageMultipliers(damageRelationsForGrassAndPoison);

		const expectedWeakTo: { type: string; multiplier: number }[] = sortByType([
			{ type: "fire", multiplier: 2 },
			{ type: "ice", multiplier: 2 },
			{ type: "flying", multiplier: 2 },
			{ type: "psychic", multiplier: 2 },
		]);
		const expectedResistantTo: { type: string; multiplier: number }[] =
			sortByType([
				{ type: "grass", multiplier: 0.25 },
				{ type: "water", multiplier: 0.5 },
				{ type: "electric", multiplier: 0.5 },
				{ type: "fighting", multiplier: 0.5 },
				{ type: "fairy", multiplier: 0.5 },
			]);

		const expectedImmuneTo: { type: string; multiplier: number }[] = sortByType(
			[],
		);

		expect(sortByType(result.weakTo)).toEqual(sortByType(expectedWeakTo));

		expect(sortByType(result.resistantTo)).toEqual(
			sortByType(expectedResistantTo),
		);

		expect(sortByType(result.immuneTo)).toEqual(sortByType(expectedImmuneTo));
	});

	it("should return correct damage multipliers for a Pokemon with types normal and flying", () => {
		const sortByType = (arr: { type: string; multiplier: number }[]) =>
			arr.sort((a, b) => a.type.localeCompare(b.type));

		const result = calculateDamageMultipliers(
			damageRelationsForNormalAndFlying,
		);

		const expectedWeakTo: { type: string; multiplier: number }[] = sortByType([
			{ type: "electric", multiplier: 2 },
			{ type: "ice", multiplier: 2 },
			{ type: "rock", multiplier: 2 },
		]);
		const expectedResistantTo: { type: string; multiplier: number }[] =
			sortByType([
				{ type: "grass", multiplier: 0.5 },
				{ type: "bug", multiplier: 0.5 },
			]);

		const expectedImmuneTo: { type: string; multiplier: number }[] = sortByType(
			[
				{ type: "ground", multiplier: 0 },
				{ type: "ghost", multiplier: 0 },
			],
		);

		expect(sortByType(result.weakTo)).toEqual(sortByType(expectedWeakTo));

		expect(sortByType(result.resistantTo)).toEqual(
			sortByType(expectedResistantTo),
		);

		expect(sortByType(result.immuneTo)).toEqual(sortByType(expectedImmuneTo));
	});

	it("should return correct type names per damage relation for a Pokemon of types grass and poison", () => {
		const result = calculateDamageRelations(damageRelationsForGrassAndPoison);

		expect(result.weakTo.sort()).toEqual(
			["fire", "ice", "flying", "psychic"].sort(),
		);
		expect(result.resistantTo.sort()).toEqual(
			["grass", "water", "electric", "fighting", "fairy"].sort(),
		);
		expect(result.immuneTo.sort()).toEqual([]);
	});

	it("should return correct type names per damage relation for a Pokemon of types normal and flying", () => {
		const result = calculateDamageRelations(damageRelationsForNormalAndFlying);

		expect(result.weakTo.sort()).toEqual(["electric", "ice", "rock"].sort());
		expect(result.resistantTo.sort()).toEqual(["grass", "bug"].sort());
		expect(result.immuneTo.sort()).toEqual(["ground", "ghost"].sort());
	});
});
