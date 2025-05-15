function fetchPokemon(count) {
  axios
    .get("https://pokeapi.co/api/v2/pokemon", {
      params: {
        limit: count,
        offset: Math.random() * 1000
      },
    })
    .then((response) => {
      console.log(response.data);
      return response.data.results;
    })
    .catch((error) => {
      console.error("Error fetching Pokemon:", error);
    });
}
