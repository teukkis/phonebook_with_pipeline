const mongoose = require('mongoose')

if (process.argv.length === 2) {
  console.log('give password as argument')
  process.exit(1)
}

const password = process.argv[2]
const url = `mongodb+srv://teukka:${password}@cluster0.elklz.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`
mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true })

const numberSchema = new mongoose.Schema({
  name: String,
  number: String
})

const Number = mongoose.model('Number', numberSchema)

const getAllContacts = () => {
  Number.find({}).then( response => {
    console.log('phonebook:')
    response.map(c => console.log(`${c.name} ${c.number}`))
    mongoose.connection.close()
  })
}

const addNewContact = (name, number) => {

  const newContact = new Number({
    name: name,
    number: number
  })

  newContact.save().then(response => {
    console.log(`added ${response.name} number ${response.number} to phonebook`)
    mongoose.connection.close()
  })
}

if (process.argv.length === 3) {
  getAllContacts()
}

if (process.argv.length === 5) {
  const name = process.argv[3]
  const number = process.argv[4]
  addNewContact(name, number)
}








