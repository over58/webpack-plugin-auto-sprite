const glob = require('glob')
const chokidar = require('chokidar')
const debounce = require('lodash/debounce')
const Spritesmith = require('spritesmith')
const path = require('path')
const mkdirp = require('mkdirp')
const fs = require('fs')
const templater = require('spritesheet-templates')

class AutoSprite {
  constructor(options) {
    this._options = options

    if (!this._options.target) {
      this._options.target = {}
    }
    this._options.target.cssPath =
      options.target.cssPath || 'assets/css/sprite.css'
    this._options.target.imgPath =
      options.target.imgPath || 'assets/img/sprite.png'
  }

  apply(compiler) {
    console.log('AutoSprite Plugin Apply')
    compiler.hooks.run.tap('webpack-plugin-auto-sprite', (compiler) => {
      console.log('trigger run hook')
    })

    compiler.hooks.watchRun.tap('webpack-plugin-auto-sprite', (compiler) => {
      console.log('trigger watchRun hook')
      this.getWatcher(() => {
        this.generateSprite()
      })
    })
  }

  getWatcher(cb) {
    this._watcher = chokidar.watch(this._options.glob, {
      ignoreInitial: true,
      cwd: this._options.cwd,
    })

    this._watcher.on(
      'all',
      debounce((event, path) => {
        console.log('file watch:', event, path)
        typeof cb === 'function' && cb()
      }),
      this._options.debounceTime || 0
    )
  }

  async generateSprite() {
    console.log('生成精灵图')
    const paths = await getPaths(this._options.glob, this._options.cwd)
    const sourcePaths = paths.map((x) => path.resolve(this._options.cwd, x))
    console.log(paths, sourcePaths)
    const spriteRes = await this.spritesmithRunPromisefy(sourcePaths)
    console.log('spriteRes', spriteRes)
    const cssPath = path.resolve(
      this._options.cwd,
      this._options.target.cssPath
    )
    const imgPath = path.resolve(
      this._options.cwd,
      this._options.target.imgPath
    )

    // cssPath 相对于 imgPath 的path
    const cssToImg = path.normalize(
      path.relative(path.dirname(cssPath), imgPath)
    )
    if (spriteRes.image) {
      writeFile(imgPath, spriteRes.image)
    }

    const spritesheetObj = Object.entries(spriteRes.coordinates).reduce(
      (res, [k, v]) => {
        res.push({
          name: path.parse(k).name,
          ...v,
        })
        return res
      },
      []
    )

    console.log('===spritesheetObj', spritesheetObj)

    const templaterRes = templater({
      sprites: spritesheetObj,
      spritesheet: {
        ...spriteRes.properties,
        image: cssToImg,
      },
    })

    await writeFile(cssPath, templaterRes)
  }

  spritesmithRunPromisefy(src) {
    return new Promise((resolve, reject) => {
      Spritesmith.run({ src }, function handleResult(err, result) {
        if (err) {
          reject(err)
        } else {
          resolve(result)
        }
      })
    })
  }
}

module.exports = AutoSprite

const getPaths = (globPath, cwd) => {
  return new Promise((resolve, reject) => {
    glob(
      globPath,
      {
        cwd,
      },
      function (err, files) {
        if (err) {
          reject(err)
        } else {
          resolve(files)
        }
      }
    )
  })
}

async function writeFile(dir, image) {
  return new Promise(function (resolve, reject) {
    mkdirp.sync(path.dirname(dir))
    fs.writeFile(dir, image, (err) => {
      if (err) {
        reject(err)
      } else {
        resolve()
      }
    })
  })
}
