import { describe, it, expect } from "vitest";
import { calculateDamageRelations } from "./pokemonUtils";

describe("calculateDamageRelations", () => {
	it("should merge damage relations from single type", () => {
		const input = [
			{
				noDamageFrom: ["ghost"],
				halfDamageFrom: ["dark"],
				doubleDamageFrom: ["fighting"],
			},
		];

		const result = calculateDamageRelations(input);

		expect(result).toEqual({
			noDamageFrom: ["ghost"],
			halfDamageFrom: ["dark"],
			doubleDamageFrom: ["fighting"],
		});
	});

	it("should merge damage relations from multiple types", () => {
		const input = [
			{
				noDamageFrom: ["ghost"],
				halfDamageFrom: ["dark"],
				doubleDamageFrom: ["fighting"],
			},
			{
				noDamageFrom: ["steel"],
				halfDamageFrom: ["fire"],
				doubleDamageFrom: ["ground"],
			},
		];

		const result = calculateDamageRelations(input);

		expect(result).toEqual({
			noDamageFrom: ["ghost", "steel"],
			halfDamageFrom: ["dark", "fire"],
			doubleDamageFrom: ["fighting", "ground"],
		});
	});

	it("should handle empty input", () => {
		const result = calculateDamageRelations([]);

		expect(result).toEqual({
			noDamageFrom: [],
			halfDamageFrom: [],
			doubleDamageFrom: [],
		});
	});

	it("should keep duplicates when merging", () => {
		const input = [
			{
				noDamageFrom: ["ghost"],
				halfDamageFrom: ["dark"],
				doubleDamageFrom: ["fighting"],
			},
			{
				noDamageFrom: ["ghost"], // duplicate
				halfDamageFrom: ["dark"], // duplicate
				doubleDamageFrom: ["psychic"],
			},
		];

		const result = calculateDamageRelations(input);

		expect(result).toEqual({
			noDamageFrom: ["ghost", "ghost"],
			halfDamageFrom: ["dark", "dark"],
			doubleDamageFrom: ["fighting", "psychic"],
		});
	});
});
