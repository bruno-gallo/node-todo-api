const {SHA256} = require('crypto-js');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');


var password = '123abc!';

bcrypt.genSalt(10, (error, salt) => {
    bcrypt.hash(password, salt, (error, hash) => {
        console.log(hash);
    });
});

var hashedPassword = '$2a$10$23ILDAcHnk6au2r3sN0nweyB7VhGogrOUiZZiM.J6tBzDmbo9LUYG';

bcrypt.compare(password, hashedPassword, (error, result) => {
    console.log(result);
});
//
// var data = {
//     id: 10
// };
//
// var token = jwt.sign(data, 'secret123');
// console.log(`Token: ${token}`);
//
// var decoded = jwt.verify(token, 'secret123');
// console.log('Decoded:',decoded);
//

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
