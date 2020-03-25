const { queryIp, ingestIp } = require('../src/rps-limit')
// Note: Use this instance in all tests.
const { redisClient } = require('../lib/redis-manager')
let testSampleOf30 = [...Array(30).keys()].map(x => [x+1, x+1]);
let testSampleOf60 = [...Array(60).keys()].map(x => [x+1, x+1]);
let testSampleOfError = [[61, 'Error']]; 

describe('basic query and ingest', () => {
  test('return null', async () => {
    let reply = await queryIp('127.0.0.1');
    expect(reply).toBeNull();
  });

  test('return 1', async () => {
    let reply = await ingestIp('127.0.0.1');
    expect(reply).toBe(1);
  });

  beforeEach(async () => {
    // Clears the database
    await redisClient.flushall();
  });

  /*
  afterAll(async () => {
    await redisClient.quit();
  });
  */
})

describe('consecutivly ingest up to 30 times', () => {

  describe.each(testSampleOf30)(
    'the %i times request',
    (a, expected) => {
      test(`returns ${expected}`, async () => {
        expect(await ingestIp('127.0.0.1')).toBe(expected);
      });
    },
  );

  beforeAll(async () => {
    // Clears the database
    await redisClient.flushall();
  });

})

describe('consecutivly ingest up to 61 times', () => {

  describe.each(testSampleOf60)(
    'the %i times request',
    (a, expected) => {
      test(`returns ${expected}`, async () => {
        expect(await ingestIp('127.0.0.1')).toBe(expected);
      });
    },
  );
  describe('the 61 times request should be failed', () => {
    test('returns Error', async () => {
      expect.assertions(1);
      await expect(ingestIp('127.0.0.1')).rejects.toEqual('Error');
    });
  })

  beforeAll(async () => {
    // Clears the database
    await redisClient.flushall();
  });

})
