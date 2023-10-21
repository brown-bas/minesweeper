let table = []
let mines = []
let marked = []
let tableW = 10, tableH = 10, mineAmount = 10;

//Define the button container and set CSS variables
const buttonContainer = document.getElementById("buttonContainer")
const infoContainer = document.getElementById("info")
const infoOutcome = infoContainer.getElementsByTagName("h1")[0]
const infoLastMove = infoContainer.getElementsByTagName("p")[0]
const infoReload = infoContainer.getElementsByTagName("button")[0]
let cssRoot = document.querySelector(':root').style
cssRoot.setProperty('--buttons-x', tableW)
cssRoot.setProperty('--buttons-y', tableH)
infoReload.onclick = () => {window.location.reload()}

startGame();

function startGame(){
  generateRandomMinePos();
  generateTable();
  displayInDOM();
}

//Generates random coordinates to put the mines on
function generateRandomMinePos(){
  for (let i = 0; i < mineAmount; i++) {
    let randomNumX, randomNumY, foundFreePos = false
  
    while (!foundFreePos) {
      randomNumX = Math.floor(Math.random() * tableW)
      randomNumY = Math.floor(Math.random() * tableH)
  
      if(!checkIfMine(randomNumX, randomNumY)){
        mines.push([randomNumX, randomNumY])
        foundFreePos = true
      }
    }
  }
}

//Generates the table (mines must be generated before running)
function generateTable(){
  for (let n = 0; n < tableH; n++) {
    let tmp_table = []
    for (let m = 0; m < tableW; m++) {
      checkIfMine(m, n) ? tmp_table.push(1) : tmp_table.push(0)
    }
    table.push(tmp_table)
  }
}

//Displays the game in the browser based on the table
function displayInDOM(){
  for (let n = 0; n < table.length; n++) {
    for (let m = 0; m < table[n].length; m++) {
      let button = document.createElement("button")
      button.addEventListener("click", (e)=>{handleClick(e, m, n)})
      //button.textContent = (((tableW * n-1) + m)) + 1
      buttonContainer.append(button)
    }
  }
}

//Button click handler
function handleClick(e, posX, posY){
  let hasBeenMarked = marked.filter(x=>x[0] == posX && x[1] == posY).length
  let currentButton = buttonContainer.children[(((tableW * posY-1) + posX)) + 1]
  if(e.ctrlKey && !currentButton.classList.contains("revealed")){
    //Marker click
    currentButton.classList.toggle("marked")
    if(hasBeenMarked){
      //Coord has been marked
      marked.splice(marked.indexOf([posX, posY]), 1)
      console.log(`${posX} ${posY} unmarked!`)
      if(marked.map(x=>mines.map(y=>x==y)).length == mines.length){
        gameOver(posY, posX, true)
      }
    } else {
      //Coord hasn't been marked yet
      marked.push([posX, posY])
      console.log(`${posX} ${posY} marked!`)
      if(marked.map(x=>mines.map(y=>x==y)).length == mines.length){
        gameOver(posY, posX, true)
      }
    }
  } else {
    //Normal click
    if(!currentButton.classList.contains("marked") && !currentButton.classList.contains("revealed")){
      reveal(posX, posY)
      if(checkIfMine(posX, posY)) gameOver(posX, posY, false)
    }
  }
}

//Makes things easier, checks if there's a mine on the coord
function checkIfMine(posX, posY){
  return mines.filter(x=>(x[0] == posX && x[1] == posY)).length
}

//Name speaks for itself
function gameOver(posX, posY, won){
  for (let i = 0; i < buttonContainer.childElementCount; i++) {
    let currentButtonY = Math.floor(i / tableW)
    let currentButtonX = (i - (currentButtonY * tableW))
    buttonContainer.children[i].setAttribute("tabindex", "-1")
    reveal(currentButtonX, currentButtonY)
  }
  if(won){
    infoOutcome.textContent = "You won!";
    infoLastMove.textContent = "You managed to find all of the mines!";
    buttonContainer.style.pointerEvents = "none";
    buttonContainer.style.opacity = "0.5";
  } else {
    infoOutcome.textContent = "You lost!";
    infoLastMove.textContent = `There was a mine at ${posX+1}; ${posY+1}`;
    buttonContainer.style.pointerEvents = "none";
    buttonContainer.style.opacity = "0.5";
  }
  infoReload.textContent = "Rematch";
}

//Checks the surroudings of the currently clicked coord
function checkSurroundings(posX, posY){
  let surroundings = [];
  console.log(posX, posY)
  if(posY != 0){
    surroundings.push(table[posY-1][posX])
  }
  if(posY != tableH-1){
    surroundings.push(table[posY+1][posX])
  }
  if(posX != 0){
    surroundings.push(table[posY][posX-1])
  }
  if(posX != tableW-1){
    surroundings.push(table[posY][posX+1])
  }
  return surroundings
}

//Reveals if the coords has a mine on it or it's close to a mine
function reveal(posX, posY){
  let currentButton = buttonContainer.children[(((tableW * posY-1) + posX)) + 1]
  if (!currentButton.classList.contains("revealed")){
    currentButton.textContent = checkSurroundings(posX, posY).filter(x=>x==1).length
    if(checkIfMine(posX, posY)){
      currentButton.textContent = "Boom"
      currentButton.classList.add("marked")
    } else {
      currentButton.classList.add("revealed")
    }
    infoOutcome.textContent = `Awaiting next moves...`
    infoLastMove.textContent = `${posX+1}; ${posY+1} revealed!`
  }
}