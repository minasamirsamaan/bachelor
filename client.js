    
// KEY_GENERATION--------------------------------------------------------------------------------------------------------
var crypto = require('crypto');
var ecdh = crypto.createECDH('secp256k1');
ecdh.generateKeys();
var publicKey = ecdh.getPublicKey(null, 'compressed');
var privateKey = ecdh.getPrivateKey(null, 'compressed');
var serverPublicKey;
var sharedKey;

//ENCRYPTION-------------------------------------------------------------------------------------------------------------
var aesjs = require('aes-js');
var encryptedBytes;
var encryptedText;
var aesCtr;
//
//TCP_CONNECTION---------------------------------------------------------------------------------------------------------
var HOST = '172.20.10.4';
var PORT = 6969;
var net = require('net');
var client = new net.Socket();
//-----------------------------------------------------------------------------------------------------------------------

client.connect(PORT, HOST, function() {
    console.log();
    console.log('CONNECTED TO SERVER: ' + HOST + ':' + PORT);
    console.log();
    client.write(JSON.stringify(publicKey));
});

client.on('data', function(data) {

    if(!serverPublicKey){
        serverPublicKey=new Buffer.from(JSON.parse(data)); 
        console.log('got the server publicKey ::: '+serverPublicKey.toString('hex'));
        console.log();
        sharedKey = ecdh.computeSecret(serverPublicKey);
        aesCtr = new aesjs.ModeOfOperation.ctr(sharedKey);
        console.log('this is my shared key    ::: '+sharedKey.toString('hex'));  
        console.log();    
        client.write('send');
      }
     else{ if(sharedKey ) {
       	encryptedText=data;
       	encryptedBytes=JSON.parse(encryptedText);



		var arr = []; 
		for(var p in Object.getOwnPropertyNames(encryptedBytes)) {
		    arr[p] = encryptedBytes[p];
		}
        var decryptedBytes = aesCtr.decrypt(arr);
      	console.log('i got '+aesjs.utils.utf8.fromBytes(arr)+'  which is '+aesjs.utils.utf8.fromBytes(decryptedBytes))
      }} 
});
client.on('close', function() {
    console.log('Connection closed');
});