require('dotenv').config()
const PINATA_API_KEY = process.env.PINATA_API_KEY
const PINATA_SECRET_KEY = process.env.PINATA_SECRET_KEY

const fs = require('fs')
const util = require('util')
const FormData = require('form-data')
const request = require('request')

const ipfsClient = require('ipfs-api')
const ipfs = new ipfsClient({host:'ipfs.infura.io', port:5001,protocol:'https'})

function uploadToIpfs(data) {
    return new Promise(function (resolve, reject) {
        request({
            headers: {
              'Content-Type': `multipart/form-data; boundary=${data._boundary}`,
              'pinata_api_key': PINATA_API_KEY,
              'pinata_secret_api_key': PINATA_SECRET_KEY,
            },
            uri: 'https://api.pinata.cloud/pinning/pinFileToIPFS',
            body: data,
            method: 'POST'
          }, function (error, res, body) {
            if (!error && res.statusCode == 200) {
                resolve(JSON.parse(body));
              } else {
                reject(error);
              }
          })
    });
}

exports.uploadFile = async function(file) {
    const path = './uploads/' + file.name  
    const writeFile = util.promisify(fs.writeFile)
    await writeFile(path, file.data)

    let data = new FormData();    
    data.append('file', fs.createReadStream(path))    
    try {
        const result = await uploadToIpfs(data)
        return result.IpfsHash
    }
    catch {
        return null
    }
}

exports.uploadData = async function(name, data) {
    const path = './uploads/' + name  
    const writeFile = util.promisify(fs.writeFile)
    await writeFile(path, JSON.stringify(data))
    const file = fs.createReadStream(path)
    
    let formData = new FormData()
    formData.append('file', file)        
    const result = await uploadToIpfs(formData)
    return result.IpfsHash
}
