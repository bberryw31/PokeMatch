// theme toggle
const themeToggle = document.getElementById("themeToggle");
themeToggle.addEventListener("change", () => {
  document.documentElement.setAttribute(
    "data-theme",
    this.checked ? "dracula" : "fantasy"
  );
});

// difficulty buttons
const difficultyButtons = document.querySelectorAll(".difficulty-btn");
let selectedDifficulty = 3;
difficultyButtons.forEach((button) => {
  button.addEventListener("click", () => {
    console.log(button.dataset.difficulty);
    selectedDifficulty = parseInt(button.dataset.difficulty);
    updateDifficultyButton();
  });
});

// update difficulty button styles
const updateDifficultyButton = () => {
  difficultyButtons.forEach((button) => {
    button.querySelector(".difficulty-span").classList.remove("bg-transparent");
    button.querySelector(".difficulty-span").classList.add("bg-slate-900");
  });
  const selectedButton = document.querySelector(
    `.difficulty-btn[data-difficulty="${selectedDifficulty}"]`
  );
  selectedButton.querySelector(".difficulty-span").classList.remove("bg-slate-900");
  selectedButton.querySelector(".difficulty-span").classList.add("bg-transparent");
}
updateDifficultyButton();

// fetch Pokemon image from API
const fetchPokemon = (pokemonId) => {
  return axios
    .get("https://pokeapi.co/api/v2/pokemon/" + pokemonId)
    .then((response) => {
      return pokemonId, response.data.sprites.other["official-artwork"].front_default;
    })
    .catch((error) => {
      console.error("Error fetching Pokemon:", error, pokemonId);
      return;
    });
}

// timer
const gameTime = document.getElementById("gameTime");
const timeProgress = document.getElementById("timeProgress");
let timer = null;
let timeLeft = 300;
const updateTimer = () => {
  timeLeft--;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  gameTime.textContent = minutes + ":" + (seconds < 10 ? "0" : "") + seconds;
  timeProgress.value = timeLeft;

  // red when under 60
  if (timeLeft <= 60) {
    gameTime.classList.add("text-error");
    timeProgress.classList.remove("progress-primary");
    timeProgress.classList.add("progress-error");
  }

  // check if time is up
  if (timeLeft <= 0) {
    clearInterval(timer);
    gameOver(false);
  }
}


// update game stat
const gameStatsWindow = document.getElementById("gameStats");
const matchCount = document.getElementById("matchCount");
const attemptCount = document.getElementById("attemptCount");
let cardCount = (selectedDifficulty * (selectedDifficulty - 1))
let matches = 0;
let attempts = 0;
const updateStats = () => {
  let totalPairs = Math.floor((selectedDifficulty * (selectedDifficulty - 1)) / 2);
  matchCount.textContent = matches + " / " + totalPairs;
  attemptCount.textContent = attempts;
}

let firstCard = null;
let secondCard = null;
let lockBoard = false;
const resetBoard = () => {
  firstCard = null;
  secondCard = null;
  lockBoard = false;
}

// check match
const checkForMatch = () => {
  if (lockBoard) return;
  if (firstCard && secondCard) {
    attempts++;
    if (firstCard.dataset.pokemonId === secondCard.dataset.pokemonId) {
      // match
      matches++;
      firstCard.dataset.enabled = "false";
      secondCard.dataset.enabled = "false";

      //visual effects tbd
      firstCard.classList.add("card-matched");
      secondCard.classList.add("card-matched");

      resetBoard();
      updateStats();

      if (matches === cardCount / 2) {
        setTimeout(() => {
          gameOver(true);
        }, 500);
      }
    } else {
      // not a match
      lockBoard = true;
      setTimeout(() => {
        firstCard.classList.remove("flipped");
        secondCard.classList.remove("flipped");
        const firstFront = firstCard.querySelector(".card-front");
        const firstBack = firstCard.querySelector(".card-back");
        const secondFront = secondCard.querySelector(".card-front");
        const secondBack = secondCard.querySelector(".card-back");
        setTimeout(() => {
          if (firstFront) firstFront.classList.add("hidden");
          if (firstBack) firstBack.classList.remove("hidden");
          if (secondFront) secondFront.classList.add("hidden");
          if (secondBack) secondBack.classList.remove("hidden");
          firstCard.dataset.enabled = "true";
          secondCard.dataset.enabled = "true";
          resetBoard();
          updateStats();
          powerUp();
        }, 180);
      }, 800);
    }
  }
}

// start game
const gameBoard = document.getElementById("gameBoard");
const startButton = document.getElementById("startButton");

