const { Pool, Query } = require('pg');
const dayjs = require('dayjs');
const dotenv = require('dotenv');

dotenv.config();

const dbConfig = require('../config/dbConfig');

let devMode = process.env.NODE_ENV === 'development';

const sqlDebug = true;

// sql query console
const submit = Query.prototype.submit;
Query.prototype.submit = function () {
  const text = this.text;
  const values = this.values || [];
  const query = text.replace(/\$([0-9]+)/g, (m, v) => JSON.stringify(values[parseInt(v) - 1]));

  devMode && sqlDebug && console.log(`\n\n[๐ป SQL STATEMENT]\n${query}\n_________\n`);
  submit.apply(this, arguments);
};

console.log(`[๐ฅDB] ${process.env.NODE_ENV}`);

// create connection pool
const pool = new Pool({
  ...dbConfig,
  connectionTimeoutMillis: 60 * 1000,
  idleTimeoutMillis: 60 * 1000,
});

const connect = async (req) => {
  const now = dayjs();
  const string =
    !!req && !!req.method
      ? `[${req.method}] ${!!req.user ? `${req.user.id}` : ``} ${req.originalUrl}\n ${!!req.query && `query: ${JSON.stringify(req.query)}`} ${!!req.body && `body: ${JSON.stringify(req.body)}`} ${
          !!req.params && `params ${JSON.stringify(req.params)}`
        }`
      : `request ์์`;
  const callStack = new Error().stack;
  const client = await pool.connect();
  const query = client.query;
  const release = client.release;

  const releaseChecker = setTimeout(() => {
    console.error('[ERROR] client connection์ด 15์ด ๋์ ๋ฆด๋ฆฌ์ฆ๋์ง ์์์ต๋๋ค.', { callStack });
    console.error(`๋ง์ง๋ง์ผ๋ก ์คํ๋ ์ฟผ๋ฆฌ๋ฌธ์๋๋ค. ${client.lastQuery}`);
  }, 15 * 1000);

  client.query = (...args) => {
    client.lastQuery = args;
    return query.apply(client, args);
  };
  client.release = () => {
    clearTimeout(releaseChecker);
    const time = dayjs().diff(now, 'millisecond');
    if (time > 4000) {
      const message = `[RELEASE] in ${time} | ${string}`;
      devMode && console.log(message);
    }
    client.query = query;
    client.release = release;
    return release.apply(client);
  };
  return client;
};

module.exports = {
  connect,
};
