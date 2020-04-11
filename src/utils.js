'use strict'

/**
 * Determines if the value is primitive string or primitive number,
 * in case of number NaN and Infinity values are not considered numbers.
 * It returns true in case of it represents one of these two types
 * @param {any} val - Value that will be checked
 * @returns {boolean}
 */
const isStringOrNumber = (val) => {
  if (typeof val !== 'string' && typeof val !== 'number') {
    return false
  }

  if (typeof val === 'number' && (Number.isNaN(val) || !Number.isFinite(val))) {
    return false
  }

  return true
}

/**
 * Determines if the value is null or undefined, returns true in case of it represents one of these two types
 * @param {any} val - Value that will be checked
 * @returns {boolean}
 */
const isNil = (val) => val === undefined || val === null

/**
 * Returns the functions/methods that belong to object, it excludes the object prototype methods:
 *    - \_\_defineGetter__,
 *    - \_\_defineSetter__,
 *    - \_\_lookupGetter__,
 *    - \_\_lookupSetter__,
 *    - constructor,
 *    - hasOwnProperty,
 *    - isPrototypeOf,
 *    - propertyIsEnumerable
 * Methods toLocaleString, toString, valueOf are included
 * @param {Object} toCheck - The object from which the function names will be extracted
 * @returns {Array<string>}
 */
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
