const yargs = require('yargs')
const fs = require('fs')
const path = require('path')
const Observer = require('./observer/observer')

const args = yargs
  .usage('Usage: node $0 [options]')
  .help('help')
  .alias('help', 'h')
  .version('0.0.1')
  .alias('version', 'v')
  .example('node $0 index.js --entry ./path/ --dist ./path --delete')
  .option('entry', {
    alias: 'e',
    describe: 'Путь к читаемой директории',
    demandOption: true
  })
  .option('dist', {
    alias: 'd',
    describe: 'Путь к итоговой папке',
    default: './dist'
  })
  .option('delete', {
    alias: 'D',
    describe: 'Удаление исходной папки',
    boolean: true,
    default: false
  })
  .epilog('первое ДЗ')
  .argv

const config = {
  src: path.normalize(path.join(__dirname, args.entry)),
  dist: path.normalize(path.join(__dirname, args.dist)),
  delete: args.delete
}

function createDir (src, cb) {
  fs.mkdir(src, function (err) {
    if (err && err.code === 'EEXIST') return cb(null)
    if (err) return cb(err)

    cb(null)
  })
}

const observer = new Observer(() => {
  if (config.delete) {
    fs.rm(config.src, { recursive: true }, () => {
      console.log('deleted')
    })
  }
})

function sorter (src, dist, del) {
  observer.addObserver(src)
  fs.readdir(src, function (err, files) {
    if (err) throw err

    files.forEach(function (file) {
      const currentPath = path.join(src, file)

      observer.addObserver(currentPath)

      fs.stat(currentPath, function (err, stats) {
        if (err) throw err
        if (stats.isDirectory()) {
          sorter(currentPath)
          observer.removeObserver(currentPath)
        } else {
          createDir(config.dist, function (err) {
            if (err) throw err
            const directory = config.dist
            const parsePath = path.parse(currentPath)
            const dirname = parsePath.name[0].toUpperCase()

            createDir(`${directory}/${dirname}`, function (err) {
              if (err) throw err
              const newPath = path.join(directory, dirname, file)
              fs.copyFile(currentPath, newPath, function (err) {
                if (err) throw err
                observer.removeObserver(currentPath)
              })
            })
          })
        }
      })
    })
    observer.removeObserver(src)
  })
}

try {
  sorter(config.src, config.dist, config.delete)
  observer.start('start')
} catch (error) {
  console.log(error.message)
}
