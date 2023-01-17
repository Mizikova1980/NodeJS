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

const deleteDir = config.delete
const srcDir = config.src

function createDir (src, cb) {
  fs.mkdir(src, function (err) {
    if (err && err.code === 'EEXIST') return cb(null)
    if (err) return cb(err)

    cb(null)
  })
}

function sorter (src, dist, del) {
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
            const dirname = parsePath.name[0].toUpperCase()

            createDir(`${directory}/${dirname}`, function (err) {
              if (err) throw err
              const newPath = path.join(directory, dirname, file)
              fs.copyFile(currentPath, newPath, function (err) {
                if (err) throw err
                if (deleteDir) {
                  fs.unlink(currentPath, () => {
                    // fs.rmdir(dir, () => {})
                    gitfs.rmdir(srcDir, () => {})
                  })
                }
              })
            })
          })
        }
      })
    })
  })
}

try {
  sorter(config.src, config.dist, config.delete)
} catch (error) {
  console.log(error.message)
}
