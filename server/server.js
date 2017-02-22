require('./config/config.js');
const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');
const {ObjectID} = require('mongodb');

var {mongoose} = require('./db/mongoose.js');
var {Todo} = require('./models/todo.js');
var {User} = require('./models/user.js');

const {authenticate} = require('./middleware/authenticate.js');

var app = express();
const port = process.env.PORT;

app.use(bodyParser.json());

// Define cómo se manejan peticiones POST
app.post('/todos', (request, response) => {

    // Se crea el nuevo To-Do con la propiedad text definida en el cuerpo de la request
    var todo = new Todo({
        text: request.body.text
    })

    // Guarda el documento en la base de datos
    todo.save().then((document) => {
        response.send(document);
    }, (error) => {
        response.status(400).send(error);
    });
});

app.get('/todos', (request, response) => {
    Todo.find().then((todos) => {
        response.send(
            {
            todos
        });
    }, (error) => {
        response.status(400).send(error);
    });
});

app.get('/todos/:id', (request, response) => {
    // Obtiene la ID pasada en la URL
    var id = request.params.id;
    // Verifica que sea un ID válido
    if (!ObjectID.isValid(id))
    {
        return response.status(404).send();
    }

    Todo.findById(id).then((todo) => {
        // Verifica que exista un To-Do en la BD con ese ID
        if (!todo) {
            return response.status(404).send();
        }
        response.send({
                todo
            });
    }).catch((error) => {
        response.status(400).send();
    });
});

app.delete('/todos/:id', (request, response) => {
    var id = request.params.id;
    if (!ObjectID.isValid(id))
    {
        return response.status(404).send();
    }

    Todo.findByIdAndRemove(id).then((todo) => {
        if (!todo) {
            return response.status(404).send();
        }
        response.status(200).send({todo})
    }).catch((error) => {
        response.status(400).send();
    });
});

app.patch('/todos/:id', (request, response) => {
    var id = request.params.id;
    // Especifica qué propiedades puede actualizar el usuario
    var body = _.pick(request.body, ['text', 'completed']);
    if (!ObjectID.isValid(id))
    {
        return response.status(404).send();
    }
    // Se setean los valores nuevos de las propiedades el objeto
    if (_.isBoolean(body.completed) && body.completed) {
        body.completedAt = new Date().getTime();
    } else {
        body.completed = false;
        body.completedAt = null;
    }
    // Se actualiza el objeto
    Todo.findByIdAndUpdate(id, {$set: body}, {new: true}).then((todo) => {
        if (!todo) {
            return response.status(404).send();
        }
        response.send({todo});
    }).catch((error) => {
        response.status(400).send();
    })
});

// Define cómo se manejan peticiones POST de User
app.post('/users', (request, response) => {
    var body = _.pick(request.body, ['email', 'password']);
    var user = new User(body);
    // Guarda el documento en la base de datos
    user.save().then(() => {
        return user.generateAuthToken();
    }).then((token) => {
        response.header('x-auth', token).send(user);
    }).catch((error) => {
        response.status(400).send(error);
    })
});

app.get('/users/me', authenticate, (request, response) => {
    response.send(request.user);
});


app.listen(port, () => {
    console.log(`Started on port ${port}`);
});

module.exports = {
    app
}
