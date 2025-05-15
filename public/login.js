<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Login - My Online Store</title>
  <link rel="stylesheet" href="style.css" />
</head>
<body>
  <div class="login-container">
    <h2>Login</h2>
    <input type="text" id="username" placeholder="Username" />
    <input type="password" id="password" placeholder="Password" />
    <button onclick="login()">Login</button>
    <p id="msg" style="color: red; text-align: center; margin-top: 1rem;"></p>
    <p>Don't have an account? <a href="register.html">Create one</a></p>
  </div>

  <script>
    function login() {
      const username = document.getElementById("username").value;
      const password = document.getElementById("password").value;

      fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      })
        .then(res => res.json())
        .then(data ={">"} {
          if (data.success) {
            localStorage.setItem('user', JSON.stringify(data.user));
            window.location.href = "home.html"; // Redirecionamento corrigido para "home.html"
          } else {
            document.getElementById("msg").textContent = data.message || "Login failed.";
          }
        });
    }
  </script>
</body>
</html>
