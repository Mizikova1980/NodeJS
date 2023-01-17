const express = require('express')

const app = express()

const LIMIT = 3
const DELAY = 1000
const PORT = 3000

let connections = []

app.get('/', (req, res, next) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8')
  res.setHeader('Transfer-Encoding', 'chunked')
  res.send({ massege: 'Hello' })
  connections.push(res)
})

let tick = 0
setTimeout(function run () {
  console.log(tick)
  if (++tick > LIMIT) {
    connections.map((res) =>
      res.end()

    )
    connections = []
    tick = 0
  }

  connections.map((res, i) =>
    res.write(`Hello ${i}! Tick: ${tick}.\n`)
  )
  setTimeout(run, DELAY)
}, DELAY)

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})
