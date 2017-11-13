"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

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
    value: function value() {
        this._values = this._values || {};

        for (var _len = arguments.length, arg = Array(_len), _key = 0; _key < _len; _key++) {
            arg[_key] = arguments[_key];
        }

        var args = [].concat(arg),
            val = void 0;
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
    value: function value() {
        return this[~~(Math.random() * this.length)];
    }
});

var Tictac = function () {
    function Tictac(level) {
        var _this = this;

        _classCallCheck(this, Tictac);

        this.aiScore = 0;
        this.userScore = 0;
        this.draws = 0;
        this.pc = 0; //play count

        this.turn = 0; //0 for user, 1 for AI, used for play turn after game has ended
        this.level = level || "normal";
        this.aiTurn = false;
        this.gameIsWon = false;

        this.board = ["-", "-", "-", "-", "-", "-", "-", "-", "-"];

        // this.playerLastMove;
        var dis = this;

        this.winPattern = [
        //horizontal
        [0, 1, 2], [3, 4, 5], [6, 7, 8],

        //vertical
        [0, 3, 6], [1, 4, 7], [2, 5, 8],

        //diagonal
        [0, 4, 8], [2, 4, 6]];

        //my algorithm <^-^>
        var bestResponses = [[4], //0
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
        this.fill = function (c, itm) {
            return [].concat(_toConsumableArray(Array(c))).fill(itm);
        };

        //isTerminal
        //return true or false if board is filled up or game is won
        var isTerminal = function isTerminal(node) {
            return dis.gameWon("X", node) || dis.gameWon("O", node) || dis.boardFilled(node);
        };

        /* AI MOVE GENERATOR */
        this.generateAImove = function () {
            switch (dis.level) {
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

                            return bestResponses[_this.playerLastMove].rand();
                        } else {
                            return _move(6);
                        }
                    }
            } // switch
        };

        var _move = function _move(depth) {
            var nextStates = makeSubNodes.memoize(dis.board, dis.moves(), "O");
            var move = dis.moves()[0];
            var initialScore = -Infinity;

            var _loop = function _loop(i) {
                var score = minimax.memoize(nextStates[i], depth, "X");
                if (score > initialScore) {
                    move = function () {
                        return dis.moves()[i];
                    }();

                    initialScore = score;
                }
            };

            for (var i = 0; i < nextStates.length; i += 1) {
                _loop(i);
            }

            return move;
        };

        /* MINIMAX ALGORITHM */
        var minimax = function minimax(node, maxDepth, player) {
            if (maxDepth === 0 || isTerminal(node)) {
                //return heuristic value of this leaf node
                return heuristic.memoize(node);
            }

            var bestValue = void 0,
                emptyCells = void 0,
                childNodes = void 0,
                v = void 0;
            if (player == "O") {
                //maximizing player
                bestValue = -Infinity; //lowest possible value
                emptyCells = dis.moves(node);
                childNodes = makeSubNodes(node, emptyCells, player);
                for (var i = 0; i < childNodes.length; i += 1) {
                    v = minimax.memoize(childNodes[i], maxDepth - 1, "X");
                    bestValue = Math.max(bestValue, v);
                }

                return bestValue;
            } else {
                //minimizing player, X
                bestValue = +Infinity; //highest possible value
                emptyCells = dis.moves(node);
                childNodes = makeSubNodes(node, emptyCells, player);
                for (var _i = 0; _i < childNodes.length; _i += 1) {
                    v = minimax.memoize(childNodes[_i], maxDepth - 1, "O");
                    bestValue = Math.min(bestValue, v);
                }
                return bestValue;
            }
        };

        //return new set of nodes based on the passed moves `emptyCells`
        var makeSubNodes = function makeSubNodes(node, emptyCells, XO) {
            var nodes = [];
            emptyCells.map(function (itm) {
                //since this is faster than .forEach()
                var clonedNode = cloneObject(node); //clone
                clonedNode[itm] = XO;
                nodes.push(clonedNode);
            });
            return nodes;
        };

        //Heuristic function
        //return the heuristic value of the node
        var heuristic = function heuristic(node) {

            var score = 0;

            if (dis.gameWon("O", node)) score += 100;else if (dis.gameWon("X", node)) score -= 100;else score = 0;

            return score;
        };

        //helper

        //object/array cloning
        var cloneObject = function cloneObject(o) {
            return JSON.parse(JSON.stringify(o));
        };
    } // constructor


    //return true if all cells are filled up


    _createClass(Tictac, [{
        key: "boardFilled",
        value: function boardFilled(board) {
            board = board || this.board;
            for (var i = 0, gm = board; i < gm.length; i += 1) {
                if (gm[i] === "-") {
                    return false;
                }
            }
            return true;
        }

        // list of empty cells

    }, {
        key: "moves",
        value: function moves(board) {
            //returns an array of empty cells index
            var m = [];
            for (var i = 0; i < 9; i += 1) {
                if ((board || this.board)[i] === "-") m.push(i);
            }
            return m;
        }

        //GAME WON, return true or false if the game is won, either "X" or "O" is passed as an argument

    }, {
        key: "gameWon",
        value: function gameWon(who, board) {
            board = board || this.board;
            for (var i = 0, wp = this.winPattern; i < wp.length; i += 1) {
                var val = wp[i];
                if (board[val[0]] + board[val[1]] + board[val[2]] === who + who + who) {
                    return true;
                }
            }
            return false;
        }

        // Player Move

    }, {
        key: "playerMove",
        value: function playerMove(idx) {
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

    }, {
        key: "aiMove",
        value: function aiMove() {
            var move = this.generateAImove();

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
    }, {
        key: "reset",
        value: function reset() {
            this.pc = 0;
            this.draws = 0;
            this.userScore = 0;
            this.aiScore = 0;
            this.turn = 0;
            this.aiTurn = false;
            this.gameIsWon = false;
            this.board = function () {
                var a = [];
                for (var i = 0; i < 9; i += 1) {
                    a.push("-");
                }
                return a;
            }();
        }
    }, {
        key: "onAIWin",
        value: function onAIWin(fn) {
            this.aiWinFn = fn;
        }
    }, {
        key: "onAIPlay",
        value: function onAIPlay(fn) {
            this.aiPlayFn = fn;
        }
    }, {
        key: "onPlayerWin",
        value: function onPlayerWin(fn) {
            this.playerWinFn = fn;
        }
    }, {
        key: "onBoardFilled",
        value: function onBoardFilled(fn) {
            this.boardFilledFn = fn;
        }
    }, {
        key: "aiPlay",
        value: function aiPlay(mv) {
            this.aiPlayFn(mv); //ai play function
        }
    }]);

    return Tictac;
}(); // class