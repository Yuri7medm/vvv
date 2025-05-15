const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');

// Cria a pasta 'data' se não existir
const dbDir = path.join(__dirname, 'data');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir);
}

// Caminho do banco de dados
const dbPath = path.join(dbDir, 'store.db');
const db = new sqlite3.Database(dbPath);

// Função para criar a tabela de forma assíncrona com Promises
const runQuery = (query, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(query, params, function (err) {
      if (err) {
        reject(err);
      } else {
        resolve(this);
      }
    });
  });
};

// Criação das tabelas e inserção de dados padrão
const setupDatabase = async () => {
  try {
    // Criar a tabela de usuários
    await runQuery(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        email TEXT UNIQUE,
        password_hash TEXT
      )
    `);

    // Criar a tabela de produtos
    await runQuery(`
      CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        description TEXT,
        price REAL,
        image TEXT
      )
    `);

    // Criar um usuário padrão (admin)
    const passwordHash = await bcrypt.hash('admin123', 10);
    await runQuery(`
      INSERT OR IGNORE INTO users (username, email, password_hash) 
      VALUES (?, ?, ?)
    `, ['admin', 'admin@example.com', passwordHash]);

    // Inserir um produto exemplo
    await runQuery(`
      INSERT OR IGNORE INTO products (name, description, price, image) 
      VALUES (?, ?, ?, ?)
    `, ['Produto 1', 'Descrição do produto 1', 29.99, 'product1.jpg']);

    console.log("Banco de dados criado com sucesso!");
  } catch (error) {
    console.error("Erro ao configurar o banco de dados:", error);
  } finally {
    db.close();
  }
};

// Executando a configuração do banco de dados
setupDatabase();
