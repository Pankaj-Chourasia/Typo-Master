const RANDOM_QUOTE_API_URL = "https://api.quotable.io/random";
const quoteDisplayElement = document.getElementById("quoteDisplay");
const quoteInputElement = document.getElementById("quoteInput");
const timerElement = document.getElementById("timer");
const wpmElement = document.getElementById("wpm");
const accuracyElement = document.getElementById("accuracy");
let selectedTime = 0;

let timerInterval;
let timerSeconds;
let startTime;
let currentQuote;
let isTypingAllowed = true;

function startTimer(duration) {
  selectedTime = duration; 
  timerSeconds = duration;
  timerElement.innerText = timerSeconds;

  timerInterval = setInterval(() => {
    timerSeconds--;
    timerElement.innerText = timerSeconds;
    if (timerSeconds <= 0) {
      clearInterval(timerInterval);
      showResults();
    }
    if (timerSeconds === duration - 1) {
      renderNewQuote(); 
    }
  }, 1000);
}


function startCountdown() {
  let countdown = timerSeconds;

  timerInterval = setInterval(() => {
    timerElement.innerText = countdown;
    if (countdown === 0) {
      clearInterval(timerInterval);
      showResults();
    }
    countdown--;
  }, 1000);
}

function showResults() {
  const elapsedTime = timerSeconds - parseInt(document.getElementById("timer").innerText);
  const wordCount = document.getElementById("quoteDisplay").innerText.split(" ").length;
  const accuracy = calculateAccuracy(
    document.getElementById("quoteDisplay").innerText.length,
    document.getElementById("quoteInput").value.length
  );
  const wpm = calculateWordsPerMinute(wordCount, elapsedTime);

  updateDashboard(wpm, accuracy);

  document.getElementById("typing-container").classList.add("hidden");
  document.getElementById("results-container").classList.remove("hidden");
  quoteInputElement.disabled = true;
  isTypingAllowed = false;
}


quoteInputElement.addEventListener("input", () => {
  if (!isTypingAllowed) return;

  const arrayQuote = quoteDisplayElement.querySelectorAll("span");
  const arrayValue = quoteInputElement.value.split("");
  let correctCount = 0;

  arrayQuote.forEach((characterSpan, index) => {
    const character = arrayValue[index];

    if (character == null) {
      characterSpan.classList.remove("correct");
      characterSpan.classList.remove("incorrect");
    } else if (character === characterSpan.innerText) {
      characterSpan.classList.add("correct");
      characterSpan.classList.remove("incorrect");
      correctCount++;
    } else {
      characterSpan.classList.remove("correct");
      characterSpan.classList.add("incorrect");
    }
  });

  if (arrayValue.length === arrayQuote.length) {
    quoteInputElement.disabled = true;
    showResults();
    fetchNextQuote();
  }
});

async function renderNewQuote() {
  const quote = await getRandomQuote();
  currentQuote = quote;
  quoteDisplayElement.innerText = "";
  quote.split("").forEach((character) => {
    const characterSpan = document.createElement("span");
    characterSpan.innerText = character;
    quoteDisplayElement.appendChild(characterSpan);
  });
  quoteInputElement.value = "";
  quoteInputElement.disabled = false;
  quoteInputElement.focus();
  startTime = new Date();
}

document.getElementById("restart-button").addEventListener("click", () => {
  clearInterval(timerInterval); 
  document.getElementById("results-container").classList.add("hidden");
  document.getElementById("typing-container").classList.remove("hidden");
  quoteInputElement.disabled = false; 
  startTimer(selectedTime); 
  renderNewQuote(); 
});

function getRandomQuote() {
  return fetch(RANDOM_QUOTE_API_URL)
    .then((response) => response.json())
    .then((data) => data.content);
}

function calculateWordsPerMinute(wordCount, elapsedTime) {
  const minutes = elapsedTime / 60;
  return Math.floor(wordCount / minutes);
}

function calculateAccuracy(totalCharacters, incorrectCharacters) {
  const correctCharacters = totalCharacters - incorrectCharacters;
  const accuracy = (correctCharacters / totalCharacters) * 100;

  return isNaN(accuracy) ? 0 : Math.max(0, Math.floor(accuracy));
}

function updateDashboard(wpm, accuracy) {
  wpmElement.innerText = wpm;
  accuracyElement.innerText = accuracy + "%";
}
