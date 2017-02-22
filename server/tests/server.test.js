const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');

const {app} = require('./../server.js');
const {Todo} = require('./../models/todo.js');

const todos = [
    {
        _id: new ObjectID(),
        text: "First test todo"
    },
    {
        _id: new ObjectID(),
        text: "Second test todo",
        completed: true,
        completedAt: 333
    }
];

// Limpia la base de datos antes de cada test
beforeEach((done) => {
    Todo.remove({}).then(() => {
        Todo.insertMany(todos).then(() => done());
    });
});

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
