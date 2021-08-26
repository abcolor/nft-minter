const wallet = require('ethereumjs-wallet')

exports.generate = function async (req, res) {
    const newWallet = wallet.default.generate()
    const address = newWallet.getAddressString()
    const privateKey = newWallet.getPrivateKeyString()
    res.json({ address: address, privateKey: privateKey })
}