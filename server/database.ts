const mysql = require('mysql2/promise')

const connection = mysql.createPool({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '@adro24#1910',
    database: 'nacao_nutrida'
})

module.exports = connection