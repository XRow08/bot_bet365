/**
 * Semelhante ao loop em kotlin
 * @param {Number} time
 * @param {Function} func
 */
function repeat(time, func) {
    for (let i = 0; i < time; i++) {
        func()
    }
}

/**
 *
 * @param {[]} arr1
 * @param {[]} arr2
 * @returns {[]} Um array que contem somente o que existe no array 1 e 2.
 */
function retain(arr1, arr2) {
    if (arr2.length > arr1.length) {
        return retain(arr2, arr1)
    }

    let result = []

    // Pega o menor array, que é o arr2
    for (let i = 0; i < arr2.length; i++) {
        for (let j = 0; j < arr1.length; j++) {
            if (arr1[j].name === arr2[i].name){
                result.push(arr2[i])
                break
            }
        }
    }

    return result
}

let TrulySet = function () {
    let values = [];

    TrulySet.prototype.add = function (value) {
        if (!exists(value)) {
            values.push(value)
        }
        return values
    }
    /**
     *
     * @param {[]} target
     * @returns {boolean}
     */
    TrulySet.prototype.containsAll = function (target) {
        let a = values
        let b = target

        if (b.length > a.length) {
            b = values
            a = target
        }

        // O b sempre será menor ou igual ao a
        for (let i = 0; i < b.length; i++) {
            if (!a[i].name.equals(b[i].name)){
                return false
            }
        }

        return true
    }
    /**
     *
     * @param {[{name: String}]} target
     * @returns {boolean}
     */
    TrulySet.prototype.containsOne = function (target) {
        let a = values
        let b = target

        if (b.length > a.length) {
            b = values
            a = target
        }

        // O b sempre será menor ou igual ao a
        for (let i = 0; i < b.length; i++) {
            for (let j = 0; j < a.length; j++) {
                if (a[j].name === b[i].name){
                    return true
                }

            }
        }

        return false
    }

    TrulySet.prototype.toArray = function () {
        return values
    }

    /**
     * Irá checar se o valor existe no array
     * @param value
     * @returns {boolean} True caso exista e False caso não exista
     */
    function exists(value) {
        for (const item of values) {
            if (JSON.stringify(value) === JSON.stringify(item)) {
                return true
            }

        }

        return false
    }
}

Object.prototype.equals = function (other) {
    return JSON.stringify(this) === JSON.stringify(other)
}
Array.prototype.contains = function (item) {
    return this.indexOf(item) !== -1
}

exports.repeat = repeat
exports.retain = retain
exports.TrulySet = TrulySet