const aptos = require("aptos");
const express = require("express");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const app = express();
const port = 9000;

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './uploads');
    },
    filename: function (req, file, cb) {
        if (file.fieldname == 'mv') {
            dotmv = file.originalname;
        }
        if (file.fieldname == 'bcs') {
            dotbcs = file.originalname;
        }
      cb(null, file.originalname);
    }
  })
const upload = multer({ storage })
const mulUpload = upload.fields([{ name: 'bcs', maxCount: 1 }, { name: 'mv', maxCount: 1 }])
app.use(express.urlencoded({extended: false}));

var dotmv;
var dotbcs;

const NODE = "https://fullnode.testnet.aptoslabs.com";
const FAUCET_URL = "https://faucet.testnet.aptoslabs.com";
const aptosCoin = "0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>";

var address;
var privateKey;
var publicKey;
// var trimPub = publicKey.slice(2,);

const faucet = new aptos.FaucetClient(NODE, FAUCET_URL, null);
// var acc_details = {
//     address: address,
//     publicKeyHex: publicKey,
//     privateKeyHex: privateKey+publicKey.slice(2,),
// };
const client = new aptos.AptosClient(NODE);

// app.get("/pub", async(req, res)=>{
//     var account = aptos.AptosAccount.fromAptosAccountObject(acc_details);
//     const packageMetadata = fs.readFileSync(path.join(__dirname, "uploads", dotbcs));
//     const moduleData = fs.readFileSync(path.join(__dirname, "uploads", dotmv));

//     let txnHash = await client.publishPackage(account, new aptos.HexString(packageMetadata.toString("hex")).toUint8Array(), [
//         new aptos.TxnBuilderTypes.Module(new aptos.HexString(moduleData.toString("hex")).toUint8Array()),
//       ]);
//     await client.waitForTransaction(txnHash);
//     res.send(txnHash);
// })

app.get("/reg", async(req, res)=>{
    var trimPub = publicKey.slice(2,);
    var acc_details = {
        address: address,
        publicKeyHex: publicKey,
        privateKeyHex: privateKey+trimPub,
    };
    var account = aptos.AptosAccount.fromAptosAccountObject(acc_details);
    const payload = {
        type: "entry_function_payload",
        function: `${address}::UCoin::register`,
        type_arguments: [],
        arguments: [],
    };
    const txnRequest = await client.generateTransaction(account.address(), payload);
    const signedTxn = await client.signTransaction(account, txnRequest);
    const transactionRes = await client.submitTransaction(signedTxn);
    await client.waitForTransaction(transactionRes.hash);
    res.send(transactionRes.hash);
})

app.get("/mint", async(req, res)=>{
    var trimPub = publicKey.slice(2,);
    var acc_details = {
        address: address,
        publicKeyHex: publicKey,
        privateKeyHex: privateKey+trimPub,
    };
    const decimal_amount = parseFloat(req.query.amount) * 10 ** 8;
    var account = aptos.AptosAccount.fromAptosAccountObject(acc_details);
    const payload = {
        type: "entry_function_payload",
        function: `${address}::UCoin::mint_coin`,
        type_arguments: [],
        arguments: [req.query.to_address, decimal_amount],
    };
    const txnRequest = await client.generateTransaction(account.address(), payload);
    const signedTxn = await client.signTransaction(account, txnRequest);
    const transactionRes = await client.submitTransaction(signedTxn);
    await client.waitForTransaction(transactionRes.hash);
    res.send(transactionRes.hash);
})

app.get("/transfer", async(req, res)=>{
    var trimPub = publicKey.slice(2,);
    var acc_details = {
        address: address,
        publicKeyHex: publicKey,
        privateKeyHex: privateKey+trimPub,
    };
    const decimal_amount = parseFloat(req.query.amount) * 10 ** 8;
    var account = aptos.AptosAccount.fromAptosAccountObject(acc_details);
    const payload = {
        type: "entry_function_payload",
        function: `${address}::UCoin::transfer_coin`,
        type_arguments: [],
        arguments: [req.query.to_address, decimal_amount],
    };
    const txnRequest = await client.generateTransaction(account.address(), payload);
    const signedTxn = await client.signTransaction(account, txnRequest);
    const transactionRes = await client.submitTransaction(signedTxn);
    await client.waitForTransaction(transactionRes.hash);
    res.send(transactionRes.hash);
})

app.get("/home", async(req, res) =>{
    res.sendFile(path.join(__dirname, "data.html"));
})

app.get('/details', async (req, res)=> {
    address = req.query.addr;
    publicKey = req.query.pub;
    privateKey = req.query.pvt;
    res.sendFile(path.join(__dirname, "file_fs.html"));
  })

app.post('/upload_file', mulUpload, async (req, res, next)=> {
    var trimPub = publicKey.slice(2,);
    var acc_details = {
        address: address,
        publicKeyHex: publicKey,
        privateKeyHex: privateKey+trimPub,
    };
    var account = aptos.AptosAccount.fromAptosAccountObject(acc_details);
    const packageMetadata = fs.readFileSync(path.join(__dirname, "uploads", dotbcs));
    const moduleData = fs.readFileSync(path.join(__dirname, "uploads", dotmv));

    let txnHash = await client.publishPackage(account, new aptos.HexString(packageMetadata.toString("hex")).toUint8Array(), [
        new aptos.TxnBuilderTypes.Module(new aptos.HexString(moduleData.toString("hex")).toUint8Array()),
      ]);
    await client.waitForTransaction(txnHash);
    res.send(`Package Published.<br /><br />TxnHash: ${txnHash}`);
  })


app.listen(port, async()=>{
    console.log(`Listening to ${port}`);
})
