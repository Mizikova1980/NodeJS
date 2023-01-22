require('dotenv').config()
const express = require('express')
const app = express()

const DELAY = process.env.DELAY
const LIMIT = process.env.LIMIT
const PORT = process.env.PORT

let connections = []

const currentDate = new Date()

app.get('/', (req, res, next) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8')
  res.setHeader('Transfer-Encoding', 'chunked')
  connections.push(res)
})

let tick = 0
setTimeout(function run () {
  console.log(currentDate)
  if (++tick > LIMIT) {
    connections.map(res => {
      return (res.write(`${currentDate}\n`),
      res.end())
    })
    connections = []
    tick = 0
  }
  // connections.map((res, i) => {
  //   return res.write(`${currentDate}\n`)
  // })
  setTimeout(run, DELAY)
}, DELAY)

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})
