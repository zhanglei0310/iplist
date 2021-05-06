const glob = require('glob').sync
const path = require('path')
const fs = require('fs')
const YAML = require('yaml')

const defaultInfo = {
  country_name: '未知',
  region_name: '',
  city_name: '',
  district_name: '',
  'iso3166_1': '',
  'iso3166_2': '',
  'china_admin_code': '',
  'owner_domain': '',
  'isp_domain': ''
}

class Format {

  cwd = ''
  hashmap = null
  filenameDict = []

  constructor (options = {}) {
    this.hashmap = new Map()
    this.cwd = options.cwd || 'dist/country'
    this.filenameDict = options.filenameDict || ['country_name', 'region_name', 'city_name', 'district_name']
    this.dic = options.dic || 'qqwry'
    const files = glob(`**/${this.dic}.dic`, {
      cwd: this.cwd
    })
    for (const file of files) {
      this.import(file)
    }
  }

  import (file) {
    const filename = file.split('/').slice(0, -1)
    const filenameMap = {}
    for (let i = 0; i < this.filenameDict.length; i++) {
      filenameMap[this.filenameDict[i]] = filename[i] || ''
    }
    let info = Object.assign({}, defaultInfo, filenameMap)
    for (let i = 1; i <= filename.length; i++) {
      const tempdir = path.join(this.cwd, ...filename.slice(0, i), 'meta.yaml')
      if (fs.existsSync(tempdir)) {
        const yamlContent = fs.readFileSync(tempdir, 'utf8')
        const meta = YAML.parse(yamlContent)
        info = Object.assign({}, info, meta)
      }
    }
    let raws = fs.readFileSync(path.join(this.cwd, ...filename, `${this.dic}.dic`), 'utf8')
    raws = raws.trim().split('\n')
    for (const raw of raws) {
      this.hashmap.set(raw, info)
    }
  }

  execute (string) {
    const info = this.hashmap.get(string)
    return Object.assign({}, defaultInfo, info)
  }

}

module.exports = Format