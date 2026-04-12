const express = require('express')
const app = express()
const connectDB = require('./config/db')


const port  = process.env.PORT || 3000
app.listen(port,()=>{
    console.log(`server is running on port ${port}`)
    connectDB();
})
