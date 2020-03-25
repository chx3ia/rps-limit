// src/rps.js  Request Per Second
'use strict';

// general module
const config = require('../lib/config')
const {promisify, format} = require('util')
const moment = require('moment')
const log = require('nodeutil').simplelog
log.setLevel(config.log.LEVEL)

// lib module
const { redisClient } = require('../lib/redis-manager')

const RPS_TS_SECOND = config.TS_SECOND;
const RPS_MAX_REQUEST = config.MAX_REQUEST;
const OBJECT_NAME = 'rps';
const OBJECT_VERSION = '0.1';

const queryIp = async (ip) => {
  let key = _genKey(ip);

  return await redisClient.getAsync(key);
}

const ingestIp = async (ip) => {
  let key = _genKey(ip);
  let ret, err, rps;

  // watched key is monitored in order to detect changes against it.
  ret = await redisClient.watchAsync(key);

  // get value of key
  [err, ret] = await _wrapPromise(redisClient.getAsync(key));
  if (err) {
    await redisClient.unwatchAsync();
    throw err 
  }
  // calculate request per second (rps)
  [err, rps] = _calculateRps(ret);
  if (err) {
    await redisClient.unwatchAsync();
    log.debug(`calculateRps error: ${err}`);
    throw err;
  }
  // convert rps calculation for further usage
  let requestTsInString = JSON.stringify(rps.requestTs);
  
  log.trace(`injestIp: ${rps.requestTs.length} req, ${requestTsInString}`);

  // if another redis client modifies the value of the key, the transaction will fail.
  redisClient.multi()
    .set(key, requestTsInString)  // the SET command will be queued
    .expire(key, RPS_TS_SECOND)  // the EXPIRE command will be queued
    .execAsync()  // drain multi queues and run commands atomically 
      .then(reply => {
        log.trace(`reply: ${reply}`);
      })
      .catch(e => {
        log.error(`catched: ${e}`);
      });

  return rps.requestTs.length;
}

function _genKey(key) {
  return format(`${OBJECT_NAME}-${OBJECT_VERSION}-${key}`);
}

function _getTimeSlice() {
  let tsNow = moment().unix(); 

  return [tsNow - RPS_TS_SECOND, tsNow, tsNow + RPS_TS_SECOND]; 
}

function _wrapPromise(promise) {
  return promise.then(data => {
    return [null, data];
  })
  .catch(err => [err]);
}

function _calculateRps(rpsString) {
  let requestTs = [];
  let ret;

  // get time slice window at second 
  let [tsLast, tsNow, tsUntil] = _getTimeSlice();

  if (rpsString === null) {
    requestTs.unshift(tsNow);
  } else {
    requestTs = JSON.parse(rpsString); 

    // find the first request time which it's already expired 
    // TODO: refactoring it from linear search to quick search will be faster
    let index = requestTs.findIndex(function(ts) {
        return ts < tsLast;
    });

    // get rid of request time which is expired 
    if (index !== -1) {
      requestTs = requestTs.splice(0, index);
    }
      
    // prepend the new coming request at the first of array.
    // in MOST cases, this arrangement will be more efficient
    if (requestTs.length === RPS_MAX_REQUEST) 
      return ['Error']
    else
      requestTs.unshift(tsNow);
  }
  let rps = {
    tsMark: [tsLast, tsNow, tsUntil],
    requestTs: requestTs
  }
  
  return [null, rps];
}

module.exports = {
  queryIp,
  ingestIp
}
