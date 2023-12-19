const express = require('express');
const { engine } = require('express-handlebars');
const myconnection = require('express-myconnection');
const mysql = require('mysql');
const session = require('express-session');
const bodyParser = require('body-parser');

const app = express();
const port = 5000; // Cambiado el puerto a 5000 para unificar con la base de datos 'nodelogin'

// Configuración de Handlebars
app.set('views', __dirname + '/views');
app.engine('.hbs', engine({
  extname: '.hbs',
}));
app.set('view engine', 'hbs');

// Configuración de la base de datos MySQL
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'nodelogin',
});

// Conexión a la base de datos
db.connect((error) => {
  if (error) {
    throw error;
  }
  console.log('Conectado a la Bd MySQL');
});

// Configuración de sesión y bodyParser
app.use(session({
  secret: 'secret',
  resave: true,
  saveUninitialized: true,
}));

app.use(bodyParser.urlencoded({
  extended: true,
}));
app.use(bodyParser.json());

// Rutas de login
const loginRoutes = require('./routes/login');
app.use('/', loginRoutes);

// Ruta principal
app.get('/', (req, res) => {
  if (req.session.loggedin === true) {
    res.render('home', { name: req.session.name });
  } else {
    res.redirect('/login');
  }
});

// Middleware para analizar las solicitudes como objeto JSON
app.use(express.json());

// Ruta GET para obtener usuarios
app.get('/usuarios', (req, res) => {
  db.query('SELECT * FROM users', (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});

// Ruta POST para agregar un usuario
app.post('/usuarios', (req, res) => {
  const { email, name,password } = req.body;
  db.query('INSERT INTO users (email, name, password) VALUES (?, ?, ?)', [email, name, password], (err, results) => {
    if (err) throw err;
    res.json({ message: 'Usuario agregado correctamente', id: results.insertId });
  });
});

// Ruta PUT para actualizar un usuario
app.put('/usuarios/:id', (req, res) => {
  const userId = req.params.id;
  const { email,name } = req.body;
  db.query('UPDATE users SET email = ?, name = ?  WHERE id = ?', [email, name, userId], (err, results) => {
    if (err) throw err;
    res.json({ message: 'Usuario actualizado correctamente', rowsAffected: results.affectedRows });
  });
});

// Ruta DELETE para eliminar un usuario
app.delete('/usuarios/:id', (req, res) => {
  const userId = req.params.id;
  db.query('DELETE FROM users WHERE id = ?', [userId], (err, results) => {
    if (err) throw err;
    res.json({ message: 'Usuario eliminado correctamente', rowsAffected: results.affectedRows });
  });
});

// Iniciar Servidor
app.listen(port, () => {
  console.log(`Servidor en http://localhost:${port}`);
});
