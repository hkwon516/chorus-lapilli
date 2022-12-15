import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

function Square(props) {
  return (
    <button className="square" onClick={props.onClick}>
      {props.value}
    </button>
  );
}

class Board extends React.Component {
  renderSquare(i) {
    return (
      <Square
        value={this.props.squares[i]}
        onClick={() => this.props.onClick(i)}
      />
    );
  }

  render() {
    return (
      <div>
        <div className="board-row">
          {this.renderSquare(0)}
          {this.renderSquare(1)}
          {this.renderSquare(2)}
        </div>
        <div className="board-row">
          {this.renderSquare(3)}
          {this.renderSquare(4)}
          {this.renderSquare(5)}
        </div>
        <div className="board-row">
          {this.renderSquare(6)}
          {this.renderSquare(7)}
          {this.renderSquare(8)}
        </div>
      </div>
    );
  }
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      history: [{
        squares: Array(9).fill(null)
      }],
      xIsNext: true,
      stepNumber: 0,
      moveMarker: false,
      moveMarkerId: null,
      updateBoard: 1,
      winningMoves: null,
    };
  }
//
  handleClick(i) {
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    const squares = current.squares.slice();
    if (!this.state.moveMarker){
      if (calculateWinner(squares) || squares[i]) {
        return;
      } else{
        squares[i] = this.state.xIsNext ? 'X' : 'O';
        this.setState({
          updateBoard: Boolean(this.state.stepNumber===5) ? 0 : 1,
        });
      }
    }
    else{
      if (squares[i]==null && this.state.moveMarkerId==null ||
        this.state.moveMarkerId===i || calculateWinner(squares)){
        return;
      }
      else if (this.state.moveMarkerId==null){
        let match = Boolean(squares[i] === (this.state.xIsNext ? 'X' : 'O')); // F
        if (!match){
          return;
        }
        // only can move your own pieces when its your turn.
        // only can pick a piece that results in a winning move with a
        // piece in the central square, or move the central sqaure itself
        let good = false;
        let next = this.state.xIsNext ? 'X' : 'O';
        let central = squares[4] === next; // T
        let legal = acceptableMoves(i);
        // check for possible moves
        for(var p=0; p<legal.length; p++){
          let pos = legal[p];
          if (squares[pos] === null){
            good = true; // T
          }
        }
        // check for winning moves in the case of occupying central square
        let win = null;
        if (central && i!==4){
          win = winningMove(squares, this.state.xIsNext, i);
          if (win==null){
            return;
          }
        }
        // no ways to win from chosen piece and occupy central
        // update this as piece to move if ways to win exist
        // while central is occupied by player
        if (win!=null && central){
          this.setState({
            moveMarkerId: i,
            winningMoves: win,
            updateBoard: 1,
          });
        } 
        else {
          if (good){
          this.setState({
            moveMarkerId: i,
            winningMoves: null,
            updateBoard: 1,
          });
          return;
          }
        }
      } else{
        let good = false;
        let legal = acceptableMoves(this.state.moveMarkerId);
        for (p=0; p < legal.length; p++){
          if (legal[p]===i && squares[legal[p]]===null){
            good = true;
            break;
          }
        }
        if (this.state.winningMoves != null){
          // need to have this conditon satisfied if the cenbtral square is
          // filled, not relying on move exists
          good = false;
          for (p=0; p < this.state.winningMoves.length; p++){
            if (this.state.winningMoves[p] === i){
              good = true;
            }
          }
        }
        if (good){
          let temp = squares[this.state.moveMarkerId];
          squares[this.state.moveMarkerId] = null;
          squares[i] = temp;
          this.setState({
              moveMarkerId: null,
              updateBoard: 0,
          });
        }
        else{
          return;
        }
        // using the moveMarkerId value, take the object at that position
        // swap the two, sending the null value to the old position 
        // and the object to the new position
        // set updateBoard to be true
        // set moveMarkerId to be null
      }
    }
    if (this.state.updateBoard){
      this.setState({
        history: history.concat([{
          squares: squares
        }]),
        stepNumber: history.length,
        xIsNext: !this.state.xIsNext,
        moveMarker: this.state.stepNumber + 1 > 5,
        // uses current step number, not the updated one since its in the
        // setState function
      });
    }
  }

  jumpTo(step) {
    this.setState({
      stepNumber: step,
      xIsNext: (step%2) === 0,
      moveMarker: step > 5,
      moveMarkerId: null,
      updateBoard: 1,
    });
  }

  render() {
    const history = this.state.history;
    const current = history[this.state.stepNumber];
    const winner = calculateWinner(current.squares);

    const moves = history.map((step, move) => {
      const desc = move ?
        'Go to move #' + move :
        'Go to game start';
      return (
        <li key={move}>
          <button 
          onClick={() => this.jumpTo(move)}>{desc}
          </button>
        </li>
      );
    });

    let status;
    if (winner) {
      status = 'Winner: ' + winner;
    } else {
      status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
    }

    return (
      <div className="game">
        <div className="game-board">
          <Board
            squares={current.squares}
            onClick={(i) => this.handleClick(i)}
          />
        </div>
        <div className="game-info">
          <div>{status}</div>
          <div>{"Id: " + this.state.moveMarkerId}</div>
          <div>{"status: " + this.state.updateBoard}</div>
          <div>{"history: " + this.state.stepNumber}</div>
          <div>{"moves: " + acceptableMoves(this.state.moveMarkerId)}</div>
          <div>{"moveMarker: " + this.state.moveMarker}</div>
          <div>{"Winning Moves: " + this.state.winningMoves}</div>
          <ol>{moves}</ol>
        </div>
      </div>
    );
  }
}

// ========================================

ReactDOM.render(
  <Game />,
  document.getElementById('root')
);

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  return null;
}

function acceptableMoves(i){
  let moves;
  if (i===0){
    moves = [1,3,4];
  } else if(i===1){
    moves=[0,2,3,4,5];
  } else if(i===2){
    moves=[1,4,5];
  } else if(i===3){
    moves=[0,1,4,6,7];
  } else if(i===4){
    moves=[0,1,2,3,5,6,7,8];
  } else if(i===5){
    moves=[1,2,4,7,8];
  } else if(i===6){
    moves=[3,4,7];
  } else if(i===7){
    moves=[3,4,5,6,8];
  } else{
    moves=[4,5,7];
  }
  return moves;
}

function winningMove(squares, turn, movingId){
  // finding all the legal moves and putthing them in a list
  let possible=[];
  let legal = acceptableMoves(movingId);
  for(var p=0; p<legal.length; p++){
    if (squares[legal[p]] === null){
      possible.push(legal[p]);
    }
  }
  let winning=[];
  for (p=0; p < possible.length; p++){
    let t = squares.slice();
    t[movingId] = null;
    t[possible[p]]=turn ? 'X' : 'O';
    if (calculateWinner(t) !== null){
      winning.push(possible[p]);
    }
  }
  if (winning.length===0){
    return null;
  } else {
    return winning;
  }
}