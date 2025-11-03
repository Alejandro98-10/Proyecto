let listaArticulos = [];
let idEditando = null;
let sesionActiva = null;

function inicializarDatos() {
    const articulosGuardados = localStorage.getItem('articulos');
    if (articulosGuardados) {
        listaArticulos = JSON.parse(articulosGuardados);
    }
    
    const datosUsuario = localStorage.getItem('sesionActual');
    if (datosUsuario) {
        sesionActiva = JSON.parse(datosUsuario);
        const elementoInfo = document.getElementById('infoSesion');
        if (elementoInfo) {
            elementoInfo.textContent = 'Hola, ' + sesionActiva.nombre;
        }
    }
}

function almacenarArticulos() {
    localStorage.setItem('articulos', JSON.stringify(listaArticulos));
}

function renderizarArticulos() {
    const contenedor = document.getElementById('listaProductos');
    contenedor.innerHTML = '';

    listaArticulos.forEach(function (articulo) {
        const columna = document.createElement('div');
        columna.className = 'col-md-4 mb-4';
        columna.innerHTML = `
            <div class="card h-100">
                <img src="${articulo.foto}" class="card-img-top">
                <div class="card-body">
                    <h5 class="card-title">${articulo.titulo}</h5>
                    <p class="card-text text-muted">${articulo.info}</p>
                    <p class="card-text text-muted">Disponible: ${articulo.cantidad}</p>
                    <p class="card-text"><strong>Seccion:</strong> ${articulo.tipo}</p>
                    <h4>$${articulo.valor}</h4>
                    <div class="d-flex gap-2">
                        <button class="btn btn-secondary btn-sm flex-fill" onclick="modificarArticulo(${articulo.codigo})">Editar</button>
                        <button class="btn btn-danger btn-sm flex-fill" onclick="borrarArticulo(${articulo.codigo})">Eliminar</button>
                        <button class="btn btn-dark btn-sm flex-fill" onclick="agregarAlCarro(${articulo.codigo})">Carrito</button>
                    </div>
                </div>
            </div>
        `;
        contenedor.appendChild(columna);
    });
}

document.getElementById('btnNuevoProducto').addEventListener('click', function () {
    if (!sesionActiva) {
        Swal.fire('Atencion', 'Debes iniciar sesion para agregar productos', 'warning');
        return;
    }
    idEditando = null;
    document.getElementById('tituloFormulario').textContent = 'Agregar Producto';
    document.getElementById('formularioArticulo').reset();
    document.getElementById('contenedorVista').style.display = 'none';
    const ventana = new bootstrap.Modal(document.getElementById('modalArticulo'));
    ventana.show();
});

document.getElementById('imagenArticulo').addEventListener('change', function (evento) {
    const archivo = evento.target.files[0];
    if (archivo) {
        const lector = new FileReader();
        lector.onload = function (e) {
            document.getElementById('vistaPrevia').src = e.target.result;
            document.getElementById('contenedorVista').style.display = 'block';
        };
        lector.readAsDataURL(archivo);
    }
});

