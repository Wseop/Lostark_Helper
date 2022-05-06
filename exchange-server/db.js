const MongoClient = require('mongodb').MongoClient;
require('dotenv').config();

let db = {};

MongoClient.connect(process.env.URL_DB, (err, client) => {
    if (err) return console.log(err);

    db['client'] = client.db(process.env.NAME_DB);
    db.client.collection(process.env.NAME_COLLECTION_STOVEINFO).find().toArray((err, res) => {
        if (err) return console.log(err);

        let loginInfo = {};
        loginInfo['email'] = res[0].email;
        loginInfo['pw'] = res[0].pw;
        db['loginInfo'] = loginInfo;
        
        console.log('[DB] DB Connected');
    });
});

module.exports = db;