const { v4: uuidv4 } = require('uuid')
const { validationResult } = require('express-validator')
const HttpError = require('../models/http-error')

const DUMMY_USERS = [
  {
    id: 'u1',
    name: 'Gareth Bale',
    email: 'test@test.com',
    password: 'tester',
  },
]

const getUsers = (req, res, next) => {
  res.json({ users: DUMMY_USERS })
}

const signup = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    throw new HttpError('Invalid inputs passed, please enter valid data', 422)
  }

  const { name, email, password } = req.body

  const hasUser = DUMMY_USERS.find((u) => u.email === email)
  if (hasUser) {
    throw new HttpError('Could create a user, email already exists', 422)
  }

  const createdUser = {
    id: uuidv4(),
    name,
    email,
    password,
  }

  DUMMY_USERS.push(createdUser)

  res.status(201).json({ user: createdUser })
}

const login = (req, res, next) => {
  const { email, password } = req.body

  const identifiedUser = DUMMY_USERS.find((u) => u.email === email)

  if (!identifiedUser || identifiedUser.password !== password) {
    throw new HttpError(
      'Could not find the user, credentials seems to be wrong',
      401
    )
  }

  res.json({ message: 'Logged In' })
}

exports.getUsers = getUsers
exports.signup = signup
exports.login = login
