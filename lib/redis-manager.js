// lib/redis-manager.js
'use strict';

const log = require('nodeutil').simplelog
const bluebird = require('bluebird')

// config
const config = require('./config')
const redisConfig = config.redis

// redis module
const redis = require('redis')
//const redisClient = redis.createClient({host: redisConfig.SERVER, port: redisConfig.PORT})
const redisClient = redis.createClient()

// promisify all redis functions to be functionsAsync version
bluebird.promisifyAll(redis);

module.exports = {
  redisClient
}
