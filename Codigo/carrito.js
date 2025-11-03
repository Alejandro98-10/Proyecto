let sesionActiva = null;
let carritoActual = [];

function inicializarDatos() {
    const datosUsuario = localStorage.getItem('sesionActual');
    if (datosUsuario) {
        sesionActiva = JSON.parse(datosUsuario);
        const elementoInfo = document.getElementById('infoSesion');
        if (elementoInfo) {
            elementoInfo.textContent = 'Hola, ' + sesionActiva.nombre;
        }
        cargarCarrito();
    } else {
        document.getElementById('carritoVacio').style.display = 'block';
        document.getElementById('contenidoCarrito').style.display = 'none';
    }
}

function cargarCarrito() {
    const cuentas = JSON.parse(localStorage.getItem('cuentasUsuarios')) || [];
    const cuenta = cuentas.find(c => c.email === sesionActiva.email);
    
    if (cuenta && cuenta.carro && cuenta.carro.length > 0) {
        carritoActual = cuenta.carro;
        renderizarCarrito();
        document.getElementById('carritoVacio').style.display = 'none';
        document.getElementById('contenidoCarrito').style.display = 'block';
    } else {
        document.getElementById('carritoVacio').style.display = 'block';
        document.getElementById('contenidoCarrito').style.display = 'none';
    }
}

function renderizarCarrito() {
    const contenedor = document.getElementById('listaCarrito');
    contenedor.innerHTML = '';
    
    carritoActual.forEach((articulo, index) => {
        const item = document.createElement('div');
        item.className = 'card mb-3';
        item.innerHTML = `
            <div class="card-body">
                <div class="row align-items-center">
                    <div class="col-md-2">
                        <img src="${articulo.foto}" class="img-fluid rounded" style="max-height: 80px; object-fit: cover;">
                    </div>
                    <div class="col-md-4">
                        <h5 class="mb-1">${articulo.titulo}</h5>
                        <small class="text-muted">${articulo.tipo}</small>
                    </div>
                    <div class="col-md-2">
                        <strong>$${parseFloat(articulo.valor).toFixed(2)}</strong>
                    </div>
                    <div class="col-md-2">
                        <input type="number" class="form-control form-control-sm" value="1" min="1" max="${articulo.cantidad}" id="cantidad-${index}" onchange="actualizarCantidad(${index})">
                    </div>
                    <div class="col-md-2 text-end">
                        <button class="btn btn-danger btn-sm" onclick="eliminarDelCarrito(${index})">Eliminar</button>
                    </div>
                </div>
            </div>
        `;
        contenedor.appendChild(item);
    });
    
    calcularTotal();
}

function actualizarCantidad(index) {
    const cantidad = parseInt(document.getElementById(`cantidad-${index}`).value);
    if (cantidad > 0 && cantidad <= carritoActual[index].cantidad) {
        calcularTotal();
    } else {
        document.getElementById(`cantidad-${index}`).value = 1;
        Swal.fire('Error', 'Cantidad no válida', 'error');
    }
}

function calcularTotal() {
    let subtotal = 0;
    carritoActual.forEach((articulo, index) => {
        const cantidadInput = document.getElementById(`cantidad-${index}`);
        const cantidad = cantidadInput ? parseInt(cantidadInput.value) : 1;
        subtotal += parseFloat(articulo.valor) * cantidad;
    });
    
    const envio = 50.00;
    const total = subtotal + envio;
    
    document.getElementById('subtotal').textContent = '$' + subtotal.toFixed(2);
    document.getElementById('envio').textContent = '$' + envio.toFixed(2);
    document.getElementById('total').textContent = '$' + total.toFixed(2);
}

function eliminarDelCarrito(index) {
    Swal.fire({
        title: 'Eliminar producto',
        text: '¿Deseas eliminar este producto del carrito?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Eliminar',
        cancelButtonText: 'Cancelar'
    }).then((resultado) => {
        if (resultado.isConfirmed) {
            carritoActual.splice(index, 1);
            
            const cuentas = JSON.parse(localStorage.getItem('cuentasUsuarios')) || [];
            const indiceCuenta = cuentas.findIndex(c => c.email === sesionActiva.email);
            cuentas[indiceCuenta].carro = carritoActual;
            localStorage.setItem('cuentasUsuarios', JSON.stringify(cuentas));
            
            if (carritoActual.length === 0) {
                document.getElementById('carritoVacio').style.display = 'block';
                document.getElementById('contenidoCarrito').style.display = 'none';
            } else {
                renderizarCarrito();
            }
            
            Swal.fire('Eliminado', 'Producto eliminado del carrito', 'success');
        }
    });
}

document.getElementById('btnFinalizarCompra').addEventListener('click', function() {
    if (carritoActual.length === 0) {
        Swal.fire('Error', 'El carrito está vacío', 'error');
        return;
    }
    
    Swal.fire({
        title: 'Confirmar compra',
        text: '¿Deseas finalizar tu compra?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Confirmar',
        cancelButtonText: 'Cancelar'
    }).then((resultado) => {
        if (resultado.isConfirmed) {
            const cuentas = JSON.parse(localStorage.getItem('cuentasUsuarios')) || [];
            const indiceCuenta = cuentas.findIndex(c => c.email === sesionActiva.email);
            
            const productosComprados = [];
            carritoActual.forEach((articulo, index) => {
                const cantidadInput = document.getElementById(`cantidad-${index}`);
                const cantidad = cantidadInput ? parseInt(cantidadInput.value) : 1;
                productosComprados.push({
                    ...articulo,
                    cantidadComprada: cantidad
                });
            });
            
            const pedido = {
                id: Date.now(),
                fecha: new Date().toISOString(),
                productos: productosComprados,
                total: parseFloat(document.getElementById('total').textContent.replace('$', '')),
                estado: 'Pendiente'
            };
            
            if (!cuentas[indiceCuenta].compras) {
                cuentas[indiceCuenta].compras = [];
            }
            cuentas[indiceCuenta].compras.push(pedido);
            
            // Actualizar stock de productos
            const articulos = JSON.parse(localStorage.getItem('articulos')) || [];
            productosComprados.forEach(productoComprado => {
                const indexArticulo = articulos.findIndex(a => a.codigo === productoComprado.codigo);
                if (indexArticulo !== -1) {
                    articulos[indexArticulo].cantidad -= productoComprado.cantidadComprada;
                }
            });
            localStorage.setItem('articulos', JSON.stringify(articulos));
            
            // Vaciar carrito
            cuentas[indiceCuenta].carro = [];
            localStorage.setItem('cuentasUsuarios', JSON.stringify(cuentas));
            
            Swal.fire('Compra exitosa', 'Tu pedido ha sido registrado', 'success').then(() => {
                location.reload();
            });
        }
    });
});

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