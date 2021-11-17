require('dotenv').config()
const express = require('express')
const app = express()
var morgan = require('morgan')
const cors = require('cors')
const mongoose = require('mongoose')
var uniqueValidator = require('mongoose-unique-validator')

app.use(express.json())
app.use(cors())
app.use(express.static('build'))


morgan.token('body', (req) => JSON.stringify(req.body))
app.use(morgan(':method :url :status - :req[content-length] - :response-time ms :body'))

const PORT = process.env.PORT || 3001

const url = process.env.MONGODB_URI
mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true }).then(() => console.log('connected to db'))

const numberSchema = new mongoose.Schema({
  name: {
    type: String,
    minLength: 3,
    unique: true
  },
  number: {
    type: String,
    minLength: 8
  }
})

numberSchema.plugin(uniqueValidator)


const Number = mongoose.model('Number', numberSchema)

numberSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

app.get('/api/healthcheck', (req, res) => {
  res.status(200).send(true)
})

app.get('/api/persons', (req, res, next) => {
  Number.find({}).then( response => {
    if (response) {
      res.json(response)

    } else {
      res.status(404).end()
    }
  })
    .catch(error => next(error))
})

app.get('/api/persons/:id', (req, res, next) => {
  const params = req.params
  Number.find({ _id: params.id }).then( response => {
    if (response.length === 0){
      res.status(404).send('not found')
    } else {
      res.json(response)
    }
  })
    .catch(error => next(error))
})

app.delete('/api/persons/:id', (req, res, next) => {
  const params = req.params
  Number.deleteOne({ _id: params.id }).then( response => {
    if (response.deletedCount === 0){
      res.status(404).send('not found')
    } else {
      res.status(204).send('Person deleted succesfully')
    }
  })
    .catch(error => next(error))
})

app.post('/api/persons', (req, res, next) => {
  const body = req.body
  const isNameEmpty = body.name
  const isNumberEmpty = body.number

  if (!(isNameEmpty)) {
    return res.status(400).send({ message: 'fill out the name field as well' })
  }

  else if (!(isNumberEmpty)) {
    return res.status(400).send({ message: 'fill out the number field' })
  }

  const newContact = new Number( {
    name: body.name,
    number: body.number
  })
  newContact.save().then(savedContact => {
    return res.json(savedContact)
  })
    .catch(error => next(error))
})

app.put('/api/persons/:id', (req, res, next) => {
  const body = req.body
  const isNumberEmpty = body.number

  if (!(isNumberEmpty)) {
    return res.status(400).send({ message: 'To edit a contact, you need to input a number' })
  }

  Number.findByIdAndUpdate(req.params.id, { number: body.number }, { new: true })
    .then(savedContact => {
      return res.json(savedContact)
    })
    .catch(error => next(error))
})

app.get('/info', (req, res) => {
  Number.countDocuments().then( sizeOfPhoneBook => {
    const infoText = `Phonebook has info for ${sizeOfPhoneBook} people`
    const timeStamp = new Date()
    res.status(200).send(
      `<div>
            <p>${infoText}</p>
            <p>${timeStamp}</p>
        </div>`
    )
  })

})

const unknownEndpoint = (req, res) => {
  res.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const errorHandler = (error, req, res, next) => {
  if (error.name === 'CastError') {
    return res.status(400).send({ error: 'malformatted id' })
  }
  else if (error.name === 'ValidationError') {
    return res.status(400).json({ error: error.message })
  }
  next(error)
}

app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})


