function fetchPokemon(pokemonId) {
  return axios
    .get(`https://pokeapi.co/api/v2/pokemon/${pokemonId}`, {})
    .then((response) => {
      console.log(response.data);
      return response.data.sprites.other.showdown.front_default;
    })
    .catch((error) => {
      console.error("Error fetching Pokemon:", error);
    });
}

document.getElementById("startButton").addEventListener("click", function () {
  const count = document.getElementById("difficulty").value;
  const randomPokemonIds = new Set();
  while (randomPokemonIds.size !== (count * (count - 1)) / 2) {
    randomPokemonIds.add(Math.floor(Math.random() * 1000));
  }
  const randomPokemons = Array.from(randomPokemonIds);
  randomPokemons.push(...randomPokemons);
  randomPokemons.sort(() => Math.random() - 0.5);
  const gameBoard = document.getElementById("gameBoard");
  gameBoard.innerHTML = "";
  gameBoard.classList.add(
    "grid",
    "w-[80%]",
    "m-4",
    "p-2",
    "rounded-sm",
    "border-1",
    "mx-auto",
    `grid-cols-${count}`
  );
  randomPokemons.forEach((pokemonId) => {
    fetchPokemon(pokemonId).then((pokemon) => {
      const card = document.createElement("div");
      card.classList.add(
        "p-2",
        "flex",
        "justify-center",
        "items-center",
        "aspect-square",
        "relative",
      );

      const pokemonImg = document.createElement("img");
      pokemonImg.src = pokemon;
      pokemonImg.classList.add(
        "object-contain",
        "w-full",
        "h-full",
        "p-1",
        "absolute",
        "top-0",
        "left-0"
      );
      card.appendChild(pokemonImg);

      const pokeballImg = document.createElement("img");
      pokeballImg.src = "pokeball.png";
      pokeballImg.classList.add(
        "object-contain",
        "w-full",
        "h-full",
        "p-1",
        "absolute",
        "top-0",
        "left-0"
      );
      card.appendChild(pokeballImg);

      gameBoard.appendChild(card);
    });
  });
});

function createGameBoard(pokemons) {
  console.log(pokemons);
}
