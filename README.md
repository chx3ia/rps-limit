## Prerequisites

This project is running with Nodejs. It is a response to the interview exam request from [DCard](https://www.dcard.tw) in 2019.

Before going on, please install the following software:
 
* [Nodejs](https://nodejs.org/en/download/) - Node version `>=10` is recommendanded.
* [docker](https://www.docker.com/) - Docker version `>=18` is recommendanded.

## Project file structure
    .
    ├── __tests__
    ├── lib                                       
    ├── src                                     
    ├── app.js
    ├── server.js                            
    ├── package.json
    ├── package-lock.json
    └── README.md

## Installation

Step 1. git pull the source file and change to the project directory.

Step 2. Use [npm](https://www.npmjs.com/) to install modules

    $ npm install

Step 3. Pull redis docker image

For best results, it is recommended that you use `redis:latest` docker image.

    $ docker pull redis
    $ docker run --rm --name rps-limit-redis -p 6379:6379 -d redis

## Usage

To run a server listen on port 8080 and then visit [http://localhost:8080](http://localhost:8080) on your browser.

    $ node server

To run a test:

    $ npm run test

## Cleanup

Stop redis container and remove image:

    $ docker stop rps-limit-redis
    $ docker rmi redis
