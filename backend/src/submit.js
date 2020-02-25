'use strict';
const nodemailer = require("nodemailer")
const headers = require('./common').headers
const culc = require('./common').culc
const { HOST, USER, PASS, PORT } = process.env

module.exports.handler = async event => {
  const { inside, outside, email, adresses } = event.body ? await JSON.parse(event.body) : {}
  const sum = culc(inside, outside);
  const pointList = adresses.map(adress => `<li>${adress}</li>`).join('')
  async function main() {
    const transporter = nodemailer.createTransport({
      host: HOST,
      port: PORT,
      secure: true,
      auth: {
        user: USER,
        pass: PASS
      }
    })

    await transporter.sendMail({
      from: `"Приложение YMAP" <${USER}>`,
      to: email,
      subject: "Информация о заказе",
      text: "Расчет доставки",
      html: `
      <b>Общая сумма: ${sum}₽</b>
      <br>
      <b>Километраж внутри МКАД: ${inside}км</b>
      <br>
      <b>Километраж за МКАД ${outside}км</b>
      <br>
      <section>
      <br>
      <span><b>Лист маршрута:</b></span>
      <ol>${pointList}</ol>
      </section>
      `
    });
  }

  await main().catch(console.error);

  return {
    statusCode: 200,
    headers
  };

};
