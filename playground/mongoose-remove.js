const {ObjectID} = require('mongodb');

const {mongoose} = require('./../server/db/mongoose.js');
const {Todo} = require('./../server/models/todo.js');
const {User} = require('./../server/models/user.js');

// Elimina todos los documentos
// Todo.remove({}).then((result) => {
//     console.log(result);
// });

// Elimina un documento y lo retorna
Todo.findOneAndRemove({_id: '58acd85aa47f7c0d0b81a087'}).then((todo) => {
    console.log(todo);
})

// Elimina un documento por su ID y lo retorna
Todo.findByIdAndRemove('58acd85aa47f7c0d0b81a087').then((todo) => {
    console.log(todo);
});
