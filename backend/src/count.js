'use strict';
const headers = require('./common').headers
const culc = require('./common').culc

module.exports.handler = async event => {
  const { inside, outside } = event.body ? await JSON.parse(event.body) : {}
  const sum = culc(inside, outside);

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify(sum),
  };
}
