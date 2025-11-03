let productosCarro = [];
let usuario = null;
let cupones = ["ENVIOGRATIS123", "TEST123", "DESCUENTO2025"];
let contenedor = document.getElementById('carro');
const contraBorrar = "password123";
let comprobar = true;

//Esas variables son las globales

window.addEventListener('load', function () {
    const loader = document.getElementById('loaderCarro');
    loader.style.display = "none";
    contenedor.style.display = "block";
});

//Funcion para que cada que cargue la pagina carguen los productos y si hay un usuario activo pues solo muestra un hola y el nombre de este
function cargarDatos() {
    let usuarios = JSON.parse(window.localStorage.getItem('usuarios')) || [];
    /*if (carro) {
        productosCarro = carro;
    }*/
    let user = JSON.parse(window.localStorage.getItem('usuario'));
    if (user) {
        usuario = user;
        let saludo = document.getElementById('saludo');
        if (saludo) {
            saludo.style.display = 'inline';
            saludo.textContent = 'Hola, ' + usuario.nom;
            comprobar = true;
            let carroUsuario = usuarios.find(u => u.correo === usuario.correo).carro || [];
            productosCarro = carroUsuario;
        }
    } else {
        contenedor.innerHTML = '<h3>Parece que no has iniciado sesion, inicia sesion para empezar a comprar</h3>'
        comprobar = false;
    }
}

function guardar() {
    let usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
    let indice = usuarios.findIndex(u => u.correo === usuario.correo);
    usuarios[indice].carro = productosCarro;
    localStorage.setItem("usuarios", JSON.stringify(usuarios));

}
function mostrar() {
    let total = document.getElementById('total');
    contenedor.innerHTML = '';
    let sumaTotal = 0;

    if (productosCarro.length === 0) {
        contenedor.innerHTML = '<h3>Tu carro está vacío</h3>';
        total.innerHTML = '';
        return;
    }

    productosCarro.forEach(function (p) {
        sumaTotal += parseFloat(p.precio);
        let cantidad = productosCarro.filter(prod => prod.id === p.id).length;
        if (productosCarro.indexOf(p) !== productosCarro.findIndex(prod => prod.id === p.id)) {
            return;
            //console.log("No entre");
        }

        //console.log("Entre");
        let col = document.createElement('div');
        col.className = 'col-md-11 mb-3';
        col.innerHTML = `
            <div class="card mb-3 shadow-sm" style="max-width: 1000px; margin: 0 auto; border-radius: 12px;">
              <div class="row g-0 align-items-center">
                <div class="col-md-3 text-center">
                  <img src="${p.img}" class="img-fluid rounded-start" alt="${p.nom}" style="max-height: 150px; object-fit: cover;">
                </div>
                <div class="col-md-9">
                  <div class="card-body">
                    <div class="d-flex justify-content-between align-items-center">
                      <h5 class="card-title mb-0">${p.nom}</h5>
                      <h4 class="text-primary mb-0">$${p.precio}</h4>
                    </div>
                    <p class="card-text text-muted mb-2">Categoria: ${p.cat}</p>
                   <p class="card-text text-muted mb-2">${p.desc}</p>
                   <p class="card-text text-muted mb-2">Cantidad: ${cantidad}</p>
               <div class="d-flex gap-2">
               <button onclick="sumarCantidad(${p.id}, ${cantidad})" id="botonesAccion" style="border-radius: 20px"><i class="fa-duotone fa-solid fa-plus"></i></button>
               <button onclick="restarCantidad(${p.id}, ${cantidad})" id="botonesAccion" style="border-radius: 20px"><i class="fa-duotone fa-solid fa-minus"></i></button>
           <button class="btn btn-danger btn-sm flex-fill" id="botonEliminar" onclick="eliminar(${p.id})">Eliminar</button>
         </div>
        </div>
        </div>
       </div>
    </div>
        `;
        contenedor.appendChild(col);
    });
    //calcula el total del carro
    let subtotal = (sumaTotal / 1.16).toFixed(2);
    let iva = (sumaTotal - subtotal).toFixed(2);
    let totalon = (parseFloat(sumaTotal) + 59.99).toFixed(2);
    total.innerHTML = `
    <div id="total" class="p-3 border bg-light" style="border-radius: 12px;">
    <h3>Subtotal: $${subtotal}</h3>
    <h3>IVA (16%): $${iva}</h3>
    <h3>Envio: $59.99</h3>
    <h3>Total: $${totalon}</h3>
    <input type="text" id="cupon" class="form-control mb-3" placeholder="Ingresa tu cupón de descuento">
    <button id="btnCupon" onclick="aplicarCupon()">Aplicar cupón</button>
    <hr>
    <button class="btn btn-success btn-lg w-100" onclick="hacerPago()">Proceder al pago</button></div>
    `;
}

