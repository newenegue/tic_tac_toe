function BoardCtrl($scope) {
	// $scope variables
	$scope.board = [['','',''],['','',''],['','','']];
	$scope.player = {numOf:2, turn:false, win:false};
	$scope.aiPriority = [[3,2,3],[2,4,2],[3,2,3]];
	$scope.menu = {overlay:true, play:true, selectGame:false, selectPiece:false, settings:false, newGame:false};

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
		$scope.board = [['','',''],['','',''],['','','']];
		$scope.aiPriority = [[3,2,3],[2,4,2],[3,2,3]];
		$scope.player.win = false;
		$scope.menu.overlay = false;
		catsCount = 0;
	};

	//-------------------------------------------------
	// Display game settings
	//-------------------------------------------------
	$scope.openSettings = function() {
		if(!$scope.menu.settings){
			$scope.menu = {overlay:true, play:false, selectGame:true, selectPiece:false, settings:true, newGame:true};
		}
		else {
			$scope.menu = {overlay:false, play:false, selectGame:false, selectPiece:false, settings:false, newGame:true};
		}
	};

	//-------------------------------------------------
	// Hide game settings
	//-------------------------------------------------
	$scope.closeSettings = function() {
		$scope.menu = {overlay:false, play:false, selectGame:false, selectPiece:false, settings:false, newGame:true};
	};

	//-------------------------------------------------
	// Menu toggle
	//-------------------------------------------------
	$scope.switchMenu = function() {
		var m = $scope.menu;
		if(m.play){
			m.play = !m.play;
			m.selectGame=!m.selectGame;
		}
		else {
			if(m.selectGame) {
				m.selectGame = !m.selectGame;
				m.selectPiece = !m.selectPiece;
			}
			else {
				if(m.selectPiece){
					m.selectPiece = !m.selectPiece;
					m.overlay = !m.overlay;
					$scope.reset();
					m.settings = false;
					m.newGame = true;
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
		catsCount += (b[row][col]==='') ? 1 : 0;
		b[row][col]=(b[row][col]==='' ? ((p.turn = !p.turn) ? 'X':'O') : b[row][col]);

		// aiDemote(row, col);
		checkWin();
		announceWin();
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
	// Check for winner
	//-------------------------------------------------
	function checkWin() {
		var b = $scope.board;
		var p = $scope.player;
		for(var i = 0; i < b.length; i++){
			// horiz win
			if(!p.win) {
				p.win = (b[i][0]==b[i][1] && b[i][1]==b[i][2] && b[i][0]!=='') ? true : false;
				if(!p.win) {
					// vert win
					p.win = (b[0][i]==b[1][i] && b[1][i]==b[2][i] && b[0][i]!=='') ? true : false;
					if(!p.win){
						// diag win
						p.win = (b[1][1] !== '') ? ( ((b[0][0]==b[1][1] && b[1][1]==b[2][2]) || (b[2][0]==b[1][1] && b[1][1]==b[0][2]))  ? true : false) : null;
					}
				}
			}
		}
	}

	//-------------------------------------------------
	// Announce winner
	//-------------------------------------------------
	function announceWin() {
		var p = $scope.player;
		var m = $scope.menu;
		var winner = p.win ? ( (p.turn ? console.log('COCONUT wins') : console.log('HAZELNUT wins')), p.turn = !p.turn, m.overlay = true) : (catsCount >= 9 ? console.log('No Winner') : null);
	}
}