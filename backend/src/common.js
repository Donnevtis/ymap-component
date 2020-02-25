module.exports.headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Credentials': true,
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Cache-Control': 'no-cache, must-revalidate'
}

module.exports.culc = (inside, outside) => {
    return +((inside * 22) + (outside * 25)).toFixed(2);
}