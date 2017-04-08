var admin = require("firebase-admin");


admin.initializeApp({
  credential: admin.credential.cert("key.json"),
  databaseURL: "https://security-2a461.firebaseio.com"
});

var db = admin.database();
var ref = db.ref("Scanned Devices");

var peripheralRef = ref.child("peripheral-info");
var newPeripheral = peripheralRef.push();

var noble = require('noble');
noble.on('stateChange', function(state) {
  if (state === 'poweredOn') {
    noble.startScanning();
    console.log("Scanning..")
  } else {
    noble.stopScanning();
  }
});

noble.on('discover', function(peripheral) {
  console.log(peripheral.id);
  var name = "undefined";
  var address = "no address";
  if(peripheral.advertisement.localName)
    name = peripheral.advertisement.localName;
  if(peripheral.address)
    address = peripheral.address;

   
     console.log(">>>>>>"+peripheral.id+"<<<<<<<");
  newPeripheral.set({
    id: peripheral.id,
    localName: name,
    address: address
  });


});

