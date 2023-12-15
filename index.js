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
  userId: {type: String, required: true}, 
  username: String, 
  description: String, 
  duration: Number, 
  date: String,
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    index: true,
    required: true,
    auto: true,
  }              
}, {versionKey: false})

const user_Schema = new mongoose.Schema({
  username: String,
})

const User = mongoose.model("User", user_Schema)



const Exercise = mongoose.model("Exercise", exerciseSchema)

app.post("/api/users", (req, res) => {
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
  await Exercise.deleteMany();

  try {
    const realID = req.params.id
    const description = req.body.description
    const duration = req.body.duration
    let date = req.body.date

    //console.log(date);
    //console.log(new Date(date));
    date = new Date(date).toDateString()

    //date = date.toDateString() 

    if (req.body.date ==  "" || req.body.date == undefined) {
      date = new Date().toDateString() ;
    };

  let updatedDate = date

  let updatedUser = await User.findOne({ _id: realID })

  console.log(updatedUser);

  const firstExercise = new Exercise({
    userId: realID, 
    username: updatedUser.username,
    description: description, 
    duration: duration, 
    date: updatedDate
  })

  await firstExercise.save();

  console.log(firstExercise);

  return res.json(firstExercise);
  }
  catch(err) {    
    console.log(err);
    return res.json({"hello": "motherfucker"})
  }
  
})


const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
