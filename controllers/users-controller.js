const { v4: uuidv4 } = require('uuid')
const { validationResult } = require('express-validator')
const HttpError = require('../models/http-error')
const User = require('../models/user')

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

const signup = async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return next(
      new HttpError('Invalid inputs passed, please enter valid data', 422)
    )
  }

  const { name, email, password } = req.body

  let existingUser
  try {
    existingUser = await User.findOne({ email: email })
  } catch (err) {
    const error = new HttpError(
      'Signing up failed, please try again later',
      500
    )
    return next(error)
  }

  if (existingUser) {
    const error = new HttpError(
      'User already exists, please login instead',
      422
    )
    return next(error)
  }

  const createdUser = new User({
    name,
    email,
    image:
      'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=387&q=80',
    password,
    places,
  })

  try {
    await createdUser.save()
  } catch (err) {
    const error = new HttpError(
      'Signing up failed, please try again later',
      500
    )
    return next(error)
  }

  res.status(201).json({ user: createdUser.toObject({ getters: true }) })
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