const startGame = () => {
  resetBoard();
  matches = 0;
  attempts = 0;
  timeLeft = 300;
  cardCount = selectedDifficulty * (selectedDifficulty - 1);
  powerUpProgress.value = "5";

  if (timer) {
    clearInterval(timer);
  }

  gameBoard.innerHTML = "";
  gameBoard.classList.remove("hidden");
  gameTime.classList.remove("text-error");
  timeProgress.classList.remove("progress-error");
  timeProgress.classList.add("progress-primary");

  gameStatsWindow.hidden = false;
  updateStats();

  timer = setInterval(updateTimer, 1000);
  updateTimer();

  const randomPokemonIds = new Set();
  while (randomPokemonIds.size < cardCount / 2) {
    randomPokemonIds.add(Math.floor(Math.random() * 898) + 1);
  }
  // array shuffle algorithm
  const Shuffle = (array, times = 3) => {
    for (let t = 0; t < times; t++) {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
    }
    return array;
  };
  const randomPokemons = Shuffle([
    ...Array.from(randomPokemonIds),
    ...Array.from(randomPokemonIds),
  ]);

  gameBoard.innerHTML = "";
  gameBoard.className =
    "flex-1 bg-base-100/80 backdrop-blur-sm rounded-lg mx-4 mb-10 p-4 grid gap-2 w-full max-w-4xl";
  gameBoard.classList.add("grid-cols-" + selectedDifficulty);

  const pokemonPromises = randomPokemons.map((pokemonId) =>
    fetchPokemon(pokemonId)
  );
  Promise.all(pokemonPromises).then((pokemonImages) => {
    pokemonImages.forEach((pokemonImageUrl, index) => {
      const pokemonId = randomPokemons[index];
      const card = document.createElement("div");
      card.dataset.pokemonId = pokemonId;
      card.dataset.enabled = "true";
      card.innerHTML = `
          <div class="card-front hidden absolute inset-0">
            <img src="${pokemonImageUrl}" alt="Pokemon ${pokemonId}" class="w-full h-full object-contain">
          </div>
          <div class="card-back absolute inset-0 hover:scale-95 transition-all ease-in-out duration-50">
            <img src="./pokeball.png" alt="Pokeball" class="w-full h-full object-contain">
          </div>
        `;
      card.classList.add(
        "card-flip",
        "bg-base-300",
        "border",
        "border-base-content/10",
        "shadow-md",
        "rounded-lg",
        "cursor-pointer",
        "aspect-square",
        "relative",
        "overflow-hidden"
      );

      // Add click event listener
      card.addEventListener("click", () => {
        if (card.dataset.enabled === "false" || lockBoard || firstCard === card)
          return;
        const frontSide = card.querySelector(".card-front");
        const backSide = card.querySelector(".card-back");
        card.classList.add("flipped");
        setTimeout(() => {
          frontSide.classList.remove("hidden");
          backSide.classList.add("hidden");
        }, 180);

        if (!firstCard) {
          firstCard = card;
        } else {
          secondCard = card;
          checkForMatch();
        }
      });

      gameBoard.appendChild(card);
    });
    lockBoard = true;
    setTimeout(() => {
      powerUp();
      lockBoard = false;
    }, 500);
  });
};
startButton.addEventListener("click", startGame);

// reset
const resetButton = document.getElementById("resetButton");
const resetGame = () => {
  if (timer) {
    clearInterval(timer);
  };
  gameBoard.classList.remove("grid");
  gameBoard.classList.add("hidden");
  gameStatsWindow.hidden = true;
};
resetButton.addEventListener("click", resetGame);

// power up
const powerUpProgress = document.getElementById("powerUpProgress");
const powerUp = () => {
  powerUpProgress.value = parseInt(powerUpProgress.value) + 1;
  if (powerUpProgress.value >= powerUpProgress.max) {
    console.log("Power up activated!");
    lockBoard = true;
    const cards = document.querySelectorAll(".card-flip");
    cards.forEach((card) => {
      const frontSide = card.querySelector(".card-front");
      const backSide = card.querySelector(".card-back");
      card.classList.add("flipped");
      setTimeout(() => {
        frontSide.classList.remove("hidden");
        backSide.classList.add("hidden");
      }, 180);
    });
    setTimeout(() => {
      cards.forEach((card) => {
        const frontSide = card.querySelector(".card-front");
        const backSide = card.querySelector(".card-back");
        card.classList.remove("flipped");
        setTimeout(() => {
          frontSide.classList.add("hidden");
          backSide.classList.remove("hidden");
        }, 180);
      });
    }, 1000);
    powerUpProgress.value = "0";
    lockBoard = false;
  }
};

const gameOver = (won) => {
  clearInterval(timer);
  gameBoard.classList.remove("grid");
  gameBoard.classList.add("hidden");
  gameStatsWindow.hidden = true;
  const message = won ? "You won!" : "Game over!";
  alert(message);
}