import { PokemonList } from "./features/pokemon/PokemonList";

function App() {
	return (
		<div>
			<div className="min-h-screen bg-blue-10 p-15 flex flex-col items-center">
				<h1 className="text-6xl font-bold mb-10">Pokédex 151</h1>
				<PokemonList />
			</div>
		</div>
	);
}

export default App;
