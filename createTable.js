const sqlite3 = require('sqlite3').verbose();

// Conectar ao banco de dados SQLite (ou criar um novo banco)
const db = new sqlite3.Database('myDatabase.db', (err) => {
  if (err) {
    console.error('Erro ao conectar ao banco de dados:', err.message);
  } else {
    console.log('Conectado ao banco de dados.');
  }
});

// Comando SQL para criar a tabela 'users' se ela não existir
const createTableSQL = `
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    email TEXT UNIQUE,
    password_hash TEXT
  );
`;

// Executar o comando SQL para criar a tabela
db.run(createTableSQL, (err) => {
  if (err) {
    console.error('Erro ao criar a tabela:', err.message);
  } else {
    console.log('Tabela "users" criada ou já existe.');
  }

  // Após a criação da tabela, fechamos a conexão com o banco de dados
  db.close((err) => {
    if (err) {
      console.error('Erro ao fechar a conexão com o banco de dados:', err.message);
    } else {
      console.log('Conexão com o banco de dados fechada.');
    }
  });
});
