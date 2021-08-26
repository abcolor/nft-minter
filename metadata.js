const ipfsUploader = require('./ipfs-uploader')
const metadata_file = './metadata.json';

exports.upload = async function(req, res) {    
    const title = req.body.title
    const name = req.body.name    
    const description = req.body.description
    const creator = req.body.creator
        
    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).send('require file')
    }

    if(!title || !name || !description || !creator) {
        return res.status(400).send('require: title/ name')
    }
    
    // upload file to IPFS
    const file = req.files.file
    const ipfsHash = await ipfsUploader.uploadFile(file)
    const imageUrl =  "https://ipfs.io/ipfs/" + ipfsHash
    //console.log('imageUrl: ' + imageUrl)

    // create metadata
    let metadata = require(metadata_file)
    metadata.title = title
    metadata.name = name
    metadata.imageUrl = imageUrl
    metadata.description = description
    metadata.attributes[0].value = creator
    metadata.properties.name.description = name
    metadata.properties.description.description = description
    metadata.properties.preview_media_file.description = imageUrl
    metadata.properties.preview_media_file_type.description = file.mimetype
    metadata.properties.created_at.description = new Date().toString()  
    metadata.properties.digital_media_signature.description = ipfsHash    
    //console.log(metadata)
    
    const metadataIpfs = await ipfsUploader.uploadData(ipfsHash + '.txt', metadata)
    //console.log('metadataIpfs: ' + metadataIpfs)
    return res.status(200).json({ 'hash': metadataIpfs, 'tokenUri': "https://ipfs.io/ipfs/" + metadataIpfs })
}