function hacerPago() {
    let sumaTotal = productosCarro.reduce((acc, p) => acc + parseFloat(p.precio), 0);
    let subtotal = (sumaTotal / 1.16).toFixed(2);
    let iva = (sumaTotal - subtotal).toFixed(2);
    let totalon = (parseFloat(sumaTotal) + 59.99).toFixed(2);

    Swal.fire('Pago realizado', 'Gracias por tu compra', 'success').then(() => {
        let productosDos = JSON.parse(localStorage.getItem("productos")) || [];
        productosCarro.forEach(productoCarro => {
            let productoDos = productosDos.find(p => p.id === productoCarro.id);
            if (productoDos) {
                productoDos.stock--;
            }
        });
        localStorage.setItem("productos", JSON.stringify(productosDos));
        guardarDatos(productosCarro, totalon);
        let usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
        let indice = usuarios.findIndex(u => u.correo === usuario.correo);

        const pedidoNuevo = {
            productos: productosCarro,
            fecha: new Date().toLocaleDateString(),
            total: totalon
        };
        if (!Array.isArray(usuarios[indice].pedidos)) {
            usuarios[indice].pedidos = [];
        }
        usuarios[indice].pedidos.push(pedidoNuevo);
        productosCarro = [];
        usuarios[indice].carro = [];
        localStorage.setItem("usuarios", JSON.stringify(usuarios));
        localStorage.setItem("usuario", JSON.stringify(usuario));

        mostrar();
    });
}

function guardarDatos(productosComprados, totalCompra){
    let pedidosGenerales = JSON.parse(localStorage.getItem('pedidosGenerales')) || {
        ventasPorCategoria: {},
        ventasPorDia: {}
    };

    productosComprados.forEach(producto => {
        if (pedidosGenerales.ventasPorCategoria[producto.cat]) {
            pedidosGenerales.ventasPorCategoria[producto.cat] += 1;
        } else {
            pedidosGenerales.ventasPorCategoria[producto.cat] = 1;
        }
    });

    let fechaHoy = new Date().toLocaleDateString();
    if (pedidosGenerales.ventasPorDia[fechaHoy]) {
        pedidosGenerales.ventasPorDia[fechaHoy] += parseFloat(totalCompra);
    } else {
        pedidosGenerales.ventasPorDia[fechaHoy] = parseFloat(totalCompra);
    }

    localStorage.setItem('pedidosGenerales', JSON.stringify(pedidosGenerales));
    //console.log('Datos: ', pedidosGenerales);
}

function aplicarCupon() {
    let cuponDado = document.getElementById('cupon').value.trim();
    if (cupones.includes(cuponDado)) {
        Swal.fire('Cupon aplicado', 'Has obtenido envio gratis', 'success');
        let total = document.getElementById('total');
        let contenidoTotal = total.innerHTML;
        let descuentito = contenidoTotal.replace('Envío: $59.99', 'Envío: $0.00 <s>$59.99</s>').replace(/Total: \$(\d+\.\d{2})/, (match, p1) => {
            let totalSinEnvio = (parseFloat(p1) - 59.99).toFixed(2);
            return `Total: $${totalSinEnvio}`;
        });
        total.innerHTML = descuentito;
    } else {
        Swal.fire('Cupón inválido', 'El cupón que ingresaste no es válido', 'error');
    }
}

function sumarCantidad(id, cantidad) {

    let prod = productosCarro.find(p => p.id === id);
    console.log(prod.id)
    console.log(prod.stock)
    if (prod.stock <= 0) {
        Swal.fire('Agotado', 'No hay más stock disponible de este producto', 'error');
        return;
    }
    if (prod.stock == cantidad) {
        Swal.fire('Límite alcanzado', 'Has alcanzado el límite de stock para este producto', 'error');
        return;
    }
    if (prod) {
        productosCarro.push(prod);
        guardar();
        mostrar();
        location.reload();
    }
}

function restarCantidad(id, cantidad) {
    if (cantidad == 1) {
        //console.log("entre a eliminar");
        eliminar(id);
        return;
    }
    let ide = productosCarro.findIndex(p => p.id === id);
    if (ide !== -1) {
        productosCarro.splice(ide, 1);
        guardar();
        mostrar();
    }
}


