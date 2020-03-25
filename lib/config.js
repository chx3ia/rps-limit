const mode = process.env.NODE_ENV || 'develop'; 

exports.redis = {
  production: {
    SERVER: process.env.REDIS_SERVER || 'redis.example.com',
    PORT: process.env.REDIS_PORT || 6379
  },
  develop: {
    SERVER: process.env.REDIS_SERVER || 'localhost',
    PORT: process.env.REDIS_PORT || 6379
  },
  test: {
    SERVER: process.env.REDIS_SERVER || 'localhost',
    PORT: process.env.REDIS_PORT || 6379
  }
}[mode];

exports.log = {
  production: {
    LEVEL: 'error'
  },
  develop: {
    LEVEL: 'trace'
  },
  test: {
    LEVEL: 'fatal'
  }
}[mode];

exports.TS_SECOND = 60;
exports.MAX_REQUEST = 60;
