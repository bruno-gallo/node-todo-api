const {SHA256} = require('crypto-js');
const jwt = require('jsonwebtoken');

var data = {
    id: 10
};

var token = jwt.sign(data, 'secret123');
console.log(`Token: ${token}`);

var decoded = jwt.verify(token, 'secret123');
console.log('Decoded:',decoded);


// var message = "I am Bruno";
// var hash = SHA256(message).toString();
//
// console.log(`Message: ${message}`);
// console.log(`Hash: ${hash}`);

// var data = {
//     id: 4
// };
//
// var token = {
//     data,
//     hash: SHA256(JSON.stringify(data) + 'secret').toString()
// };
//
// // Intento de manipular la data
// token.data.id = 5;
// token.hash = SHA256(JSON.stringify(token.data)).toString();
// // Esto falla porque no se sabe que se agrega el 'secret'
//
// var resultHash = SHA256(JSON.stringify(token.data) + 'secret').toString();
//
// if (resultHash === token.hash) {
//     console.log('Data was not Changed');
// } else {
//     console.log('Data was changed. Acces denied');
// }
