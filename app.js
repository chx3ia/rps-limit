// app.js
'use strict';
const express = require('express')
const app = express()
const { queryIp, ingestIp } = require('./src/rps-limit')
app.get('/', (req, res) => {
  let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

  ingestIp(`127.0.0.1`)
    .then(ret => {
      res.status(200).send(`${ret}`)
    })
    .catch(err => {
      res.status(200).send(`${err}`)
    });
})
module.exports = app
