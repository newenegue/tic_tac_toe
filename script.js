//--------------------------------------------------
// Initialize global variables
//--------------------------------------------------
// player toggle
var p = 0;

var newGame = true;

// player tracker
var p0 = [];
var p1 = [];

// number of players
var pNum = 0;

// winner track
var winner = false;

// all winning combinations
winningCombos = new Array(
   new Array(0, 1, 2),
   new Array(3, 4, 5),
   new Array(6, 7, 8),
   new Array(0, 3, 6),
   new Array(1, 4, 7),
   new Array(2, 5, 8),
   new Array(0, 4, 8),
   new Array(2, 4, 6)
  );

// cell ranking for A.I.
cellRank = [3,2,3,2,4,2,3,2,3];

//--------------------------------------------------
// initEvents()
// initialize mouse click event handler for divs
//--------------------------------------------------
function initEvents() {
	var cells = document.getElementsByClassName('cell');
	for (var i = 0; i < cells.length; i++) {
		cells[i].onclick=clickCell;
	}
}

//--------------------------------------------------
// resetAll()
// Re-initialize and reset board
//--------------------------------------------------
function resetAll() {
	// if(newGame){
	// 	showSettings();
	// 	newGame = false;
	// 	// console.log(pNum);
	// 	// console.log(newGame);
	// }
	// else{
		console.log("reset all");
		p = 0;
		p0 = [];
		p1 = [];
		cellRank = [3,2,3,2,4,2,3,2,3];
		// pNum = 0;
		winner = false;
		newGame = true;
		for(i = 0; i <= 8; i++){
			document.getElementById(i).className = "cell";
		}
		return true;
	// }
}

function selectGame() {
	var start = document.getElementsByClassName("startGame")[0];
	var select = document.getElementsByClassName("selectGame");
	var onePlayer = document.getElementsByClassName("selectGame")[1];
	var twoPlayer = document.getElementsByClassName("selectGame")[2];
	start.style.display = 'none';
	for( var i = 0; i < select.length; i++) {
		select[i].style.display = 'block';
	}
}

function showSettings() {
	console.log(document.getElementsByClassName('settings')[0]);
	document.getElementsByClassName('overlay')[0].style.display = 'block';
	document.getElementsByClassName('settings')[0].style.display = 'block';
}

function closeSettings() {
	document.getElementsByClassName('overlay')[0].style.display = 'none';	
	document.getElementsByClassName('settings')[0].style.display = 'none';
}

//--------------------------------------------------
// checkPlayers()
// check radio buttons for number of players
//--------------------------------------------------
function checkPlayers(){
	var radio = document.getElementsByName('numPlayers');
	var rLength = radio.length;

	if(pNum === 0){
		for(var i = 0; i < rLength; i++){
			if(radio[i].checked){
				pNum = radio[i].value;
				return true;
			}
		}
	}
}

function setPlayers(players) {
	pNum = players;
	var select = document.getElementsByClassName('selectGame');
	for( var i = 0; i < select.length; i++) {
		select[i].style.display = 'none';
	}
}

//--------------------------------------------------
// emptyCell()
// check if cell is already selected
//--------------------------------------------------
function emptyCell() {
	if(this.className==='cell'){
		return true;
	}
	else {
		return false;
	}
}

//--------------------------------------------------
// isFull()
// check if all cells have been played
//--------------------------------------------------
function isFull() {
	var totLength = p0.length + p1.length;
	if(totLength == 9 && winner === false){
		alert("Draw");
		// resetAll();
		return true;
	}
	return false;
}

//--------------------------------------------------
// switchUser()
// switch user turn
//--------------------------------------------------
function switchUser() {
	p = p === 0 ? 1 : 0;
	return true;
}

//--------------------------------------------------
// demoteCell()
// AI cell rank demotion
//--------------------------------------------------
function demoteCell(cell_id) {
	cellRank[cell_id] -= 99;
	return true;
}

//--------------------------------------------------
// markCell()
// change the color of a cell based on the player
// adds a new class to the cell div
//--------------------------------------------------
function markCell(player, cell_id) {
	var selectCell = document.getElementById(cell_id);
	var cellId = parseInt(cell_id,10);
	if(player === 0){
		// add class to html div
		selectCell.className += " p0";

		// add to p0 array
		p0.push(cellId);
		return true;
	}
	else if(player == 1) {
		// add class to html div
		selectCell.className += " p1";

		// add to p1 array
		p1.push(cellId);
		return true;
	}
	return false;
}

//--------------------------------------------------
// showWinner()
// change player winning combo image
//--------------------------------------------------
function showWinner(wCells) {
	var winClass = "cell p" + p + "_win";
	// make all cells unclickable
	for(j = 0; j < cellRank.length; j++){
		if(document.getElementById(j).className == 'cell')
			document.getElementById(j).className += ' ';
	}
	// greyscale other player cells
	for(var j = 0; j < p0.length; j++){
		document.getElementById(p0[j]).className += ' p0_bw';
	}
	for(j = 0; j < p1.length; j++){
		document.getElementById(p1[j]).className += ' p1_bw';
	}
	// switch images for winning combo
	for(var i = 0; i < wCells.length; i++){
		document.getElementById(wCells[i]).className = winClass;
	}
}

//--------------------------------------------------
// checkWinner()
// check for winning conditions
//--------------------------------------------------
function checkWinner() {

	// for player 1 and AI cell selection
	var empty = [];
	var taken = [];
	var i,j,k;
	for(i = 0; i < winningCombos.length; i++){
		// j = i % 3 [0-2]
		empty = [];
		taken = [];
		for(j = 0; j < winningCombos[i].length; j++){
			// taken and empty cell list
			if(p0.indexOf(winningCombos[i][j]) > -1){
				taken.push(winningCombos[i][j]);
			}
			else{
				empty.push(winningCombos[i][j]);
			}
		}
		// increase cellRank for AI
		if(taken.length == 2 && cellRank[empty[0]] > 0){
			cellRank[empty[0]] = 10;
		}
		else if(taken.length == 3){
			showWinner(taken);
			winner = true;
			return winner;
		}
			
	}

	// player 2 or computer winning combo check
	for(i = 0; i < winningCombos.length; i++){
		taken=[];
		for(k = 0; k < winningCombos[i].length; k++){
			if(p1.indexOf(winningCombos[i][k]) == -1){
				break;
			}
			else{
				taken.push(winningCombos[i][k]);
			}
		}
		if(k == winningCombos[i].length){
			showWinner(taken);
			winner = true;
			return winner;
		}
	}

	return winner;
}

//--------------------------------------------------
// clickCell()
// on click of cell
//--------------------------------------------------
function clickCell() {
	
	var id = this.id;
	checkPlayers();
	
	if(emptyCell.call(this) === true) {
		console.log(pNum);
		// single player
		if(pNum == 1){
			markCell(p, id);
			demoteCell(id);
			if(!checkWinner()){
				switchUser();
				// find max priority cell
				var aiCell = cellRank.indexOf(Math.max.apply(Math, cellRank));
				markCell(1, aiCell);
				demoteCell(aiCell);
				checkWinner();
				switchUser();
			}
		}
		// two player
		else if(pNum == 2) {
			markCell(p, id);
			if(p0.length >= 3 || p1.length >= 3){
				checkWinner();
			}
			switchUser();
		}
		else{
			// alert('Number of players not selected!');
		}
	}
	else{
		// animated css for click response
	}
	isFull();
}


