const expect = require('expect');
const request = require('supertest');

const {app} = require('./../server.js');
const {Todo} = require('./../models/todo.js');

const todos = [
    {
        text: "First test todo"
    },
    {
        text: "Second test todo"
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
