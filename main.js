function Board($scope) {
	$scope.boardArray = [['','',''],['','',''],['','','']];
	var turn = {val:false};
	

	// check turn true or false to set X or O
	// if cell is empty then replace it with X or O
	// if cell is not empty, then replace it will the same player piece
	$scope.turn = function(row, i) {
		row[i]=(row[i]==='' ? ((turn.val = !turn.val) ? 'X':'O') : row[i]);
	};
}