/*Esta es mi funcion de editar la cual agarrara los valores que ya tiene para mostrarlos y ya que de ahi
modifique*/
function editar(id) {
    editando = id;
    let prod = productosCarro.find(p => p.id === id);
    document.getElementById('tituloModal').textContent = 'Editar Producto';
    document.getElementById('nomProdus').value = prod.nom;
    document.getElementById('precio').value = prod.precio;
    document.getElementById('stock').value = prod.stock;
    document.getElementById('desc').value = prod.desc;
    document.getElementById('imgPreview').src = prod.img;
    document.getElementById('preview').style.display = 'block';
    let modal = new bootstrap.Modal(document.getElementById('modalProducto'));
    modal.show();
}

/*Cada uno de los card contiene el id de cada producto, aqui en esta parte se hace referencia a estos
para poder encontrarlo y poder eliminar ese id en especifico*/
function eliminar(id) {
    console.log("entre a borrar");
    Swal.fire({
        title: 'Estás seguro?',
        text: 'No podras recuperar este producto',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Si, eliminar',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            //aqui le pregunto la contraseña para eliminar el producto
            let contraseña = prompt("Ingresa la contraseña para eliminar el producto:");
            if (contraseña !== contraBorrar) {
                Swal.fire('Error', 'Contraseña incorrecta', 'error');
                return;
            }
            productosCarro = productosCarro.filter(p => p.id !== id);
            guardar();
            mostrar();
            Swal.fire('Eliminado', 'El producto ha sido eliminado', 'success');
        }
    });
}

/*si hay un usuario activo te pregunta si quieres cerrar la cuenta activa, y si no hay usuario activo
te abre el modal para que te registres*/
document.getElementById('btnLogin').addEventListener('click', function () {
    if (usuario) {
        Swal.fire({
            title: 'Cerrar sesion?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Si',
            cancelButtonText: 'No'
        }).then((result) => {
            if (result.isConfirmed) {
                window.localStorage.removeItem('usuario');
                location.reload();
            }
        });
    } else {
        let modal = new bootstrap.Modal(document.getElementById('modalLogin'));
        modal.show();
    }
});

/*solo es para que se cierre el login y se abra el registro*/
document.getElementById('abrirRegistro').addEventListener('click', function (e) {
    e.preventDefault();
    bootstrap.Modal.getInstance(document.getElementById('modalLogin')).hide();
    let modal = new bootstrap.Modal(document.getElementById('modalRegistro'));
    modal.show();
});

/*Para que se abra el login y se cierre el registro*/
document.getElementById('abrirLogin').addEventListener('click', function (e) {
    e.preventDefault();
    bootstrap.Modal.getInstance(document.getElementById('modalRegistro')).hide();
    let modal = new bootstrap.Modal(document.getElementById('modalLogin'));
    modal.show();
});

/*Formulario de registro en donde se registran los usuarios y se guardan en el localstorage*/
document.getElementById('formRegistro').addEventListener('submit', function (e) {
    e.preventDefault();

    let nom = document.getElementById('nombre').value;
    let correo = document.getElementById('correoReg').value;
    let tel = document.getElementById('tel').value;
    let pass = document.getElementById('passReg').value;
    let passConf = document.getElementById('passConf').value;

    if (pass !== passConf) {
        Swal.fire('Error', 'Las contraseñas no coinciden', 'error');
        return;
    }

    let usuarios = JSON.parse(window.localStorage.getItem('usuarios')) || [];

    if (usuarios.find(u => u.correo === correo)) {
        Swal.fire('Error', 'Ya existe una cuenta con este correo', 'error');
        return;
    }

    usuarios.push({
        nom: nom,
        correo: correo,
        tel: tel,
        pass: pass
    });

    window.localStorage.setItem('usuarios', JSON.stringify(usuarios));
    bootstrap.Modal.getInstance(document.getElementById('modalRegistro')).hide();
    Swal.fire('Exito', 'Cuenta creada correctamente', 'success');
});

/*EL evento submit del login que busca al usuario y hace validaciones*/
document.getElementById('formLogin').addEventListener('submit', function (e) {
    e.preventDefault();
    let correo = document.getElementById('correo').value;
    let pass = document.getElementById('pass').value;
    let usuarios = JSON.parse(window.localStorage.getItem('usuarios')) || [];
    let user = usuarios.find(u => u.correo === correo && u.pass === pass);

    if (!user) {
        Swal.fire('Error', 'Correo o contraseña incorrectos', 'error');
        return;
    }
    window.localStorage.setItem('usuario', JSON.stringify({
        nom: user.nom,
        correo: user.correo,
        tel: user.tel
    }));
    bootstrap.Modal.getInstance(document.getElementById('modalLogin')).hide();
    Swal.fire('Bienvenido!!!', 'Has iniciado sesion', 'success').then(() => {
        location.reload();
    });
});

/*Funciones que repito cada vez que inicia la pagina para cargar los datos del usuario y mostrar los productos*/
cargarDatos();
if (comprobar) {
    mostrar();
}
