const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');

const {app} = require('./../server.js');
const {Todo} = require('./../models/todo.js');
const {User} = require('./../models/user.js');
const {todos, populateTodos, users, populateUsers} = require('./seed/seed.js');

// Limpia la base de datos antes de cada test
beforeEach(populateUsers);
beforeEach(populateTodos);

describe('POST /todos', () => {

    it('should create a new To-do', (done) => {
        var text = 'Test todo text';

        request(app)
            .post('/todos')
            .send({text})
            .expect(200)
            .expect((response) => {
                expect(response.body.text).toBe(text);
            })
            .end((error, response) => {
                if (error) {
                    return done(error);
                }
                // Todo.find() sin parámetros devuelve todos los documentos de la colección Todo
                Todo.find({text}).then((todos) => {
                    expect(todos.length).toBe(1);
                    expect(todos[0].text).toBe(text);
                    done();
                }).catch((err) => done(err));
            });
    });

    it('should not create to-do with invalid body data', (done) => {
        request(app)
            .post('/todos')
            .send()
            .expect(400)
            .end((error, response) => {
                if (error) {
                    return done(error);
                }

                Todo.find().then((todos) => {
                    expect(todos.length).toBe(2);
                    done();
                }).catch((err) => done(err));
            })
    })
});

describe('GET /todos', () => {
    it('sould get all to-dos', (done) => {
        request(app)
            .get('/todos')
            .expect(200)
            .expect((response) => {
                expect(response.body.todos.length).toBe(2);
            })
            .end(done);
    });
});

describe('Get /todos/:id', () => {

    it ('should return todo doc', (done) => {
        request(app)
            .get(`/todos/${todos[0]._id.toHexString()}`)
            .expect(200)
            .expect((response) => {
                expect(response.body.todo.text).toBe(todos[0].text)
            })
            .end(done);
    });

    it ('should return 404 if to-do not found', (done) => {
        var id = new ObjectID();
        request(app)
            .get(`/todos/${id.toHexString()}`)
            .expect(404)
            .end(done);
    })

    it ('should return 404 for non-objects id', (done) => {
        request(app)
            .get('/todos/123')
            .expect(404)
            .end(done);
    })

});

describe('DELETE /todos/:id', () => {

    it ('should remove a to-do', (done) => {
            var hexId = todos[1]._id.toHexString();

            request(app)
                .delete(`/todos/${hexId}`)
                .expect(200)
                .expect((response) => {
                    expect(response.body.todo._id).toBe(hexId);
                })
                .end((error, response) => {
                    if (error) {
                        return done(error);
                    }

                    Todo.findById(hexId).then((todo) => {
                        expect(todo).toNotExist();
                        done();
                    }).catch((err) => done(err));

                })
    });

    it ('should return 404 if to-do not found', (done) => {
        var id = new ObjectID();
        request(app)
            .delete(`/todos/${id.toHexString()}`)
            .expect(404)
            .end(done);
    });

    it ('should return 404 if Object ID is invalid', (done) => {
        request(app)
            .delete('/todos/123')
            .expect(404)
            .end(done);
    });
});

describe('PATCH /todos/:id', () => {

    it ('should update the todo', (done) => {
        var hexId = todos[0]._id.toHexString();
        var text = "New text";
        var completed = true;
        request(app)
            .patch(`/todos/${hexId}`)
            .send({
                text,
                completed
            })
            .expect(200)
            .expect((response) => {
                expect(response.body.todo.text).toBe(text);
                expect(response.body.todo.completed).toBe(true);
                expect(response.body.todo.completedAt).toBeA('number');
            })
            .end((error, response) => {
                if (error) {
                    return done(error);
                }
                Todo.findById(hexId).then((todo) => {
                    expect(todo.text).toBe(text);
                    expect(todo.completed).toBe(true);
                    expect(todo.completedAt).toBeA('number');
                    done();
                }).catch((err) => done(err));
            });
    });

    it ('should clear completedAt', (done) => {
        var hexId = todos[1]._id.toHexString();
        var text = "Other text";
        var completed = false;
        request(app)
            .patch(`/todos/${hexId}`)
            .send({
                text,
                completed
            })
            .expect(200)
            .expect((response) => {
                expect(response.body.todo.text).toBe(text);
                expect(response.body.todo.completed).toBe(false);
                expect(response.body.todo.completedAt).toNotExist();
            })
            .end((error, response) => {
                if (error) {
                    return done(error);
                }
                Todo.findById(hexId).then((todo) => {
                    expect(todo.text).toBe(text);
                    expect(todo.completed).toBe(false);
                    expect(todo.completedAt).toNotExist();
                    done();
                }).catch((err) => done(err));
            });
    });
});

describe('GET /users/me', () => {
    it ('should return user if authenticated', (done) => {
        request(app)
            .get('/users/me')
            .set('x-auth', users[0].tokens[0].token)
            .expect(200)
            .expect((response) => {
                expect(response.body._id).toBe(users[0]._id.toHexString());
                expect(response.body.email).toBe(users[0].email);
            })
            .end(done);
    });

    it ('should return 401 if not authenticated', (done) => {
        request(app)
            .get('/users/me')
            .expect(401)
            .expect((response) => {
                expect(response.body).toEqual({});
            })
            .end(done);
    })
});

describe('POST /users', () => {
    it ('should create a user', (done) => {
        var email = 'test@test.com';
        var password = '123123123';

        request(app)
            .post('/users')
            .send({
                email,
                password
            })
            .expect(200)
            .expect((response) => {
                expect(response.headers['x-auth']).toExist();
                expect(response.body._id).toExist();
                expect(response.body.email).toBe(email);
            })
            .end((error) => {
                if (error) {
                    return done(error);
                }
                User.findOne({email}).then((user) => {
                    expect(user).toExist();
                    expect(user.password).toNotBe(password);
                    done();
                }).catch((e) => done(e));
            });
    });

    it ('should return validation errors if request invalid', (done) => {
        var invalidEmail = 'testtest.com';
        var invalidPassword = '12';

        request(app)
            .post('/users')
            .send({
                emal: invalidEmail,
                password: invalidPassword
            })
            .expect(400)
            .end(done);
    });

    it ('should not create user if email in use', (done) => {
        var repeatedEmail = 'bruno@example.com';
        var password = '1234567';

        request(app)
            .post('/users')
            .send({
                emal: repeatedEmail,
                password
            })
            .expect(400)
            .end(done);
    });
})

describe ('POST /users/login', () => {
    it ('should login user and return auth token', (done) => {
        var email = users[1].email;
        var password = users[1].password;

        request(app)
            .post('/users/login')
            .send({email, password})
            .expect(200)
            .expect((response) => {
                expect(response.headers['x-auth']).toExist();
            })
            .end((error, response) => {
                if (error) {
                    return done(error);
                }
                User.findById(users[1]._id).then((user) => {
                    expect(user.tokens[0]).toInclude({
                        access: 'auth',
                        token: response.headers['x-auth']
                    });
                    done();
                }).catch((e) => done(e));
            });
    });

    it ('should reject invalid login', (done) => {
        var email = users[1].email;
        var password = "WrongPassword"

        request(app)
            .post('/users/login')
            .send({email, password})
            .expect(400)
            .expect((response) => {
                expect(response.headers['x-auth']).toNotExist();
            })
            .end((error, response) => {
                if (error) {
                    return done(error);
                }
                User.findById(users[1]._id).then((user) => {
                    expect(user.tokens.length).toBe(0);
                    done();
                }).catch((e) => done(e));
            });
    });
});
