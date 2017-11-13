"use strict";

// Sochima Biereagu, @KodeJuice
// 2016


//game script
$(document).ready(function () {
    var tic = new Tictac("hard");

    var turnPlay = function turnPlay(dis) {
        if (dis.turn === 1) {
            dis.aiTurn = false;
            dis.turn = 0;
        } else if (dis.turn === 0) {
            dis.aiTurn = true;
            dis.aiMove();
            dis.turn = 1;
        }
    };

    //Computer win handler
    tic.onAIWin(function () {
        setTimeout(function () {
            //update score
            $("div#ai").html(tic.aiScore);

            //reset board
            $("div.cell").html("");

            tic.gameIsWon = false;

            turnPlay(tic);
        }, 1500);
    });

    //player win handler
    tic.onPlayerWin(function (who) {
        setTimeout(function () {
            //update score
            $("div#user").html(tic.userScore);

            //reset board
            $("div.cell").html("");

            tic.gameIsWon = false;

            turnPlay(tic);
        }, 1500);
    });

    //board filled-up handler
    tic.onBoardFilled(function () {
        setTimeout(function () {
            //update scores
            $("div#draws").html(tic.draws);

            //reset board
            $("div.cell").html("");

            turnPlay(tic);
        }, 1500);
    });

    //AI move event handler
    tic.onAIPlay(function (idx) {
        var $this = $("div.cell").eq(idx);

        if ($this.html() == "" && tic.aiTurn && !tic.gameIsWon) {
            $this.html("<span class='o'>O</span>");
        }
    });

    //cells click, players' move
    $("div.cell").click(function () {
        var idx = $(this).index();
        var $this = $(this);

        if ($this.html() == "" && !tic.aiTurn && !tic.gameIsWon) {
            $this.html("<span class='x'>X</span>");
            try {
                tic.playerMove(idx);
            } catch (r) {
                alert(r);
            }
            //alert(JSON.stringify(tic));
        }
    });

    var mode = function mode(el) {
        var b = confirm("Restart game to level '" + el.data('mode') + "'");

        if (b) {
            $("button").removeClass("active");
            el.attr("class", "active");

            tic.level = el.data("mode");
            tic.reset();

            $("div#ai, div#user, div#draws").html(0);
            $("div.cell").html("");
        }
    };

    $("button:not('.reset')").click(function () {
        mode($(this));
    });

    $("button").filter(function () {
        return $(this).data("mode") === tic.level;
    }).attr("class", "active");

    $("button.reset").click(function () {
        var tf = confirm("Reset game and restart?");
        if (tf) {
            tic.reset();
            $("div#ai, div#user, div#draws").html(0);
            $("div.cell").html("");
        }
    });
});