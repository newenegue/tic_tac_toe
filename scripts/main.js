var boardApp = angular.module("BoardApp", ["firebase"]);

boardApp.controller("BoardCtrl", function($scope, $firebase){
	// Firebase variables
	var ticTacToeRef = new Firebase("https://ticmactoe.firebaseio.com/");
	$scope.ticTacToe = $firebase(ticTacToeRef);

	// Local Browser, Global Variable holder for selected piece
	$scope.myPiece='';

	//====================================================================
	// Firebase functions
	//====================================================================	
	$scope.ticTacToe.$on("loaded", function() {
		dbItems = $scope.ticTacToe.$getIndex();
		if(dbItems.length < 1)
		{
			$scope.ticTacToe.$add({
				board: [['','',''],['','',''],['','','']],
				aiPriority: [[3,2,3],[2,4,2],[3,2,3]],
				game: {
					inProgress:false,
					draw:false,
					pNum:2,
					mode:2,
					catsCount:0,
					playerSet:false
				},
				player: {
					turn:false,
					win:false,
					piece:false
				},
				menu: {
					overlay:true,
					play:true,
					selectGame:false,
					selectPiece:false,
					settings:false,
					newGame:false
				},
				newGame: 'game',
				settings: 'settings'
			});

			$scope.ticTacToe.$on("change", function() {
				dbItems = $scope.ticTacToe.$getIndex();
				$scope.ttt = $scope.ticTacToe.$child(dbItems[0]);
			});
		}
		else
		{
			$scope.ttt = $scope.ticTacToe.$child(dbItems[0]);
			// $scope.ttt.menu.play = true;
			// console.log(ticTacToeRef.child(dbItems[0]).child('game').child('inProgess'));
			// ticTacToeRef.child(dbItems[0]).child('menu').set({
			// 		overlay:true,
			// 		play:true,
			// 		selectGame:false,
			// 		selectPiece:false,
			// 		settings:false,
			// 		newGame:false
			// 	});
		}
	});

	$scope.$watch("ttt.game.playerSet", function(newVal, oldVal){
		if(newVal === 0) {
			$scope.myPiece = '';
			console.log('Reset myPiece to ' + $scope.myPiece);
		}
		console.log('oldVal: ' + oldVal);
		console.log('newVal: ' + newVal);
		console.log('----------------------------');
	});

	//====================================================================
	// Global $scope functions in BoardCtrl
	//====================================================================

	//-------------------------------------------------
	// Reset board
	//-------------------------------------------------
	$scope.reset = function() {
		// reset only if settings overlay is off
		if(!$scope.ttt.menu.settings){
			if($scope.ttt.player.win){
				// two player - winner plays first next game
				if($scope.ttt.game.pNum >= 2)
					$scope.ttt.player.turn = !$scope.ttt.player.turn;
				// single player - always let user go first
				else if ($scope.ttt.game.pNum == 1) {
					$scope.ttt.player.turn = $scope.ttt.player.piece;
				}
			}
			$scope.ttt.board = [['','',''],['','',''],['','','']];
			$scope.ttt.game.draw = false;
			$scope.ttt.game.coco_wins = false;
			$scope.ttt.game.hazel_wins = false;
			$scope.ttt.game.inProgress = true;
			$scope.ttt.player.win = false;
			$scope.ttt.aiPriority = [[3,2,3],[2,4,2],[3,2,3]];
			$scope.ttt.menu.overlay = false;
			$scope.ttt.newGame = 'game';
			$scope.ttt.settings = 'settings';
			$scope.ttt.catsCount = 0;
		}
		dbSave();
	};

	$scope.dbReset = function() {
		$scope.ttt.game.playerSet = 0;
		$scope.reset();
	};

	//-------------------------------------------------
	// Display game settings
	//-------------------------------------------------
	$scope.openSettings = function() {
		if(!$scope.ttt.menu.settings){
			$scope.ttt.menu = {overlay:true, play:false, selectGame:true, selectPiece:false, settings:true, newGame:true};
			$scope.ttt.settings = 'settings \u2022';
			// game mode holder
			$scope.ttt.game.mode = $scope.ttt.game.pNum;
		}
		else {
			$scope.ttt.menu = {overlay:false, play:false, selectGame:false, selectPiece:false, settings:false, newGame:true};
			$scope.ttt.settings = 'settings';
			// keep overlay on if game is over
			$scope.ttt.menu.overlay = !$scope.ttt.game.inProgress ? true : false;
			// set game mode back to in progess game
			$scope.ttt.game.pNum = $scope.ttt.game.mode;
		}
		dbSave();
	};

	//-------------------------------------------------
	// Menu toggle
	//-------------------------------------------------
	$scope.switchMenu = function() {
		var g = $scope.ttt.game;
		var p = $scope.ttt.player;
		var m = $scope.ttt.menu;
		// initial Play button
		if(m.play){
			m.play = !m.play;
			m.selectGame=!m.selectGame;
		}
		else {
			// game mode 
			if(m.selectGame) {
				m.selectGame = !m.selectGame;
				m.selectPiece = !m.selectPiece;
				// update multiMode in DB
				// ticTacToeRef.child(dbItems[0]).child('game').child('multiMode').set(3);
			}
			else {
				// player piece
				if(m.selectPiece){
					p.piece = p.turn;
					m.selectPiece = !m.selectPiece;
					m.overlay = !m.overlay;
					m.settings = false;
					m.newGame = true;
					if(!g.inProgress){
						g.inProgress = true;
					}
					else{
						$scope.dbReset();
					}
						
				}
			}
		}
		dbSave();
	};

	//-------------------------------------------------
	// On click of each cell place piece
	//-------------------------------------------------
	$scope.turn = function(row,col) {
		// initialize local variables
		var b = $scope.ttt.board;
		var p = $scope.ttt.player;
		var g = $scope.ttt.game;
		var m = $scope.ttt.menu;
		var aiP = $scope.ttt.aiPriority;
		// if($scope.ttt.game.playerSet <= 1){
			// $scope.myPiece = '';
		// }
		console.log('myTurn: ' + myTurn());
		console.log('playerSet: ' + $scope.ttt.game.playerSet);
		if(isEmpty(row, col) && (initMove() || myTurn())) {
			placePiece(row, col);
			aiDemote(row, col);
			checkWin(b,g,p,m);

			// AI
			if(g.pNum == 1 && !p.win){
				aiTurn(b,p,aiP);
				checkWin(b,g,p,m);
			}
		}
		else {
			b[row][col] = b[row][col];
		}
		console.log('myPiece: ' + $scope.myPiece);
		dbSave();
	};

	$scope.lockScreen = function() {
		if($scope.myPiece==='' && $scope.ttt.game.playerSet >= $scope.ttt.game.pNum)
			return true;
		else
			return false;
	};

	$scope.removeLock = function() {
		
	}

	//====================================================================
	// Local functions in BoardCtrl
	//====================================================================

	function initMove() {
		var initBoard = !$scope.ttt.board.join().match(currentPiece());
		if(initBoard && $scope.myPiece==='' && $scope.ttt.game.playerSet < $scope.ttt.game.pNum) {
			$scope.myPiece = currentPiece();
			// $scope.ttt.game.playerSet = true;
			$scope.ttt.game.playerSet++;
			return initBoard;
		}
		else {
			return false;
		}
	}


	function currentPiece(){
		return $scope.ttt.player.turn ? 'X':'O';
	}

	function myTurn() {
		return currentPiece() == $scope.myPiece;
	}

	//-------------------------------------------------
	// Save to Firebase
	//-------------------------------------------------
	function dbSave() {
		// if($scope.ttt.game.pNum > 2)
			$scope.ttt.$save();
	}

	//-------------------------------------------------
	// Check if cell is empty
	//-------------------------------------------------
	function isEmpty(row, col){
		var b = $scope.ttt.board;
		return b[row][col]==='';
	}

	//-------------------------------------------------
	// Switch player turns
	//-------------------------------------------------
	function changeTurn() {
		$scope.ttt.player.turn = !$scope.ttt.player.turn;
	}

	//-------------------------------------------------
	// Place piece on board
	//-------------------------------------------------
	function placePiece(row, col) {
		var b = $scope.ttt.board;
		var p = $scope.ttt.player;
		b[row][col] = currentPiece();
		changeTurn();
		$scope.ttt.catsCount++;
	}

	//-------------------------------------------------
	// AI cell demotion
	//-------------------------------------------------
	function aiDemote(row, col) {
		$scope.ttt.aiPriority[row][col] -= 100;
	}

	//-------------------------------------------------
	// AI cell promotion
	//-------------------------------------------------
	function aiPromote(row, col) {
		$scope.ttt.aiPriority[row][col] += 10;
	}

	//-------------------------------------------------
	// AI turn to play
	//-------------------------------------------------
	function aiTurn(b, p, aiP){
		var temp = [];
		// find max value in each row in aiPriority
		for(var i = 0; i < aiP.length; i++) {
			temp[i] = Math.max.apply(Math,aiP[i]);
		}
		// find row index 
		var maxRow = temp.indexOf(Math.max.apply(Math,temp));
		// find col index
		var maxCol = aiP[maxRow].indexOf(temp[maxRow]);
		placePiece(maxRow, maxCol);
		aiDemote(maxRow, maxCol);
	}

	//-------------------------------------------------
	// AI picks next move
	//-------------------------------------------------
	function aiChoice(row, col){
		var user = $scope.ttt.player.piece ? 'X' : 'O';
		var b = $scope.ttt.board;
		var taken = [];
		var empty = [];

		// store all empty and taken cells
		for(var i = 0; i < 3; i++) {
			if(row != -1) {
				if(b[row][i] == user)
					taken.push(i);
				else if(b[row][i] === '')
					empty.push(i);
			}
			else if(col != -1) {
				if(b[i][col] == user)
					taken.push(i);
				else if(b[i][col] === '')
					empty.push(i);
			}
			
		}
		// promote AI if user is about to win
		if(empty.length == 1 && taken.length == 2) {
			if(row != -1)
				aiPromote(row, empty[0]);
			else if(col != -1)
				aiPromote(empty[0], col);
		}
	}

	//-------------------------------------------------
	// Check for winner
	//-------------------------------------------------
	function checkWin(b,g,p,m) {
		for(var i = 0; i < b.length; i++){
			// horiz win
			if(!p.win) {
				p.win = (b[i][0]==b[i][1] && b[i][1]==b[i][2] && !isEmpty(i,0)) ? true : false;
				if(!p.win) {
					aiChoice(i, -1);
					// vert win
					p.win = (b[0][i]==b[1][i] && b[1][i]==b[2][i] && !isEmpty(0,i)) ? true : false;
					if(!p.win){
						aiChoice(-1, i);
						// diag win
						if(!isEmpty(1,1)){
							p.win = (b[0][0]==b[1][1] && b[1][1]==b[2][2]) ? true : false;
							if(!p.win) {
								p.win = (b[2][0]==b[1][1] && b[1][1]==b[0][2]) ? true : false;
								if(p.win){ b[1][1] = 'W'; b[2][0] = b[1][1]; b[0][2] = b[2][0]; }
							}
							else{ b[1][1] = 'W'; b[0][0] = b[1][1]; b[2][2] = b[0][0]; }
						}
					}// end diag win
					else { b[0][i] = 'W'; b[1][i] = b[0][i]; b[2][i] = b[1][i]; }
				} // end vert win
				else { b[i][0] = 'W'; b[i][1] = b[i][0]; b[i][2] = b[i][1]; }
			} // end horiz win
		} // end for loop
		// announce results of game
		if(g.inProgress) {
			if(p.win) {
				$scope.ttt.newGame = 'game?';
				m.overlay = true;
				g.inProgress = false;
			}
			else if ($scope.ttt.catsCount >= 9) {
				g.draw = true;
				$scope.ttt.newGame = 'game?';
				m.overlay = true;
				g.inProgress = false;
			}
		}
	}	// end checkWin()
}); // end BoardCtrl

