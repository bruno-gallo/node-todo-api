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
app.post('/todos', authenticate, (request, response) => {

    // Se crea el nuevo To-Do con la propiedad text definida en el cuerpo de la request
    var todo = new Todo({
        text: request.body.text,
        _creator: request.user._id
    })

    // Guarda el documento en la base de datos
    todo.save().then((document) => {
        response.send(document);
    }, (error) => {
        response.status(400).send(error);
    });
});

app.get('/todos', authenticate,(request, response) => {
    Todo.find({
        _creator: request.user._id
    }).then((todos) => {
        response.send(
            {
            todos
        });
    }, (error) => {
        response.status(400).send(error);
    });
});

app.get('/todos/:id', authenticate, (request, response) => {
    // Obtiene la ID pasada en la URL
    var id = request.params.id;
    // Verifica que sea un ID válido
    if (!ObjectID.isValid(id))
    {
        return response.status(404).send();
    }

    Todo.findOne({
        _id: id,
        _creator: request.user._id
        }).then((todo) => {
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

app.delete('/todos/:id', authenticate,(request, response) => {
    var id = request.params.id;
    if (!ObjectID.isValid(id))
    {
        return response.status(404).send();
    }

    Todo.findOneAndRemove({
        _id: id,
        _creator: request.user._id
    }).then((todo) => {
        if (!todo) {
            return response.status(404).send();
        }
        response.status(200).send({todo})
    }).catch((error) => {
        response.status(400).send();
    });
});

app.patch('/todos/:id', authenticate, (request, response) => {
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
    Todo.findOneAndUpdate({
            _id: id,
            _creator: request.user._id
        }, {$set: body}, {new: true}).then((todo) => {
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

app.post('/users/login', (request, response) => {
    var body = _.pick(request.body, ['email', 'password']);

    User.findByCredentials(body.email, body.password).then((user) => {
        user.generateAuthToken().then((token) => {
            response.header('x-auth', token).send(user);
        });
    }).catch((error) => {
        response.status(400).send();
    })
});

app.delete('/users/me/token', authenticate, (request, response) => {
    request.user.removeToken(request.token).then(() => {
        response.status(200).send();
    }, () => {
        response.status(400).send();
    });
});

app.listen(port, () => {
    console.log(`Started on port ${port}`);
});

module.exports = {
    app
}
