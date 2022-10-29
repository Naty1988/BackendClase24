const express = require('express');
const  { json } = require('express');
const path = require('path')
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const productos = []

const { initializeApp, applicationDefault, cert } = require('firebase-admin/app');
const { getFirestore, Timestamp, FieldValue } = require('firebase-admin/firestore');

// Session
const mongoose = require('mongoose');
const session = require('express-session')
const cookieParser = require("cookie-parser");
// const MongoStore = require("connect-mongo");
const bodyParser = require ("body-parser");
// Para acceder al req.body
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }));

// -----
// app.use(
//   session({
//       secret: 'coderghouse',
//       resave: false,
//       saveUninitialized: true,
//   })
// );

// app.use(cookieParser())

// app.use(session({
//     store: MongoStore.create({ mongoUrl:'mongodb://localhost/sesiones' }),
//     secret: 'coder',
//     resave: false,
//     saveUninitialized: false,
//     cookie: {
//         maxAge: 5000
//     }
// }))

const MongoStore = require("connect-mongo");
const mongoOptions = { useNewUrlParser: true, useUnifiedTopology: true };

app.use(cookieParser());
app.use(
  session({
    store: MongoStore.create({
      mongoUrl:
        "mongodb+srv://naty:naty123@cluster0.wdcw0au.mongodb.net/?retryWrites=true&w=majority",
      mongoOptions,
    }),
    secret: "coderhouse",
    resave: false,
    saveUninitialized: false,
    rolling: true, 
    cookie: {
      maxAge: 200000,
    },
  })
);

// ---------
let username
// midlewears de autenticación

function auth(req, res, next) {
  if(req.session.user && req.session.admin) {
      return next()
  }
  console.log("Pasando por el midlewear. Leyendo req.session.user:", req.session.user)
  console.log("Pasando por el midlewear. Leyendo req.session.admin:", req.session.admin)
res.redirect('/login')
}

// ----------

app.get('/login', (req,res) => {

  res.render('login.ejs')
  
})

app.post('/login', (req,res) => {

  username = req.body.username
  console.log("nombre desde body: ", req.body.username)
  if(!username) {
  return res.send("Ingresar nombre")
  }
  req.session.user = username;
  req.session.admin = true;
  
  console.log("logged in!. Redireccionando a página principal.")
  res.redirect('/')

})

// -----------

// Eliminar sesión

app.get("/logout", (req,res) => {
  req.session.destroy((err) => {
      if(!err) {
        console.log("Sesión finalizada")
        res.render('logout.ejs', {username})
      } else {
          res.json({ status: "logout errorrrrbrrr", body: err})
      }
  })
})

// -----------

app.set('views', path.join(__dirname + '/views'))
app.set('view engine', 'ejs')

// Para funcionamiento de Socket.io

app.use(express.static(__dirname, + '/public'))

const { faker } = require('@faker-js/faker')
faker.locale = 'es'

// Ruta test con producto fakers

app.get('/test', (req, res) => {
  console.log('ok desde test')
  let id = productos.length ? (productos.length + 1) : 1

  for (let i = 1; i <= 5; i++) {
    productos.push({
      id,
      nombre: faker.animal.type(),
      precio: faker.finance.account(2),
      imagen: faker.image.animals(),
    })
    id++
  }
  console.log('productos  faker a renderizar: ', productos)
  res.render('productos.ejs', { productos })
})

// Configuración firebase

let admin = require("firebase-admin");

let serviceAccount = require("./configFirebase.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});


let mensajes = []

const traerMensajes = async () => {
  const db = admin.firestore();
  
  const mensajesDB = db.collection("mensajes");


  try {

    const userSnapshot = await mensajesDB.get()
    const mensajeDoc = userSnapshot.docs

    let response = mensajeDoc.map(mj => ({
      id: mj.id,
      author: mj.data().author,
      text: mj.data().text
    }))

    mensajes = response

    console.log("mensajes ", mensajes)

  } catch (err) {
    console.log(err);
  }
}


const guardarMensaje = async (mensaje) => {

  const db = admin.firestore();
  db.settings({ ignoreUndefinedProperties: true });

  const mensajesDB = db.collection("mensajes");
  try {
    const newMensaje = mensajesDB.doc();
    await newMensaje.create({ author: {alias: mensaje.author.alias, apellido: mensaje.author.apellido,  edad: mensaje.author.edad , id: mensaje.author.id,  avatar: mensaje.author.avatar, nombre: mensaje.author.nombre} , text: mensaje.text });

    console.log('mensaje guardado en Firebase')
  } catch (err) {
    console.log(err);
  }

}


// Socket.io

io.on('connection', (socket) => {
  console.log('a user connected');

  socket.on('client:producto', producto => {
    console.log('producto recibido en el servidor: ', producto)
    productos.push(producto)
    console.log('producto pusheado: ', productos)
    io.emit('server:productos', productos)
  })

  socket.on('client:mensaje', mensaje => {

    console.log('mensaje recibido en el servidor: ', mensaje)

    mensajes.push(mensaje)
    console.log('mensaje pusheado: ', mensajes)

    guardarMensaje(mensaje)
   
    traerMensajes()
    
    io.emit('server: mensajes', mensajes)
  })

})

app.get('/', auth, (req, res) => {
  console.log('Renderizando main.ejs')
  res.render('main.ejs', { mensajes , productos, username })
})

server.listen(8000, () => {
  console.log('listening on: 8000');
});