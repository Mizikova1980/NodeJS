const yargs = require('yargs')
const fs = require('fs')
const path = require('path')

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
  if (!fs.existsSync(src)) {
    fs.mkdir(src, function (err) {
      if (err) return cb(err)

      cb(null)
    })
  } else {
    cb(null)
  }
}

function sorter (src) {
  fs.readdir(src, function (err, files) {
    if (err) throw err

    files.forEach(function (file) {
      const currentPath = path.join(src, file)
      fs.stat(currentPath, function (err, stats) {
        if (err) throw err
        if (stats.isDirectory()) {
          sorter(currentPath)
        } else {
          createDir(config.dist, function (err) {
            if (err) throw err
            const directory = config.dist
            const parsePath = path.parse(currentPath)
            console.log(parsePath)
            const dirname = parsePath.name[0].toUpperCase()
            console.log(dirname)
            console.log(`copy file: ${currentPath}`)

            createDir(`${directory}/${dirname}`, function (err) {
              if (err) throw err
              const newPath = path.join(directory, dirname, file)
              fs.rename(currentPath, newPath, function (err) {
                if (err) throw err
              })
              console.log(newPath)
            })
          })
        }
      })
    })
  })
}
try {
  sorter(config.src)
} catch (error) {
  console.log(error.message)
}
