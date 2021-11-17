import React, { useState, useEffect } from 'react'
import contactService from './services/contact'

const Person = ({person, erase}) => {
  return (
    <table>
      <tbody>
        <tr>
          <td>{person.name}</td>
          <td>{person.number}</td>
          <td><button onClick={erase}>delete</button></td>
        </tr>
      </tbody>
    </table>
    )
}

const PersonForm = ({valueName, handleAddName, handleAddNumber, valueNumber}) => {
  return (
    <div>
      name: <input value={valueName} onChange={handleAddName} /><br/>
      number: <input value={valueNumber} onChange={handleAddNumber} />
    </div>
  )
}

const DisplayPersons = ({showPersonList}) => {
  return (
    showPersonList
  )
}

const Notification = ({message}) => {
  if (message === null) {
    return <span></span>
  }

  return (
    <div className='notif'>
      {message}
    </div>
  )
}

const App = () => {

  //define states
  const [ persons, setPersons ] = useState([]) 
  const [ newName, setNewName ] = useState('')
  const [ newNumber, setNewNumber ] = useState('')
  const [ search, setSearch ] = useState('')
  const [ filtered, setFiltered ] = useState([])
  const [ state, setState ] = useState(true)
  const [ operation, setOperation ] = useState(null)
  
  //fetch all persons
  useEffect (() => {
    contactService
      .getAll()
      .then(response => {
        setPersons(response.data)
      })
  }, [])

  //add person
  const addPerson = (event) => {
    event.preventDefault()

    //check if there is the person already
    const found = persons.find(person => {
      return newName === person.name
    })

    if (found === undefined) {
      const personObject = {
        name: newName,
        number: newNumber 
      }

      //add new person to phonebook
      if (newName !== '' && newNumber !== '') {
        contactService
        .create(personObject)
        .then(response => {
          setPersons(persons.concat(response.data))
          setOperation(`${personObject.name} added`)
          setNewName('')
          setNewNumber('')

          setTimeout(() => {
            setOperation(null)
          }, 3000)
        })
        .catch(error => {
          setOperation(`${error.response.data.error}`)
          setNewName('')
          setNewNumber('')
          setTimeout(() => { setOperation(null) }, 6000)
        })
      } else {
        window.alert("both name and number are required")
      }
      

    } else {

      //update person's number
      let confirmed = window.confirm(`${found.name} is already on the list. Would you like to change the number?`)
      
      if (confirmed === true) {
        const changedContact = { ...found, number: newNumber}
        contactService
        .update(found.id, changedContact)
        .then( response => {
          setPersons(persons.map(p => p.id !== found.id ? p : response.data))
          setOperation(`The phone number of ${found.name} was modified successfully`)
          setNewName('')
          setNewNumber('')

          setTimeout(() => {
            setOperation(null)
          }, 5000)

        })
        .catch(error => {
          window.alert(`${error} occured`)
        }) 
      }
    }
  }

  //remove person
  const handleErase = (id) => {
    const rr = persons.filter(val => val.id === id)

    contactService
      .eraseContact(id)
      .then(response => {
        setPersons(persons.filter(m => {
         return  m.id !== id
          })
        )

        setOperation(`${rr[0].name} deleted`)
        setTimeout(() => {
          setOperation(null)
        }, 5000)
      })
      .catch(error => {
        setOperation(`All information about ${rr[0].name} has been deleted already`)
        setTimeout(() => {
          setOperation(null)
        }, 5000)
      })
  }

  //search for people by name
  const handleSearch = (event) => {
    setState(false)
    setSearch(event.target.value)
    setFiltered(persons.filter(val => {
      return val.name.includes(event.target.value, 0)
      }))

      if (event.target.value === '') {
        setState(true)
      }
    }
   
  const handleAddName = (event) => {
    setNewName(event.target.value) 
  }

  const handleAddNumber = (event) => {
    setNewNumber(event.target.value)
  }

  const personsToShow = state ? persons : filtered
      
  const rows = () => personsToShow.map( person =>  {
    return (
      <Person
        key={person.id}
        person={person}
        erase={() => handleErase(person.id)}
      />
    )
  })
  
  return (
    <div>
      <h2>Phonebook</h2>
      <Notification message={operation}/>
      <form>
        filter shown with <input value={search} onChange={handleSearch}/>
      </form>
      <h2>Add new</h2>
      <form onSubmit={addPerson} >
        <PersonForm 
        valueName={newName} 
        handleAddName={handleAddName} 
        valueNumber={newNumber} 
        handleAddNumber={handleAddNumber}
        />
        <div>
          <button type="submit">Add</button>
        </div>
      </form>
      <h2>Numbers</h2>
      <DisplayPersons showPersonList={rows()}/>
    </div>
  )

}

export default App