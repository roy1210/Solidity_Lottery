const path = require("path");
const fs = require("fs");
const solc = require("solc");

const lotteryPath = path.resolve(__dirname, "contracts", "Lottery.sol");
const source = fs.readFileSync(lotteryPath, "utf8");

//console.log(solc.compile(source, 1));
module.exports = solc.compile(source, 1).contracts[":Lottery"];

/*

*const path = require ('path'); 絶対パス。これによりMacとWindows、LinuxなどのOSの違いによる、パスの表示違いによるエラーを防ぐ。 compile.jsからlottery.solへのパス。
一行目のBad exampleは
require('./contracts/lottery.sol'); これは相対パスで、悪い例。

* __dirname ==>root folderへ移動する。この場合はlotteryフォルダ。

*solc.compile(source, 1) ==> 1 はコンパイルするファイル数を示す。

*/
