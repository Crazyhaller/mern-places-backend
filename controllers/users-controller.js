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

const getUsers = async (req, res, next) => {
  let users
  try {
    users = await User.find({}, '-password')
  } catch (err) {
    const error = new HttpError(
      'Fetching users failed, please try again later',
      500
    )
    return next(error)
  }

  res.json({ users: users.map((user) => user.toObject({ getters: true })) })
}

const signup = async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return next(
      new HttpError('Invalid inputs passed, please enter valid data', 422)
    )
  }

  const { name, email, password, places } = req.body

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

const login = async (req, res, next) => {
  const { email, password } = req.body

  let existingUser
  try {
    existingUser = await User.findOne({ email: email })
  } catch (err) {
    const error = new HttpError(
      'Logging in failed, please try again later',
      500
    )
    return next(error)
  }

  if (!existingUser || existingUser.password !== password) {
    const error = new HttpError(
      'Invalid credentials, could not log you in',
      401
    )
    return next(error)
  }

  res.json({ message: 'Logged In' })
}

exports.getUsers = getUsers
exports.signup = signup
exports.login = login
