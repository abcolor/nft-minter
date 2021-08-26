const express = require("express")
      bodyParser = require('body-parser')
      http = require('http')
      fileUpload = require('express-fileupload')
      wallet = require('./wallet')
      contract = require('./contract')
      ipfsUploader = require('./ipfs-uploader')
      metadata = require('./metadata')

const app = express()
app.set('port', process.env.PORT || 3000)
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

// upload file size limit: 40MB
app.use(fileUpload({
    limits: { fileSize: 40 * 1024 * 1024 },
}))
  
app.post('/wallet/generate', wallet.generate)
app.post('/asset', metadata.upload)
app.post('/asset/mint', contract.mint)
app.get('/asset/totalSupply', contract.totalSupply)
app.get('/asset/owner', contract.owner)
app.get('/asset', contract.tokenURI)
app.get('/transaction', contract.transaction)

const server = http.createServer(app).listen(app.get('port'), function(){
    console.log('Express server listening on port ' + app.get('port'))
})
