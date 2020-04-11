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

const getObjectFunctions = (toCheck) => {
  const filtered = [
    '__defineGetter__',
    '__defineSetter__',
    '__lookupGetter__',
    '__lookupSetter__',
    'constructor',
    'hasOwnProperty',
    'isPrototypeOf',
    'propertyIsEnumerable'
    // below may be used
    // 'toLocaleString',
    // 'toString',
    // 'valueOf'
  ]
  let props = []
  let obj = toCheck
  do {
    props = props.concat(Object.getOwnPropertyNames(obj))
  } while (!isNil(obj = Object.getPrototypeOf(obj)))

  const fns = props.filter(fn => typeof toCheck[fn] === 'function' && !filtered.includes(fn))
    .concat(Object.keys(toCheck).filter(key => typeof toCheck[key] === 'function'))

  return fns.filter((fn, i) => fns.indexOf(fn) === i).sort()
}

module.exports = {
  getObjectFunctions,
  isNil,
  isStringOrNumber
}
