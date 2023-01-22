let tick = 0
setTimeout(function run () {
  console.log(tick)
  if (++tick > LIMIT) {
    connections.map(res => {
      return (res.write('END\n'),
      res.end())
    })
    connections = []
    tick = 0
  }
  connections.map((res, i) => {
    return res.write(`Hello ${i}! Tick: ${tick}.\n`)
  })
  setTimeout(run, DELAY)
}, DELAY)