'use strinct'

const isStringOrNumber = (val) => typeof val === 'string' || typeof val === 'number'
const isNil = (val) => val === undefined || val === null

module.exports = {
  isNil,
  isStringOrNumber
}
