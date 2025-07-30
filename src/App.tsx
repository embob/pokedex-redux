import { PokemonList } from "./features/pokemon/PokemonList";

function App() {
	return (
		<div>
			<h1 className="text-4xl font-bold text-green-600">Pokedex</h1>

			<PokemonList />
		</div>
	);
}

export default App;
