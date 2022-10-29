const socket = io();

let productosPool = document.querySelector('#productosPool')
const productsForm = document.querySelector('#productsForm')
const nombreInput = document.querySelector('#nombreInput')
const precioInput = document.querySelector('#precioInput')
const urlInput = document.querySelector('#urlInput')

// Productos

function sendProduct(producto) {
    socket.emit('client:producto', producto)
}

// let html

function renderProducto(productos) {
    console.log('productos a renderizar desde client: ', productos)


    // const response = await fetch('/views/productos.ejs')
    // const plantilla = await response.text()
    // productos.forEach(producto => {
    //     const html = ejs.render(plantilla, producto)
    //     document.querySelector('#productosPool').innerHTML += html
    // })


    html = productos.map(pr => {
        return (`<div>
                    <p>${pr.nombre}</p>
                    <p>${pr.precio}</p>
                    </div>`)
    }).join(" ");
    console.log('HTML desde renderProducto:', html)

    productosPool.innerHTML += html;
    console.log("producto renderizado desde cliente")

}

productsForm.addEventListener('submit', event => {
    event.preventDefault()

    const producto = { nombre: nombreInput.value, precio: precioInput.value, url: urlInput.value }
    console.log("producto a enviar desde client ", producto)
    sendProduct(producto)
})

socket.on('server:productos', productos => {
    renderProducto(productos)
})


// Servicio mensajería


const chatForm = document.querySelector('#chatForm')

const aliasInput = document.querySelector('#aliasInput')
const apellidoInput = document.querySelector('#apellidoInput')
const avatarInput = document.querySelector('#avatarInput')
const edadInput = document.querySelector('#edadInput')
const mailInput = document.querySelector('#mailInput')
const nombreMjInput = document.querySelector('#nombreMjInput')

const chatPool = document.querySelector('#chatPool')
const mensajeInput = document.querySelector('#mensajeInput')

function sendMensaje(mensaje) {
    socket.emit('client:mensaje', mensaje)
}

function renderMensaje(mensajes) {
    console.log('mensajes a renderizar desde client: ', mensajes)


    // const response = await fetch('/views/productos.ejs')
    // const plantilla = await response.text()
    // productos.forEach(producto => {
    //     const html = ejs.render(plantilla, producto)
    //     document.querySelector('#productosPool').innerHTML += html
    // })


    html = mensajes.map(mj => {
        return (`<div>
                   
                    <li>Id: ${mj.id} 
                    </li>
                    <li>id autor: ${mj.author.id}
                    </li>
                    <li>alias: ${mj.author.alias}
                    </li>
                    <li>apellido: ${mj.author.apellido}
                    </li>
                    <li>avatar:<img src="${mj.author.avatar}" /></li>
                    <li>nombre: ${mj.author.nombre} 
                    </li>
                    <li>edad: ${mj.author.edad}
                    </li>
                    <li>Mensaje: ${mj.text}

                    </div>`)
    }).join(" ");
    console.log('HTML:', html)

    productosPool.innerHTML += html;
    console.log("mensajes renderizado desde cliente")
}

chatForm.addEventListener('submit', event => {
    event.preventDefault()
    const mensaje = { author: { alias: aliasInput.value, apellido: apellidoInput.value, edad: edadInput.value, id: mailInput.value, avatar: avatarInput.value, nombre: nombreMjInput.value }, text: mensajeInput.value };
       console.log("mensaje a enviar desde client ", mensaje)
    sendMensaje(mensaje)
})

socket.on('server: mensajes', mensajes => {
    console.log("recibiendo mensajes desde client", mensajes)

     renderMensaje(mensajes)
})


