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

function readdir (src) {
  return new Promise((resolve, reject) => {
    fs.readdir(src, (err, files) => {
      if (err) reject(err)
      resolve(files)
    })
  })
}

function stats (src) {
  return new Promise((resolve, reject) => {
    fs.stat(src, (err, stats) => {
      if (err) reject(err)
      resolve(stats)
    })
  })
}

function createDir (src) {
  return new Promise((resolve, reject) => {
    fs.mkdir(src, (err, cb) => {
      if (err && !err.code === 'EEXIST') reject(err)
      resolve(null)
    })
  })
}

function deleteDir (src) {
  return new Promise((resolve, reject) => {
    fs.rm(src, { recursive: true }, (err, cb) => {
      if (err) reject(err)
      resolve(console.log('deleted'))
    })
  })
}

function copyFile (currentPath, newPath) {
  return new Promise((resolve, reject) => {
    fs.copyFile(currentPath, newPath, (err, newPath) => {
      if (err) reject(err)
      resolve(newPath)
    })
  })
}

(async function () {
  async function sorter (src) {
    const files = await readdir(src)

    for (const file of files) {
      const currentPath = path.join(src, file)
      const stat = await stats(currentPath)

      if (stat.isDirectory()) {
        await sorter(currentPath)
      } else {
        await createDir(config.dist)
        const directory = config.dist
        const parsePath = path.parse(currentPath)
        const dirname = parsePath.name[0].toUpperCase()
        await createDir(`${directory}/${dirname}`)
        const newPath = path.join(directory, dirname, file)
        await copyFile(currentPath, newPath)
      }
    }
  }

  try {
    await sorter(config.src)
    if (config.delete) {
      await deleteDir(config.src)
    }
  } catch (error) {
    console.log(error)
  }
})()
