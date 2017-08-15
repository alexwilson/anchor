const _ = require('lodash')

const concatResponse = responses => responses.reduce((obj, response) => _.merge(obj, response), {})

module.exports = {
    concatResponse
}