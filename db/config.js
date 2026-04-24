require('dotenv').config();

module.exports = {
  user: process.env.DB_USER || 'OrdenExpress2',
  password: process.env.DB_PASSWORD || 'ordenexpress123',
  server: process.env.DB_SERVER || 'YISUS',
  database: process.env.DB_NAME || 'OrdenExpress',
  options: {
    encrypt: process.env.DB_ENCRYPT === 'true' ? true : false,
    trustServerCertificate: process.env.DB_TRUST_CERT === 'true' ? true : false
  },
  port: parseInt(process.env.DB_PORT) || 1433
};
