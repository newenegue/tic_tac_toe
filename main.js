function Board($scope) {
	$scope.board = [['','',''],['','',''],['','','']];
	$scope.player = {piece:false, turn:false, win:false};
	$scope.aiPriority = [[3,2,3],[2,4,2],[3,2,3]];
	var winningCombos = [
		[0,1,2],
		[3,4,5],
		[6,7,8],
		[0,3,6],
		[1,4,7],
		[2,5,8],
		[0,4,8],
		[2,4,6]
		];

	// var taken = [];
	// var empty = [];
	
	$scope.reset = function() {
		$scope.board = [['','',''],['','',''],['','','']];
		$scope.aiPriority = [[3,2,3],[2,4,2],[3,2,3]];
		$scope.player = {piece:false, turn:false, win:false};
	};

	// check turn true or false to set X or O
	// if cell is empty then replace it with X or O
	// if cell is not empty, then replace it will the same player piece
	$scope.turn = function(row,col) {
		var b = $scope.board;
		var p = $scope.player;
		b[row][col]=(b[row][col]==='' ? ((p.turn = !p.turn) ? 'X':'O') : b[row][col]);
		aiDemote(row, col);
		checkWin();
	};

	$scope.play = function() {
		
	};

	function aiDemote(row, col) {
		$scope.aiPriority[row][col] -= 100;
	}

	function checkWin() {
		var b = $scope.board;
		var p = $scope.player;
		var win = false;
		for(var i = 0; i < b.length; i++){
			// horiz win
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