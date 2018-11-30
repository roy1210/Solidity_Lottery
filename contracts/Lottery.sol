pragma solidity ^0.4.17;

contract Lottery {
    address public manager;
    address[] public players;//dinamic array

    function Lottery() public {
        manager = msg.sender;
    }

    function enter() public payable {
        require(msg.value > .01 ether);

        players.push(msg.sender);
    }
    //hash化する。  現在のblock difficultyを使用して無理やりランダム関数を作る。
    function random() private view returns (uint){
      return uint(keccak256(block.difficulty, now, players));
    }

    function pickWinner()public restricted {
      uint index = random() % players.length;
      players[index].transfer(this.balance);
      players = new address[](0);
    }
    //DRYのsolution restrictedのあるコードにrequire(msg.sender = manager)を挿入し、_;の所に残りのコードが入る。
    modifier restricted() {
      require(msg.sender == manager);
      _;
    }

    function getPlayers() public view returns(address []){
      return players;
    }
}

/*

*sha3() == keccak256() 引数の中をハッシュ化する。

*nowは現在の時間をとるグローバル変数

無理やり定義したランダムFunctionの考え方は以下の通り。
big numberは数字でハッシュされた現在のblock.difficulty
例
const players = ['bob','alex', 'jim'];
ex.1
87875867674637237495 % players.length
======>>>> 2 つまり当たりはjim

ex.2
10000000001000000101 % players.length
======>>>> 0 つまり当たりはbob

* players = new address[](0); ==> 参加者をリセットする。空の配列はdynamic arrayを示す。また引数が0により、こっちもリセットができる。仮に引数を指定してしまうと「0x00000」のような仮で作られた番号が作られてしまう。

*/