document.getElementById('formularioArticulo').addEventListener('submit', function (evento) {
    evento.preventDefault();

    const titulo = document.getElementById('nombreArticulo').value;
    const valor = document.getElementById('costoArticulo').value;
    const cantidad = document.getElementById('existencias').value;
    const info = document.getElementById('detallesArticulo').value;
    const tipo = document.getElementById('tipoArticulo').value;
    const archivo = document.getElementById('imagenArticulo').files[0];

    if (idEditando) {
        const posicion = listaArticulos.findIndex(art => art.codigo === idEditando);
        if (archivo) {
            if (valor < 0 || cantidad < 0) {
                Swal.fire('Error', 'Los valores no pueden ser negativos', 'error');
                return;
            }
            const lector = new FileReader();
            lector.onload = function (e) {
                listaArticulos[posicion].titulo = titulo;
                listaArticulos[posicion].valor = valor;
                listaArticulos[posicion].cantidad = cantidad;
                listaArticulos[posicion].info = info;
                listaArticulos[posicion].tipo = tipo;
                listaArticulos[posicion].foto = e.target.result;
                almacenarArticulos();
                renderizarArticulos();
                bootstrap.Modal.getInstance(document.getElementById('modalArticulo')).hide();
                Swal.fire('Completado', 'Articulo actualizado', 'success');
            };
            lector.readAsDataURL(archivo);
        } else {
            if (valor < 0 || cantidad < 0) {
                Swal.fire('Error', 'Los valores no pueden ser negativos', 'error');
                return;
            }
            if (valor == 0) {
                Swal.fire('Error', 'El precio debe ser mayor a cero', 'error');
                return;
            }
            listaArticulos[posicion].titulo = titulo;
            listaArticulos[posicion].valor = valor;
            listaArticulos[posicion].cantidad = cantidad;
            listaArticulos[posicion].info = info;
            listaArticulos[posicion].tipo = tipo;
            almacenarArticulos();
            renderizarArticulos();
            bootstrap.Modal.getInstance(document.getElementById('modalArticulo')).hide();
            Swal.fire('Completado', 'Articulo actualizado', 'success');
        }
    } else {
        if (!archivo) {
            Swal.fire('Error', 'Debes seleccionar una imagen', 'error');
            return;
        }
        if (valor < 0 || cantidad < 0) {
            Swal.fire('Error', 'Los valores no pueden ser negativos', 'error');
            return;
        }
        if (valor == 0) {
            Swal.fire('Error', 'El precio debe ser mayor a cero', 'error');
            return;
        }
        const lector = new FileReader();
        lector.onload = function (e) {
            const nuevoArticulo = {
                codigo: Date.now(),
                titulo: titulo,
                valor: valor,
                cantidad: cantidad,
                info: info,
                tipo: tipo,
                foto: e.target.result
            };
            listaArticulos.push(nuevoArticulo);
            almacenarArticulos();
            renderizarArticulos();
            bootstrap.Modal.getInstance(document.getElementById('modalArticulo')).hide();
            Swal.fire('Completado', 'Articulo agregado correctamente', 'success');
        };
        lector.readAsDataURL(archivo);
    }
});

function modificarArticulo(codigo) {
    idEditando = codigo;
    const articulo = listaArticulos.find(art => art.codigo === codigo);
    document.getElementById('tituloFormulario').textContent = 'Editar Producto';
    document.getElementById('nombreArticulo').value = articulo.titulo;
    document.getElementById('costoArticulo').value = articulo.valor;
    document.getElementById('existencias').value = articulo.cantidad;
    document.getElementById('detallesArticulo').value = articulo.info;
    document.getElementById('tipoArticulo').value = articulo.tipo;
    document.getElementById('vistaPrevia').src = articulo.foto;
    document.getElementById('contenedorVista').style.display = 'block';
    const ventana = new bootstrap.Modal(document.getElementById('modalArticulo'));
    ventana.show();
}

function borrarArticulo(codigo) {
    Swal.fire({
        title: 'Confirmar eliminacion',
        text: 'Este articulo sera eliminado permanentemente',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Eliminar',
        cancelButtonText: 'Cancelar'
    }).then((resultado) => {
        if (resultado.isConfirmed) {
            listaArticulos = listaArticulos.filter(art => art.codigo !== codigo);
            almacenarArticulos();
            renderizarArticulos();
            Swal.fire('Eliminado', 'Articulo eliminado correctamente', 'success');
        }
    });
}

