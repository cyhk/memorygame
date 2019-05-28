/* jshint esversion: 6 */
const CARD_PAIRS = 18;
const CARD_NUM = 36;
const HEXDIGITS = "0123456789ABCDEF";
let matchedCards = 0;
let currentPair = [];

//starts the game
const startGame = function(){
  const resetBoard = reset();
  const difficulty = getDifficulty();
  const deck = generateCards(difficulty);
  const shuffledCards = shuffleCards(deck);
  showCards(shuffledCards);
};

//reset board
const reset = function(){
  let score = document.getElementById("scoreVal");
  const parent = document.getElementsByClassName('game-side')[0];
  let currentHighIndex = document.cookie.indexOf("=")+1;
  let currentHigh = document.cookie.slice(currentHighIndex);

  document.getElementById('highscore').innerHTML = "High Score: "+currentHigh;
  score.innerHTML = 0;
  parent.innerHTML='';
  matchedCards = 0;
  currentPair = [];
};

//get difficulty to determine the range of colors to show
const getDifficulty = function(){
  const diffSelection =  document.getElementsByName("diffLevel");
  for (let i=0; i<diffSelection.length; i++)
  {
    if (diffSelection[i].checked)
    {
      difficulty = diffSelection[i].value;
      break;
    }
  }
};

//generate the deck with random colors
const generateCards = function(diff){
  let cards = [];
  let cardColors = [];
  let freezePosition=[false, false, false];
  let startingHex = "#";

  //generate random starting color. We will work out all the other
  //colors from this starting number
  for (let p=0; p<6; p++)
    startingHex+=HEXDIGITS[Math.floor(Math.random()*16)];

  //decide which digit pairs to freeze depending of it is medium or hard
  if (diff === "medium")
    freezePosition[Math.floor(Math.random()*3)] = true;
  else if (diff === "hard")
  {
    freezePosition[Math.floor(Math.random()*3)] = true;
    let nextRandomPos = Math.floor(Math.random()*3);
    while (freezePosition[nextRandomPos])
      nextRandomPos = Math.floor(Math.random()*3);
    freezePosition[nextRandomPos] = true;
  }

  //generate color codes
  for (let i=0; i<CARD_PAIRS; i++)
  {
    let newColor="#";
    for (let j=0; j<6; j++)
    {
      if (!freezePosition[Math.floor(j/2)])
        newColor+=HEXDIGITS[Math.floor(Math.random()*16)];
      else {
        newColor+=startingHex[j+1];
      }
    }

    //push twice because we want pairs
    cards.push(newColor);
    cards.push(newColor);
  }
  return cards;
};

//shuffle using Fisher-Yates Shuffle
const shuffleCards = function(cardArr){
  const shuffled = cardArr.slice(0);
  let temp = null;
  let shuffleIndex = shuffled.length-1; //start with last element

  while (shuffleIndex >= 0)
  {
    let index = Math.floor(Math.random()*shuffleIndex);

    temp = shuffled[shuffleIndex];
    shuffled[shuffleIndex] = shuffled[index];
    shuffled[index] = temp;
    shuffleIndex--;
  }
  return shuffled;
};

//append the cards to the game board
const showCards = function(shuffledArr){
  for (let i=0; i<CARD_NUM; i++)
  {
    openedCardDiv = document.createElement('div');
    closedCardDiv = document.createElement('div');
    flipAction = document.createElement('button');
    cardDiv = document.createElement('div');


    openedCardDiv.classList.add("openedCard");
    openedCardDiv.style.backgroundColor = shuffledArr[i];

    closedCardDiv.classList.add("closedCard");
    closedCardDiv.innerHTML = "M";

    cardDiv.classList.add("card");
    cardDiv.appendChild(openedCardDiv);
    cardDiv.appendChild(closedCardDiv);

    cardDiv.addEventListener( 'click', flipCards);

    const parent = document.getElementsByClassName('game-side')[0];
    parent.appendChild(cardDiv);
  }
};

//flips card - if allowed
const flipCards = function(){
  //if two cards are already open, we cannot open a new card
  if (currentPair.length === 2)
    return false;

  //prevent flipping an already opened card
  if (!this.classList.contains('flipped'))
  {
    this.classList.toggle('flipped');
    let score = document.getElementById("scoreVal");
    score.innerHTML = Number(score.innerHTML)+1;
    currentPair.push(this);
  }

  //if we have two cards already opened, check if they match
  if (currentPair.length===2)
    checkMatch();
};

//checks if two cards match
const checkMatch = function(){
  const firstCardColor = currentPair[0].childNodes[0].style.backgroundColor;
  const secondCardColor = currentPair[1].childNodes[0].style.backgroundColor;

  //if the colors don't match, flip them over after 1s
  if (firstCardColor !== secondCardColor)
  {
    setTimeout(function(){
      currentPair[0].classList.toggle('flipped');
      currentPair[1].classList.toggle('flipped');
      currentPair = [];
    }, 1000);
  }
  //else leave them open, and check if all cards have been opened
  else if (firstCardColor === secondCardColor){
    matchedCards+=2;
    currentPair = [];

    checkEndGame();
  }
};

//checks if all cards have been matched
const checkEndGame = function(){
  if(matchedCards===CARD_NUM)
  {
    //display winning message
    addWinningMessage();

    //add or update highscore cookie as necessary
    updateRecord();
  }
};

//displays 'You win!' when game ends
const addWinningMessage = function(){
  const winMessage = document.createElement('h1');
  const winMessageWrap = document.createElement('div');
  const gameBoard = document.getElementsByClassName('game-side')[0];
  winMessageWrap.id = "winMsgWrapper";
  winMessage.innerHTML = "You won!";
  winMessage.id = "winMsg";
  winMessageWrap.appendChild(winMessage);
  gameBoard.appendChild(winMessageWrap);
};

//checks and updates high score as necessary
const updateRecord = function(){
  let score = document.getElementById("scoreVal").innerHTML;

  if (document.cookie.length>0)
  {
    let currentHighIndex = document.cookie.indexOf("highscore=");
    let currentHigh = document.cookie.slice(currentHighIndex);
    if (score < currentHigh)
    {
      document.getElementById('highscore').innerHTML = "High Score: "+score;
      document.cookie="highscore="+score;
    }
  }
  else {
    document.getElementById('highscore').innerHTML = "High Score: "+score;
    document.cookie="highscore="+score;
  }
};
