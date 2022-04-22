const MongoClient = require('mongodb').MongoClient;

require('dotenv').config();

let db = {};

MongoClient.connect(process.env.DB_URL, (err, client) => {
    if (err) return console.log(err);

    db['client'] = client.db('LoaHelper');
    console.log('[DB] db connected');

    db.client.collection('stove_login_info').find().toArray((err, res) => {
        if (err) return console.log(err);

        let loginInfo = {};
        loginInfo['email'] = res[0].email;
        loginInfo['pw'] = res[0].pw;
        db['login_info'] = loginInfo;
        console.log('[DB] get stove login info');
    });
});

module.exports = db;