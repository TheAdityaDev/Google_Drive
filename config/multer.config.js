const multer = require('multer');
const Firebase = require('./firebase.config')
const fireBaseStorage = require('multer-firebase-storage'); // ✅ fixed typo
const serviceAccount = require('../drive-fe641-firebase-adminsdk-10pt0-2311f201a7.json'); // ✅ must be JSON object

const storage = fireBaseStorage({
      credentials:  Firebase.credential.cert(serviceAccount) ,// ✅ this must be the actual JSON object
      bucketName: 'drive-fe641.appspot.com',
      unique:true
    })
const upload = multer({
    storage: storage,
  })
module.exports = upload;
