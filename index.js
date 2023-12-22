const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const mongoose = require('mongoose')

app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});
var bodyParser = require('body-parser');
const { ObjectId } = require('mongodb')

app.use(bodyParser.urlencoded({ extended: false }))


mongoose.connect("mongodb+srv://michaelgalan:ILoveFriend@exercisedata.wculdst.mongodb.net/?retryWrites=true&w=majority")

console.log(mongoose.connection.readyState);


const exerciseSchema = new mongoose.Schema({ 
  username: String, 
  description: String, 
  duration: Number, 
  date: String,
  userID: String
},{versionKey:false})

//,{versionKey:false}

const user_Schema = new mongoose.Schema({
  username: String,
})

const log_Schema = new mongoose.Schema({
  username: String, 
  count: Number,  
  log: [{
    description: String, 
    duration: Number, 
    date: String,
    _id: false,
  }]
})

const User = mongoose.model("User", user_Schema)

const Exercise = mongoose.model("Exercise", exerciseSchema)

const Log = mongoose.model("Log_Exercise", log_Schema)

app.post("/api/users", async (req, res) => {

  //await User.deleteMany();

  let name = req.body.username
  //console.log(name);
  run()

  async function run() {
    const firstUser = new User({ 
      username: name, 
    })
    await firstUser.save()
    console.log(firstUser);

    return res.json(firstUser)
 }
})

app.get("/api/users", async (req, res) => {
  const users = await User.find({})
  let usersArray = [] 
  users.forEach((username) => {
    //console.log(username)
    usersArray.push(username);
  })
  return res.json(usersArray)
})

app.post("/api/users/:id/exercises", async (req, res) => {
  //await Exercise.deleteMany();

  try {
    const realID = req.params.id
    const description = req.body.description
    const duration = req.body.duration
    let date = req.body.date

    if (req.body.date ==  "" || req.body.date == undefined) {
      date = new Date().toDateString() ;
    }
    else {
      date = new Date(date).toDateString()
    }

  let updatedDate = date

  let updatedUser = await User.findOne({ _id: realID })

  const firstExercise = new Exercise({ 
    username: updatedUser.username,
    description: description, 
    duration: duration, 
    date: updatedDate,
    userID: realID,
  })

  await firstExercise.save();

  res.send({
    username: updatedUser.username, 
    description: description, 
    duration: duration, 
    date: updatedDate,
    _id: realID
  })
  }
  catch(err) {    
    console.log(err);
    return res.json({"hello": "motherfucker"})
  }
  
})

app.get('/api/users/:_id/logs', async (req, res) => {

  const from = req.query.from;
  const to = req.query.to;
  const limit = req.query.limit;

  console.log(from);
  console.log(to);



  const realID = req.params._id

  let updatedUser = await User.findOne({ _id: realID })

  const results = await Exercise.find({ userID : realID}).limit(limit || 500)

  console.log("TESTING");
  console.log(results);
  console.log("TESTING");

  const updatedArray = results.map((exercise) => {
    //console.log(exercise);
    return {description: exercise.description, duration: exercise.duration, date: exercise.date}
  })

  console.log("This should clarify things");
  console.log(updatedArray)

  if (results.length !== 0) {
    const firstLog = new Log({
      username: results[0].username,
      count: results.length,
      log: updatedArray
    }) 
  
    await firstLog.save();
  
    return res.json(firstLog)
  }
  else {
    const secondLog = new Log({
      username: updatedUser.username,
      count: 0,
      log:[]
    })

    await secondLog.save()

    return res.json(secondLog)
  }

  

  

})


const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
