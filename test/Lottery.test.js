const assert = require("assert");
const ganache = require("ganache-cli");
const Web3 = require("web3");
const web3 = new Web3(ganache.provider());
//web3 小文字は変数、大文字はconstructor function (library?)
const { interface, bytecode } = require("../compile");

let accounts;
let lottery;

//Initialize
beforeEach(async () => {
  // Get a list of all accounts
  accounts = await new web3.eth.getAccounts();

  lottery = await new web3.eth.Contract(JSON.parse(interface))
    .deploy({
      data: bytecode
    })
    .send({ from: accounts[0], gas: "1000000" });
});

//describeは「纏めるイメージ」 assert.okでローカルテストネットワークにDeployができたか、ValueがDefineされたかテストできる。
describe("lottery", () => {
  it("deploys a contract", () => {
    assert.ok(lottery.options.address);
  });//The address where the contract is deployed.

  it('always one account to enter', async ()=>{
    await lottery.methods.enter().send({
      from: accounts[0],
      value: web3.utils.toWei('0.02','ether')//このWeb3ライブラリの関数を使用してetherをWeiに変換してくれる。でないとデフォルトはWeiの為0がとても多くなってしまう。
    });

    const players = await lottery.methods.getPlayers().call({
      from: accounts[0]
    });

    assert.equal(accounts[0], players[0]);
    assert.equal(1, players.length);
  });

  it('always multiple account to enter', async ()=>{
    await lottery.methods.enter().send({
      from: accounts[0],
      value: web3.utils.toWei('0.02','ether')
    });
    await lottery.methods.enter().send({
      from: accounts[1],
      value: web3.utils.toWei('0.02','ether')
    });
    await lottery.methods.enter().send({
      from: accounts[2],
      value: web3.utils.toWei('0.02','ether')
    });

    const players = await lottery.methods.getPlayers().call({
      from: accounts[0]
    });

    assert.equal(accounts[0], players[0]);
    assert.equal(accounts[1], players[1]);
    assert.equal(accounts[2], players[2]);
    assert.equal(3, players.length);
  });

  it('requires a minimum amount of ether to enter', async () => {
    let executed;
    try {
      await lottery.methods.enter().send({
        from: accounts[0],
        value: web3.utils.toWei('0.00000002','ether')
      });
      //ここに辿り着くまでにエラーになった場合はCatchに飛ぶ
      executed = 'success';
    } catch (err) {
      executed = 'fail'
    }

    assert.equal('fail', executed);
  });

  it('only manager can call pickWinner', async () =>{
    let executed
    try{
      await lottery.methods.enter().send({
        from: accounts[1],
        value: web3.utils.toWei('0.02','ether')
      });

      await lottery.methods.pickWinner().send({
        from: accounts[1]
      });
      //ここに辿り着くまでにエラーになった場合はCatchに飛ぶ
      executed = 'success';
    } catch(err){
      executed = 'fail';
    }
    assert.equal('fail', executed);
  });

  it('sends money to the winner and resets the players array', async () =>{
    await lottery.methods.enter().send({
      from: accounts[0],
      value: web3.utils.toWei('2','ether')
    });

    const initialBalance = await web3.eth.getBalance(accounts[0]); //100-2-gas

    await lottery.methods.pickWinner().send({
      from: accounts[0]
    });

    const finalBalance = await web3.eth.getBalance(accounts[0]);//almost 98+2-gas

    const difference = finalBalance - initialBalance;

    const players = await lottery.methods.getPlayers().call({
      from: accounts[0]
    });
    //playersを定義することで、enterしたa/cの数をテスト可。

    assert(difference > web3.utils.toWei('1.8','ether'));
    console.log('initialBalance',initialBalance);
    console.log('finalBalance',finalBalance);
    console.log('difference',difference)

    assert.equal(0, players.length);
    //enterリセット
  });
});


/*

*const assert = require("assert");==>NodeのStandard Library。このヘルパーを呼ぶことで、テストモジュールをインストールする必要がなくなる。

* Web3(ganache.provider()); ==> 開発中はganacheだが、他のネットワーク (Linkbyなど)で使う際は、ganacheの部分を変更する。ganacheはローカルテスト環境を提供する。

* try, catchメゾッド==> async/await でセットで使える。まずtryしてみて、結果が条件以下の場合はcatchが動く。catch(err) がよくある。

* Contract メゾッド ==> A constructor function and its intent is to allow us to either interact with existing contracts
that exist on the block chain already or you create and deploy new contracts.

* assertはNodeで用意されている変数で、okメソッドは引数が存在するのかチェックできる。No or undefineの場合はエラーが返る。

* methods メゾッド ==> solidity プロパティ。すでに作成されているコードをそのまま引用できる。


* const assert = require("assert"); ==> NodeのStandard Library。このヘルパーを呼ぶことで、テストモジュールをインストールする必要がなくなる。

* assert(false); ==>It's entire purpose is to just say if we get to this line of code(コードが通ったら) automatically fail the tests no matter

* ganacheでは各アカウントの持つEthのデフォルトは100Eth

*/
