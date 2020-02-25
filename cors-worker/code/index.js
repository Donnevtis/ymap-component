// const nodemailer = require('nodemailer');
// const { MAIL_HOST, MAIL_PORT, MAIL_USER, MAIL_PASS } = process.env;
// const transport = nodemailer.createTransport({
//     host: MAIL_HOST,
//     port: MAIL_PORT,
//     auth: {
//         user: MAIL_USER,
//         pass: MAIL_PASS,
//     },
// });

module.exports = async (event = {}, ctx) => {

    const response = await fetch('https://api.chucknorris.io/jokes/random');
    //  grab the JSON
    const joke = await response.json();
    // create HTML template
    const html = `
      <h1>Joke of the Day</h1>
      <p>${joke.value}</p>
      `;

    // send mail with our transport object
    let info = await transport.sendMail({
        from: '"Chuck Norris" <noreply@chuck.com>', // sender address
        to: 'dickinson@inbox.ru', // list of receivers
        subject: 'Daily Joke', // Subject line
        html, // html body
    });

    return {
        statusCode: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true,
            'Access-Control-Allow-Headers': 'Content-Type',
            'Cache-Control': 'no-cache, must-revalidate'
        },
        body: {
            message: JSON.stringify(joke.value)

        }
    }
}