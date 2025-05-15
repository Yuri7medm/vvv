const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const cors = require('cors');
const path = require('path');

const app = express();
const db = new sqlite3.Database(path.join(__dirname, 'data', 'store.db'));

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Criar a tabela de usuários, se não existir
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    email TEXT UNIQUE,
    password_hash TEXT
  )`, (err) => {
    if (err) {
      console.error('Erro ao criar a tabela users:', err.message);
    } else {
      console.log('Tabela users criada ou já existe');
    }
  });
});

// Rota de login
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ success: false, message: "Username and password are required" });
  }

  db.get("SELECT * FROM users WHERE username = ? OR email = ?", [username, username], async (err, user) => {
    if (err || !user) {
      return res.status(400).json({ success: false, message: "Usuário não encontrado" });
    }

    try {
      const match = await bcrypt.compare(password, user.password_hash);
      if (!match) {
        return res.status(401).json({ success: false, message: "Senha incorreta" });
      }

      res.json({ success: true, user: { id: user.id, username: user.username } });
    } catch (error) {
      return res.status(500).json({ success: false, message: "Erro ao verificar a senha" });
    }
  });
});

// Rota de registro
app.post('/api/register', async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ success: false, message: "Todos os campos são obrigatórios" });
  }

  db.get("SELECT * FROM users WHERE username = ? OR email = ?", [username, email], async (err, user) => {
    if (user) {
      return res.status(400).json({ success: false, message: "Usuário ou email já cadastrado" });
    }

    try {
      const password_hash = await bcrypt.hash(password, 10);

      db.run(
        "INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)",
        [username, email, password_hash],
        function (err) {
          if (err) {
            return res.status(500).json({ success: false, message: "Erro ao registrar usuário" });
          }

          res.status(201).json({ success: true, user: { id: this.lastID, username } });
        }
      );
    } catch (error) {
      return res.status(500).json({ success: false, message: "Erro ao processar a senha" });
    }
  });
});

// Listar todos os usuários
app.get('/api/users', (req, res) => {
  db.all("SELECT id, username, email FROM users", [], (err, rows) => {
    if (err) {
      return res.status(500).json({ success: false, message: "Erro ao carregar os usuários" });
    }
    res.json({ success: true, users: rows });
  });
});

// Deletar usuário por ID
app.delete('/api/users/:id', (req, res) => {
  const userId = req.params.id;

  db.run("DELETE FROM users WHERE id = ?", [userId], function(err) {
    if (err) {
      return res.status(500).json({ success: false, message: "Erro ao excluir usuário" });
    }

    if (this.changes === 0) {
      return res.status(404).json({ success: false, message: "Usuário não encontrado" });
    }

    res.json({ success: true, message: "Usuário excluído com sucesso" });
  });
});

// Atualizar senha do usuário
app.put('/api/users/:id/password', async (req, res) => {
  const userId = req.params.id;
  const { password } = req.body;

  if (!password) {
    return res.status(400).json({ success: false, message: "Senha é obrigatória" });
  }

  try {
    const password_hash = await bcrypt.hash(password, 10);

    db.run("UPDATE users SET password_hash = ? WHERE id = ?", [password_hash, userId], function(err) {
      if (err) {
        return res.status(500).json({ success: false, message: "Erro ao atualizar a senha" });
      }

      if (this.changes === 0) {
        return res.status(404).json({ success: false, message: "Usuário não encontrado" });
      }

      res.json({ success: true, message: "Senha atualizada com sucesso" });
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Erro ao processar a nova senha" });
  }
});

// Listar produtos
app.get('/api/products', (req, res) => {
  db.all("SELECT * FROM products", [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// Iniciar servidor
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
