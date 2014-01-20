// TO DO
// display which player gets first move?
// display whos turn it is?
// display text of winner?
// use player.piece to know which one is the user
// check only on those pieces

function BoardCtrl($scope) {
	// $scope variables
	$scope.board = [['','',''],['','',''],['','','']];
	$scope.game = {inProgress:false, draw:false, coco_wins:false, hazel_wins:false, pNum:2, mode:2};
	$scope.player = {turn:false, win:false, piece:false};
	$scope.aiPriority = [[3,2,3],[2,4,2],[3,2,3]];
	$scope.menu = {overlay:true, play:true, selectGame:false, selectPiece:false, settings:false, newGame:false};
	$scope.newGame = 'game';
	$scope.settings = 'settings';

	// Global variables in BoardCtrl
	var catsCount = 0;

	// var taken = [];
	// var empty = [];

	//====================================================================
	// Global $scope functions in BoardCtrl
	//====================================================================
	
	//-------------------------------------------------
	// Reset board
	//-------------------------------------------------
	$scope.reset = function() {
		if(!$scope.menu.settings){
			if($scope.player.win){
				// two player - winner plays first next game
				if($scope.game.pNum == 2)
					$scope.player.turn = !$scope.player.turn;
				// single player - always let user go first
				else if ($scope.game.pNum == 1) {
					$scope.player.turn = $scope.player.piece;
				}
			}
			$scope.board = [['','',''],['','',''],['','','']];
			$scope.game.draw = false;
			$scope.game.coco_wins = false;
			$scope.game.hazel_wins = false;
			$scope.game.inProgress = true;
			$scope.player.win = false;
			$scope.aiPriority = [[3,2,3],[2,4,2],[3,2,3]];
			$scope.menu.overlay = false;
			$scope.newGame = 'game';
			$scope.settings = 'settings';
			catsCount = 0;
		}
	};

	//-------------------------------------------------
	// Display game settings
	//-------------------------------------------------
	$scope.openSettings = function() {
		if(!$scope.menu.settings){
			$scope.menu = {overlay:true, play:false, selectGame:true, selectPiece:false, settings:true, newGame:true};
			$scope.game.mode = $scope.game.pNum;
			$scope.settings = 'settings \u2022';
		}
		else {
			$scope.menu = {overlay:false, play:false, selectGame:false, selectPiece:false, settings:false, newGame:true};
			$scope.menu.overlay = !$scope.game.inProgress ? true : false;
			$scope.game.pNum = $scope.game.mode;
			$scope.settings = 'settings';
		}
	};

	//-------------------------------------------------
	// Menu toggle
	//-------------------------------------------------
	$scope.switchMenu = function() {
		var g = $scope.game;
		var p = $scope.player;
		var m = $scope.menu;
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
			}
			else {
				// player piece
				if(m.selectPiece){
					p.piece = p.turn;
					m.selectPiece = !m.selectPiece;
					m.overlay = !m.overlay;
					m.settings = false;
					m.newGame = true;
					$scope.reset();
					if(!g.inProgress)
						g.inProgress = true;
				}
			}
		}
	};

	//-------------------------------------------------
	// On click of each cell place piece
	//-------------------------------------------------
	$scope.turn = function(row,col) {
		var b = $scope.board;
		var p = $scope.player;
		var g = $scope.game;
		var m = $scope.menu;
		catsCount += (b[row][col]==='') ? 1 : 0;
		b[row][col]=(b[row][col]==='' ? ((p.turn = !p.turn) ? 'X':'O') : b[row][col]);
		aiDemote(row, col);
		checkWin(b,g,p,m);
		// modify aiPriority based on users turn
		// demote users 
		if(g.pNum == 1 && !p.win){
			aiTurn(b,p);
			checkWin(b,g,p,m);
		}
	};

	//====================================================================
	// Local functions in BoardCtrl
	//====================================================================

	//-------------------------------------------------
	// AI cell demotion
	//-------------------------------------------------
	function aiDemote(row, col) {
		$scope.aiPriority[row][col] -= 100;
	}

	//-------------------------------------------------
	// AI cell promotion
	//-------------------------------------------------
	function aiPromote(row, col) {
		$scope.aiPriority[row][col] += 10;
	}

	//-------------------------------------------------
	// AI turn to play
	//-------------------------------------------------
	function aiTurn(b, p){
		var temp = [];
		var aiP = $scope.aiPriority;
		// find max value in each row in aiPriority
		for(var i = 0; i < aiP.length; i++) {
			temp[i] = Math.max.apply(Math,aiP[i]);
		}
		// find row index 
		var maxRow = temp.indexOf(Math.max.apply(Math,temp));
		// find col index
		var maxCol = aiP[maxRow].indexOf(temp[maxRow]);
		b[maxRow][maxCol]=(b[maxRow][maxCol]==='' ? ((p.turn = !p.turn) ? 'X':'O') : b[maxRow][maxCol]);
		aiDemote(maxRow, maxCol);
	}

	//-------------------------------------------------
	// Check for winner
	//-------------------------------------------------
	function checkWin(b,g,p,m) {
		for(var i = 0; i < b.length; i++){
			// horiz win
			if(!p.win) {
				p.win = (b[i][0]==b[i][1] && b[i][1]==b[i][2] && b[i][0]!=='') ? true : false;
				if(!p.win) {
					// vert win
					p.win = (b[0][i]==b[1][i] && b[1][i]==b[2][i] && b[0][i]!=='') ? true : false;
					if(!p.win){
						if(b[1][1]!==''){
							// diag win
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
		if(p.win) { 
			if(g.inProgress){
				$scope.newGame = 'game?';
				if(p.turn) {
					g.coco_wins = true;
				}
				else {
					g.hazel_wins = true;
				}
			}
			m.overlay = true;
			g.inProgress = false;
		}
		else if (catsCount >= 9) {
			if(g.inProgress) {
				g.draw = true;
				m.overlay = true;
				$scope.newGame = 'game?';
				g.inProgress = false;
			}
		}
	}	// end checkWin()
} // end BoardCtrl