const vinyl = require('vinyl')
const IPDB = require('ipdb')
const ipdb_range = require('@ipdb/range')
const ProgressBar = require('progress')
const Format = require('../format')

let format = null

const getCountryISO3166 = (info) => {
  const data = format.execute([info.country, info.area].join('|'))
  return data.iso3166_1
}

const plugin = (through2, file, cb) => {

  console.log('Parse ipdb')

  format = new Format({
    cwd: 'alias/country',
    filenameDict: ['country_name', 'region_name', 'city_name', 'district_name'],
    dic: 'qqwry'
  })

  const ipdb = new IPDB(file.contents, {
    patches: [ipdb_range]
  })

  let bar = new ProgressBar(':bar :current/:total', { total: ipdb.meta.node_count })

  let result = []
  let ip = '0.0.0.0'
  while (true) {
    const info = ipdb.find(ip).data
    const iso3166_1 = getCountryISO3166(info)
    if (iso3166_1.length === 2) {
      if (!result[iso3166_1]) {
        result[iso3166_1] = []
      }
      result[iso3166_1].push(`${info.range.from}/${info.bitmask}`)
    }
    bar.tick()
    ip = info.range.next
    if (ip === '0.0.0.0') break
  }

  console.log()

  for (let [country_code, cidrs] of Object.entries(result)) {
    let temp = new vinyl({
      cwd: '/',
      base: '/',
      path: `/${country_code}.txt`,
      contents: new Buffer.from(cidrs.join('\n'))
    })
    through2.push(temp)
  }

  cb()
}

module.exports = plugin
