const Firebase = require("firebase-admin");
const serviceAccount = require("../drive-fe641-firebase-adminsdk-10pt0-2311f201a7.json");


const firebase = Firebase.initializeApp({
  credential: Firebase.credential.cert(serviceAccount),
  storageBucket: "drive-fe641.appspot.com",
});

module.exports = Firebase;
