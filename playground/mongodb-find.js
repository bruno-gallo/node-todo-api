const {MongoClient, ObjectID} = require('mongodb');

MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, db) => {

    if (err) {
        return console.log("Unable to connect so MongoDB Server");
    }
    console.log("Connected to MongoDB Server");


    // Obtiene un array con todo lo los To-Dos con la propiedad completed: false
    // db.collection('Todos').find({
    //     _id: new ObjectID("58ab6bf7fa19ed06f3297fc0")
    // }).toArray().then((docs) => {
    //     console.log("To-Dos");
    //     console.log(JSON.stringify(docs, undefined, 2));
    // }, (error) => {
    //     console.log("Unable to fetch To-dos")
    // });

    // db.collection('Todos').find().count().then((count) => {
    //     console.log(`To-Dos:  ${count}`);
    // }, (error) => {
    //     console.log("Unable to fetch To-dos")
    // });

    db.collection('Users').find({name: "Bruno"}).toArray().then((users) => {
        console.log(`Users called Bruno:`);
        console.log(JSON.stringify(users, undefined, 2));
    }, (error) => {
        console.log("Unable to fetch To-dos")
    });

    // db.close();
});