function agregarAlCarro(codigo) {
    if (!sesionActiva) {
        Swal.fire('Atencion', 'Debes iniciar sesion para agregar al carrito', 'warning');
        return;
    }
    const articulo = listaArticulos.find(art => art.codigo === codigo);
    if (articulo.cantidad <= 0) {
        Swal.fire('Sin existencias', 'Este articulo no esta disponible', 'error');
        return;
    }
    const cuentas = JSON.parse(localStorage.getItem('cuentasUsuarios')) || [];
    const indiceCuenta = cuentas.findIndex(c => c.email === sesionActiva.email);
    const carritoActual = cuentas[indiceCuenta].carro || [];
    carritoActual.push(articulo);
    cuentas[indiceCuenta].carro = carritoActual;
    localStorage.setItem('cuentasUsuarios', JSON.stringify(cuentas));
    Swal.fire('Agregado', 'Articulo agregado al carrito', 'success');
}

document.getElementById('btnAcceso').addEventListener('click', function () {
    if (sesionActiva) {
        Swal.fire({
            title: 'Cerrar sesion',
            text: 'Deseas cerrar tu sesion actual?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Si',
            cancelButtonText: 'No'
        }).then((resultado) => {
            if (resultado.isConfirmed) {
                localStorage.removeItem('sesionActual');
                location.reload();
            }
        });
    } else {
        const ventana = new bootstrap.Modal(document.getElementById('modalAcceso'));
        ventana.show();
    }
});

document.getElementById('irRegistro').addEventListener('click', function (evento) {
    evento.preventDefault();
    bootstrap.Modal.getInstance(document.getElementById('modalAcceso')).hide();
    const ventana = new bootstrap.Modal(document.getElementById('modalNuevaCuenta'));
    ventana.show();
});

document.getElementById('volverAcceso').addEventListener('click', function (evento) {
    evento.preventDefault();
    bootstrap.Modal.getInstance(document.getElementById('modalNuevaCuenta')).hide();
    const ventana = new bootstrap.Modal(document.getElementById('modalAcceso'));
    ventana.show();
});

document.getElementById('formularioRegistro').addEventListener('submit', function (evento) {
    evento.preventDefault();

    const nombre = document.getElementById('nombreRegistro').value;
    const email = document.getElementById('emailRegistro').value;
    const telefono = document.getElementById('telefonoRegistro').value;
    const clave = document.getElementById('claveRegistro').value;
    const confirmar = document.getElementById('confirmarClave').value;

    if (clave !== confirmar) {
        Swal.fire('Error', 'Las contraseñas no son iguales', 'error');
        return;
    }

    const cuentas = JSON.parse(localStorage.getItem('cuentasUsuarios')) || [];

    if (cuentas.find(c => c.email === email)) {
        Swal.fire('Error', 'Este correo ya esta registrado', 'error');
        return;
    }

    cuentas.push({
        nombre: nombre,
        email: email,
        telefono: telefono,
        clave: clave,
        carro: [],
        compras: []
    });

    localStorage.setItem('cuentasUsuarios', JSON.stringify(cuentas));
    bootstrap.Modal.getInstance(document.getElementById('modalNuevaCuenta')).hide();
    Swal.fire('Registro exitoso', 'Tu cuenta ha sido creada', 'success');
});

document.getElementById('formularioAcceso').addEventListener('submit', function (evento) {
    evento.preventDefault();
    const email = document.getElementById('emailAcceso').value;
    const clave = document.getElementById('claveAcceso').value;
    const cuentas = JSON.parse(localStorage.getItem('cuentasUsuarios')) || [];
    const cuenta = cuentas.find(c => c.email === email && c.clave === clave);

    if (!cuenta) {
        Swal.fire('Error', 'Credenciales incorrectas', 'error');
        return;
    }
    localStorage.setItem('sesionActual', JSON.stringify({
        nombre: cuenta.nombre,
        email: cuenta.email,
        telefono: cuenta.telefono
    }));
    bootstrap.Modal.getInstance(document.getElementById('modalAcceso')).hide();
    Swal.fire('Bienvenido', 'Sesion iniciada correctamente', 'success').then(() => {
        location.reload();
    });
});

inicializarDatos();
renderizarArticulos();