require('dotenv').config()

const PUBLIC_KEY = process.env.PUBLIC_KEY
const PRIVATE_KEY = process.env.PRIVATE_KEY
const PROVIDER_URL = process.env.PROVIDER_URL
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS

const Web3 = require('web3')
const HDWalletProvider = require('truffle-hdwallet-provider-privkey')
const abi = require('./contracts/TimeCapsule.json')
const provider = new HDWalletProvider([PRIVATE_KEY], PROVIDER_URL);

const web3 = new Web3(provider);
const contract = new web3.eth.Contract(abi, CONTRACT_ADDRESS)

exports.totalSupply = async function(req, res) {
    try {
        const totalSupply = await contract.methods.totalSupply().call()
        res.json({ totalSupply: totalSupply })
    } catch (e) {
        return res.status(400).send('fail to call totalSupply');
    } 
}

exports.tokenURI = async function(req, res) {
    const tokenId = req.query.tokenId
    if(!tokenId) {
        return res.status(400).send('tokenId required');
    }

    // get tokenURI
    try {
        const tokenUri = await contract.methods.tokenURI(tokenId).call()
        return res.json({ tokenUri: tokenUri })
    } catch (e) {
        return res.status(400).send('invalid tokenId');
    }    
}

exports.owner = async function(req, res) {
    const tokenId = req.query.tokenId
    if(!tokenId) {
        return res.status(400).send('tokenId required');
    }

    // get tokenURI
    try {
        const owner = await contract.methods.ownerOf(tokenId).call()
        return res.json({ owner: owner })
    } catch (e) {
        return res.status(400).send('invalid tokenId');
    }    
}

exports.transaction = async function(req, res) {
    const hash = req.query.hash
    if(!hash) {
        return res.status(400).send('tokenId required');
    }


    const txData = web3.eth.getTransaction(hash)                                
    console.log('txData: ' + JSON.stringify(txData))

    return res.status(200).send('ok');

}

exports.mint = async function(req, res) {
    const tokenUri = req.body.tokenUri
    if(!tokenUri) {
        return res.status(400).send('require: tokenUri')
    }

    //get latest nonce
    const nonce = await web3.eth.getTransactionCount(PUBLIC_KEY, 'latest') 
    console.log('nonce: ' + nonce)

    //the transaction
    const tx = {
        'from': PUBLIC_KEY,
        'to': CONTRACT_ADDRESS,
        'nonce': nonce,
        'gas': 500000,
        'data': contract.methods.mint(tokenUri, tokenUri, 0, "").encodeABI()
    }
    
    const signPromise = web3.eth.accounts.signTransaction(tx, PRIVATE_KEY);
    signPromise.then((signedTx) => {
        web3.eth.sendSignedTransaction(signedTx.rawTransaction, function(err, hash) {
            if (!err) {
                return res.json({ transaction: hash })
            } else {
                return res.status(500).send('submitting transaction fail: ' + err);
            }
        })
    }).catch((err) => {
        return res.status(500).send('sign transaction fail: ' + err);
    })
}
