var AccessControl = require('accesscontrol');

var ac = new AccessControl();

ac.grant('user')                    // define new or modify existing role. also takes an array.
    .createOwn('video')             // equivalent to .createOwn('video', ['*'])
    .deleteOwn('video')
    .readAny('video')
  .grant('admin')                   // switch to another role without breaking the chain
    .extend('user')
    .updateAny('video', ['title'])
    .deleteAny('video');



  var permission = ac.can('user').createAny('video');



console.log(permission.granted);    // —> true
console.log(permission.attributes);
