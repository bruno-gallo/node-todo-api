const {MongoClient, ObjectID} = require('mongodb');

MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, db) => {

    if (err) {
        return console.log("Unable to connect so MongoDB Server");
    }
    console.log("Connected to MongoDB Server");

    // delete many
    // db.collection('Todos').deleteMany({text: "Eat lunch"}).then((result) => {
    //     console.log(result);
    // });

    // delete one
    // db.collection('Todos').deleteOne({text: "Eat lunch"}).then((result) => {
    //     console.log(result);
    // });

    // find one and delete
    // db.collection('Todos').findOneAndDelete({completed: false}).then((result) => {
    //     console.log(result);
    // });

    // db.collection('Users').deleteMany({name: "Bruno"}).then((result) => {
    //     console.log(result);
    // });

    db.collection('Users').findOneAndDelete({_id: new ObjectID("58ac7f3322caff8ea717fc92")})
        .then((result) => {
            console.log(JSON.stringify(result, undefined, 2));
    });

    // db.close();
});
