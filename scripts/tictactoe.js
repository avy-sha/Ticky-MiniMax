/*
jshint white: false
*/

/*
 * TicTacToe game, with the minimax algorithm
 * and also an algorithm i developed, its just the best responses to opening moves, i use it too, thats why i never lose a game :)
 * will only use it in 'level: hard', because its really impossible to defeat the AI while using bestResponses ;)
 *
 * Copyright(C) 2016, Sochima Biereagu
 * @KodeJuice
 */

// memoizer
Object.defineProperty(Function.prototype, "memoize", {
    writable: false,
    enumerable: false,
    configurable: true,
    value: function(...arg) {
        this._values = this._values || {};
        let args = [...arg],
            val;
        if (JSON.stringify(args) in this._values) {
            return this._values[JSON.stringify(args)];
        }

        this._values[JSON.stringify(args)] = this.apply(this, args);
        return this._values[JSON.stringify(args)];
    }
});

//return random item from an array
Object.defineProperty(Array.prototype, "rand", {
    writable: false,
    enumerable: false,
    configurable: true,
    value: function() {
        return this[~~(Math.random() * this.length)];
    }
});


class Tictac {

    constructor(level) {
            this.aiScore = 0;
            this.userScore = 0;
            this.draws = 0;
            this.pc = 0; //play count

            this.turn = 0; //0 for user, 1 for AI, used for play turn after game has ended
            this.level = level || "normal";
            this.aiTurn = false;
            this.gameIsWon = false;

            this.board = [
                "-", "-", "-",
                "-", "-", "-",
                "-", "-", "-"
            ];

            // this.playerLastMove;
            let dis = this;

            this.winPattern = [
                //horizontal
                [0, 1, 2],
                [3, 4, 5],
                [6, 7, 8],

                //vertical
                [0, 3, 6],
                [1, 4, 7],
                [2, 5, 8],

                //diagonal
                [0, 4, 8],
                [2, 4, 6]
            ];

            //my algorithm <^-^>
            const bestResponses = [
                [4], //0
                [0, 2, 4, 7], //1
                [4], //2
                [0, 6, 4, 5], //3
                [0, 2, 6, 8], //4
                [2, 8, 3, 4], //5
                [4], //6
                [6, 8, 1, 4], //7
                [4] //8
            ];

            //USAGE: fill(NUMBER, ITEM)
            //return an array with a length of NUMBER, and filled with ITEM
            this.fill = (c, itm) => [...Array(c)].fill(itm);

            //isTerminal
            //return true or false if board is filled up or game is won
            const isTerminal = (node) =>
                dis.gameWon("X", node) || dis.gameWon("O", node) || dis.boardFilled(node);

            /* AI MOVE GENERATOR */
            this.generateAImove = () => {
                switch (dis.level) {
                    case "easy":
                    {
                        if (dis.pc === 0) {
                            //prevent the AI from waisting time, when its the AI turn to play first
                            //just give a random move from 0-9

                            return Math.floor(Math.random() * 9);
                        } else if (dis.pc === 1) {
                            //if this move is going to be the 2nd, then the first was an opening move,
                            //give a random move from the best responses
                            //The AI itself will always return one of these moves, but it may take time,
                            //so why wait when we already have it.

                            return bestResponses[this.playerLastMove].rand();
                        } else {
                            return _move(6);
                        }}

                    case "normal":
                    {
                        if (dis.pc === 0) {
                            //prevent the AI from waisting time, when its the AI turn to play first
                            //just give a random move from 0-9

                            return Math.floor(Math.random() * 9);
                        } else if (dis.pc === 1) {
                            //if this move is going to be the 2nd, then the first was an opening move,
                            //give a random move from the best responses
                            //The AI itself will always return one of these moves, but it may take time,
                            //so why wait when we already have it.

                            return bestResponses[this.playerLastMove].rand();
                        } else {
                            return _move(6);
                        }}

                    case "hard":
                        {
                            if (dis.pc === 0) {
                                //prevent the AI from waisting time, when its the AI turn to play first
                                //just give a random move from 0-9

                                return Math.floor(Math.random() * 9);
                            } else if (dis.pc === 1) {
                                //if this move is going to be the 2nd, then the first was an opening move,
                                //give a random move from the best responses
                                //The AI itself will always return one of these moves, but it may take time,
                                //so why wait when we already have it.

                                return bestResponses[this.playerLastMove].rand();
                            } else {
                                return _move(6);
                            }
                        }
                } // switch
            }

            const _move = (depth) => {
                let nextStates = makeSubNodes.memoize(dis.board, dis.moves(), "O");
                let move = dis.moves()[0];
                let initialScore = -Infinity;

                for (let i = 0; i < nextStates.length; i += 1) {
                    let score = minimax.memoize(nextStates[i], depth, "X");
                    if (score > initialScore) {
                        move = (function() {
                            return dis.moves()[i];
                        })();

                        initialScore = score;
                    }
                }

                return move;
            }

            /* MINIMAX ALGORITHM */
            const minimax = (node, maxDepth, player) => {
                if (maxDepth === 0 || isTerminal(node)) {
                    //return heuristic value of this leaf node
                    return heuristic.memoize(node);
                }

                let bestValue, emptyCells, childNodes, v;
                if (player == "O") {
                    //maximizing player
                    bestValue = -Infinity; //lowest possible value
                    emptyCells = dis.moves(node);
                    childNodes = makeSubNodes(node, emptyCells, player);
                    for (let i = 0; i < childNodes.length; i += 1) {
                        v = minimax.memoize(childNodes[i], maxDepth - 1, "X");
                        bestValue = Math.max(bestValue, v);
                    }

                    return bestValue;
                } else {
                    //minimizing player, X
                    bestValue = +Infinity; //highest possible value
                    emptyCells = dis.moves(node);
                    childNodes = makeSubNodes(node, emptyCells, player);
                    for (let i = 0; i < childNodes.length; i += 1) {
                        v = minimax.memoize(childNodes[i], maxDepth - 1, "O");
                        bestValue = Math.min(bestValue, v);
                    }
                    return bestValue;
                }
            }


            //return new set of nodes based on the passed moves `emptyCells`
            const makeSubNodes = (node, emptyCells, XO) => {
                let nodes = [];
                emptyCells.map(function(itm) {
                    //since this is faster than .forEach()
                    let clonedNode = cloneObject(node); //clone
                    clonedNode[itm] = XO;
                    nodes.push(clonedNode);
                });
                return nodes;
            }


            //Heuristic function
            //return the heuristic value of the node
            const heuristic = (node) => {

                let score = 0;

                if (dis.gameWon("O", node))
                    score += 100;

                else if (dis.gameWon("X", node))
                    score -= 100;

                else score = 0;

                return score;
            }


            //helper

            //object/array cloning
            const cloneObject = (o) =>
                JSON.parse(JSON.stringify(o));

        } // constructor


