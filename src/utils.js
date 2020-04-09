'use strinct'

const isStringOrNumber = (val) => {
  if (typeof val !== 'string' && typeof val !== 'number') {
    return false
  }

  if (typeof val === 'number' && (Number.isNaN(val) || !Number.isFinite(val))) {
    return false
  }

  return true
}

const isNil = (val) => val === undefined || val === null

module.exports = {
  isNil,
  isStringOrNumber
}
