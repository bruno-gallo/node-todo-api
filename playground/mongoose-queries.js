const {ObjectID} = require('mongodb');

const {mongoose} = require('./../server/db/mongoose.js');
const {Todo} = require('./../server/models/todo.js');
const {User} = require('./../server/models/user.js');


var id = '58acc0c157e00e9e0b02080d';
var wrongId = '68acc0c157e00e9e0b02080d';
var invalidId = '68acc0c157e00e9e0b02080d1';

// Verifica que la id sea válida
if (!ObjectID.isValid(invalidId)) {
    console.log('Id Not Valid');
}

// Devuelve todos los documentos que cumplan con las condiciones
// Si no hay condiciones, devuelve todos los documentos
// Si no encuentra nada, devuelve un array vacío
Todo.find({
    _id: id
}).then((todos) => {
    console.log('Todos:', todos);
})

// Devuelve el primer documento que cumpla la condicion
// Si no encuentra, devuelve null
Todo.findOne({
    _id: id
}).then((todo) => {
    if(!todo)
    {
        return console.log("Id Not Found");
    }
    console.log('Todo:', todo);
})

// Encuentro un documento por su id
// Si no encuentra, devuelve null
// Si la ID es invalida, entra en el bloque catch
Todo.findById(id).then((todo) => {
    if(!todo)
    {
        return console.log("Id Not Found");
    }
    console.log('Todo by Id:', todo);
}).catch((error) => console.log(error));

console.log('User Query');

var userId = '58ac90b07bf77ceb097af7ec';

User.findById(userId).then((user) => {
    if (!user) {
        return console.log("Id not found");
    }
    console.log("Useer: ", JSON.stringify(user, undefined, 2));
}).catch((error) => console.log("Invalid Id"));
