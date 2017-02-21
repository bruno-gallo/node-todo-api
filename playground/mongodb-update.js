const {MongoClient, ObjectID} = require('mongodb');

MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, db) => {

    if (err) {
        return console.log("Unable to connect so MongoDB Server");
    }
    console.log("Connected to MongoDB Server");

    // db.collection('Todos').findOneAndUpdate(
    //     {
    //         _id: new ObjectID("58ac7acf22caff8ea717fb00")
    //     },
    //     {
    //         $set: {
    //             completed: true
    //         }
    //     },
    //     {
    //         returnOriginal: false
    //     })
    //     .then((result) => {
    //         console.log(JSON.stringify(result, undefined, 2));
    // });

    db.collection('Users').findOneAndUpdate(
        {
            _id: new ObjectID("58ac7d8c22caff8ea717fbec")
        },
        {
            $set: {
                name: "Bruno"
            },
            $inc: {
                age: 1,
            }
        },
        {
            returnOriginal: false
        })
        .then((result) => {
            console.log(JSON.stringify(result, undefined, 2));
    });
    // db.close();
});