    //return true if all cells are filled up
    boardFilled(board) {
        board = board || this.board;
        for (let i = 0, gm = board; i < gm.length; i += 1) {
            if (gm[i] === "-") {
                return false;
            }
        }
        return true;
    }


    // list of empty cells
    moves(board) {
        //returns an array of empty cells index
        let m = [];
        for (let i = 0; i < 9; i += 1) {
            if ((board || this.board)[i] === "-") m.push(i);
        }
        return m;
    }


    //GAME WON, return true or false if the game is won, either "X" or "O" is passed as an argument
    gameWon(who, board) {
        board = board || this.board;
        for (let i = 0, wp = this.winPattern; i < wp.length; i += 1) {
            let val = wp[i];
            if ((board[val[0]] + board[val[1]] + board[val[2]]) === (who + who + who)) {
                return true;
            }
        }
        return false;
    }

    // Player Move
    playerMove(idx) {
        if (this.board[idx] === "-") {
            //empty cell, valid move

            this.board[idx] = "X";
            this.pc += 1;
            this.aiTurn = true;
            this.playerLastMove = idx;

            if (this.gameWon("X")) {
                this.gameIsWon = true;
                this.userScore += 1;
                this.board = this.fill(9, "-"); //reset board
                this.playerWinFn(); //call the onPlayerWin function
                return;
            }

            //make AI move immediately after the players move
            this.aiMove();

            //check if all cells are filled and call the `onBoardFilled` function
            //also make sure the game wasnt won after making the AIs' move
            if (this.boardFilled() && !this.gameIsWon) {
                this.draws += 1;
                this.board = this.fill(9, "-"); //reset board
                this.pc = 0; //reset play count
                this.boardFilledFn();
            }
        } //
    }

    // Computer move
    aiMove() {
        let move = this.generateAImove();

        if (this.board[move] === "-") {
            //valid move
            this.board[move] = "O";
            this.aiPlayFn(move);
            this.pc += 1;
            this.aiTurn = false;

            if (this.gameWon("O")) {
                this.gameIsWon = true;
                this.aiScore += 1;
                this.board = this.fill(9, "-");
                this.aiWinFn();
                this.pc = 0;
            }
        } //
    }

    reset() {
        this.pc = 0;
        this.draws = 0;
        this.userScore = 0;
        this.aiScore = 0;
        this.turn = 0;
        this.aiTurn = false;
        this.gameIsWon = false;
        this.board = (function() {
            let a = [];
            for (let i = 0; i < 9; i += 1) {
                a.push("-");
            }
            return a;
        }());
    }

    onAIWin(fn) {
        this.aiWinFn = fn;
    }

    onAIPlay(fn) {
        this.aiPlayFn = fn;
    }

    onPlayerWin(fn) {
        this.playerWinFn = fn;
    }

    onBoardFilled(fn) {
        this.boardFilledFn = fn;
    }

    aiPlay(mv) {
        this.aiPlayFn(mv); //ai play function
    }
} // class