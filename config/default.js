const Path = require('path')
module.exports = {
  app: {
      name: 'moyklass-api-example',
      version: '0.0.1'
  },
  server: {
      router: {
          prefix: ''
      },
      hostname: 'localhost',
      port: 8192
  },
  log: {
    options: {
      startNewFile: true,
      period: "1d",
      totalFiles: 1,
      rotateExisting: true,
      threshold: "10m",
      totalSize: "100m",
      gzip: true
    }
  },
  databases: {
    sequelize: {
      database: 'moyklass-api-example',
      username: 'postgres',
      password: 'myPassword',
      host: '192.168.33.81',
      dialect: 'postgres',
      dialectOptions: {
        collate: 'utf8_general_ci',
        bigNumberStrings: true,
        options: {
          encrypt: true,
          trustServerCertificate: true
        }
      },
      port: 5432
    }
  }
}
