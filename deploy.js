const HDWalletProvider = require("truffle-hdwallet-provider");
const Web3 = require("web3");
const { interface, bytecode } = require("./compile");

const provider = new HDWalletProvider(
  "viable grace extend ramp chest attend sail miss unhappy major clump flush",
  "https://rinkeby.infura.io/v3/085912395fc74e3cbad791588d71c376"
);
const web3 = new Web3(provider);

const deploy = async () => {
  const accounts = await web3.eth.getAccounts();

  console.log("Attempting to deploy from account", accounts[0]);

  const result = await new web3.eth.Contract(JSON.parse(interface)) //interface = ABI
    .deploy({ data: bytecode })
    .send({ gas: "1000000", from: accounts[0] });

  console.log(interface);
  console.log("Contract deployed to", result.options.address);
};
deploy();

/*

*result.options.address ==> deployしたアドレス（ネットワーク）。
>0x51A11f9174C201bb2232Dcc97Eb851b138bD93F7
*/
