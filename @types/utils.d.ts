/**
 * Determines if the value is primitive string or primitive number,
 * in case of number NaN and Infinity values are not considered numbers.
 * It returns true in case of it represents one of these two types
 * @param {any} val - Value that will be checked
 */
export function isStringOrNumber(val: any): boolean

/**
 * Determines if the value is null or undefined, returns true in case of it represents one of these two types
 * @param {any} val - Value that will be checked
 */
export function isNil(val: any): boolean

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
 */
export function getObjectFunctions(toCheck: object): Array<string>
