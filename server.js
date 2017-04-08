

// DONT FORGET /n for android TCP client


//KEY_GENERATION(ECDH)------------------------------------------------------------------------------------------
var crypto = require('crypto');
var ecdh = crypto.createECDH('secp256k1');
ecdh.generateKeys();
var publicKey  = ecdh.getPublicKey(null,'compressed');
var privateKey = ecdh.getPrivateKey(null, 'compressed');
var sharedKey;

//AES-----------------------------------------------------------------------------------------------------------
var aesjs = require('aes-js');
var text = '  Hello from the server side, this is a plain text  ';
var textBytes = aesjs.utils.utf8.toBytes(text);
var aesCtr;

//FIREBASE_DATABASE---------------------------------------------------------------------------------------------
var admin = require("firebase-admin");
admin.initializeApp({
  credential: admin.credential.cert("key.json"),
  databaseURL: "https://security-2a461.firebaseio.com"
});
var db = admin.database();
var ref = db.ref("Clients");
var peripheralRef = ref.child("encrypted_data");
var newPeripheral = peripheralRef.push();

//TCP_SERVER----------------------------------------------------------------------------------------------------
var net = require('net');
var server = net.createServer();
var HOST = '172.20.10.4';
var PORT = 6969;
var sockets = [];
var sharedKeys=[];
var socketID;

server.on('connection',function(sock) {

   console.log((sockets.length+1) +' client(s) connected to the server');
    console.log();
    sock.write(JSON.stringify(publicKey)+'\n');

    sock.on('data', function(data) {
     if( !(sockets.indexOf(sock)>-1))
        {

          clientPublicKey=new Buffer.from(JSON.parse(data));
          console.log('got the client publicKey :::  '+clientPublicKey.toString('hex'));
          console.log();
          sharedKey = ecdh.computeSecret(clientPublicKey);
          console.log('this is my shared key    :::  '+sharedKey.toString('hex'));
          console.log();
          sockets.push(sock);
          socketID=sockets.indexOf(sock);
          sharedKeys.push(sharedKey);
          aesCtr = new aesjs.ModeOfOperation.ctr(sharedKeys[socketID]);
        }
       else
        {
          socketID=sockets.indexOf(sock);
          aesCtr = new aesjs.ModeOfOperation.ctr(sharedKeys[socketID]);
          var encryptedBytes = aesCtr.encrypt(textBytes);
          var encryptedText = aesjs.utils.utf8.fromBytes(encryptedBytes);
          sock.write(JSON.stringify(encryptedBytes)+'\n');
          var decryptedBytes = aesCtr.decrypt(encryptedBytes);
          var decrypted = aesjs.utils.utf8.fromBytes(decryptedBytes);
          console.log('Server sent ' +text+' encrypted as  '+ aesjs.utils.utf8.fromBytes(encryptedBytes));
          console.log();

        }

    });

    sock.on('end', function(data) {
      console.log("bye");
      socketID=sockets.indexOf(sock);
      sockets.splice(socketID, 1);
      sharedKeys.splice(socketID,1);
        console.log('A client disconnected ' +sockets.length +' client(s) connected to the server');
    });
});

server.listen(PORT, HOST);

console.log();
console.log('Server listening on ' + HOST +':'+ PORT);
console.log();
