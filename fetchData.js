/*
const express = require('express')
const mombasa = require('./ke/mbs/mbs');
const nrk = require('./ke/nrk/nrk');
const app = express()

let cities = [mombasa, nrk]
for (let i = 0; i < cities.length; i++) {
    const city = cities[i];

    city;

    app.get('/kfc', (req, res) => {
        res.json([mombasa.product, nrk.product])
    })
}

const port = 5000

app.listen(port, () => console.log(`Listening on port ${port}!`))

let i = 0;

function increment() {
  i++;
  console.log(i);
}

let timer = setTimeout(function myTimer() {
  increment();
  timer = setTimeout(myTimer, 10000);
}, 1000);
*/