const mongoose = require('mongoose')

const DBconnect = () =>{
    mongoose.connect(process.env.MONGO_URL).then(()=>{
    console.log(`DB connect successfully`)
}).catch(err=>{
    console.log(err)
})
}

module.exports = DBconnect