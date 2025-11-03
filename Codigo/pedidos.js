let sesionActiva = null;
let pedidos = [];

function inicializarDatos() {
    const datosUsuario = localStorage.getItem('sesionActual');
    if (datosUsuario) {
        sesionActiva = JSON.parse(datosUsuario);
        const elementoInfo = document.getElementById('infoSesion');
        if (elementoInfo) {
            elementoInfo.textContent = 'Hola, ' + sesionActiva.nombre;
        }
        cargarPedidos();
    } else {
        document.getElementById('pedidosVacio').style.display = 'block';
    }
}

function cargarPedidos() {
    const cuentas = JSON.parse(localStorage.getItem('cuentasUsuarios')) || [];
    const cuenta = cuentas.find(c => c.email === sesionActiva.email);
    
    if (cuenta && cuenta.compras && cuenta.compras.length > 0) {
        pedidos = cuenta.compras.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
        renderizarPedidos();
    } else {
        document.getElementById('pedidosVacio').style.display = 'block';
    }
}

function renderizarPedidos() {
    const contenedor = document.getElementById('listaPedidos');
    contenedor.innerHTML = '';
    
    pedidos.forEach((pedido, index) => {
        const fecha = new Date(pedido.fecha);
        const fechaFormateada = fecha.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        const estadoBadge = obtenerBadgeEstado(pedido.estado);
        
        const card = document.createElement('div');
        card.className = 'card mb-3';
        card.innerHTML = `
            <div class="card-body">
                <div class="row align-items-center">
                    <div class="col-md-2">
                        <strong>Pedido #${pedido.id}</strong>
                    </div>
                    <div class="col-md-3">
                        <small class="text-muted">${fechaFormateada}</small>
                    </div>
                    <div class="col-md-2">
                        <span class="badge ${estadoBadge}">${pedido.estado}</span>
                    </div>
                    <div class="col-md-2">
                        <strong>$${pedido.total.toFixed(2)}</strong>
                    </div>
                    <div class="col-md-3 text-end">
                        <button class="btn btn-dark btn-sm" onclick="verDetalle(${index})">Ver Detalle</button>
                        <button class="btn btn-secondary btn-sm" onclick="cambiarEstado(${index})">Estado</button>
                    </div>
                </div>
            </div>
        `;
        contenedor.appendChild(card);
    });
}

function obtenerBadgeEstado(estado) {
    switch(estado) {
        case 'Pendiente':
            return 'bg-warning';
        case 'En proceso':
            return 'bg-info';
        case 'Enviado':
            return 'bg-primary';
        case 'Entregado':
            return 'bg-success';
        case 'Cancelado':
            return 'bg-danger';
        default:
            return 'bg-secondary';
    }
}

function verDetalle(index) {
    const pedido = pedidos[index];
    let html = `
        <div class="mb-3">
            <strong>Pedido #${pedido.id}</strong><br>
            <small class="text-muted">Fecha: ${new Date(pedido.fecha).toLocaleString('es-ES')}</small><br>
            <span class="badge ${obtenerBadgeEstado(pedido.estado)} mt-2">${pedido.estado}</span>
        </div>
        <hr>
        <h6>Productos:</h6>
        <div class="table-responsive">
            <table class="table">
                <thead>
                    <tr>
                        <th>Producto</th>
                        <th>Cantidad</th>
                        <th>Precio</th>
                        <th>Subtotal</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    pedido.productos.forEach(producto => {
        const subtotal = producto.valor * producto.cantidadComprada;
        html += `
            <tr>
                <td>
                    <img src="${producto.foto}" style="width: 40px; height: 40px; object-fit: cover; margin-right: 10px;" class="rounded">
                    ${producto.titulo}
                </td>
                <td>${producto.cantidadComprada}</td>
                <td>$${parseFloat(producto.valor).toFixed(2)}</td>
                <td>$${subtotal.toFixed(2)}</td>
            </tr>
        `;
    });
    
    html += `
                </tbody>
            </table>
        </div>
        <hr>
        <div class="text-end">
            <h5>Total: $${pedido.total.toFixed(2)}</h5>
        </div>
    `;
    
    document.getElementById('detalleContenido').innerHTML = html;
    const modal = new bootstrap.Modal(document.getElementById('modalDetalle'));
    modal.show();
}

function cambiarEstado(index) {
    Swal.fire({
        title: 'Cambiar estado del pedido',
        input: 'select',
        inputOptions: {
            'Pendiente': 'Pendiente',
            'En proceso': 'En proceso',
            'Enviado': 'Enviado',
            'Entregado': 'Entregado',
            'Cancelado': 'Cancelado'
        },
        inputValue: pedidos[index].estado,
        showCancelButton: true,
        confirmButtonText: 'Cambiar',
        cancelButtonText: 'Cancelar'
    }).then((resultado) => {
        if (resultado.isConfirmed) {
            const cuentas = JSON.parse(localStorage.getItem('cuentasUsuarios')) || [];
            const indiceCuenta = cuentas.findIndex(c => c.email === sesionActiva.email);
            cuentas[indiceCuenta].compras[index].estado = resultado.value;
            localStorage.setItem('cuentasUsuarios', JSON.stringify(cuentas));
            
            pedidos[index].estado = resultado.value;
            renderizarPedidos();
            Swal.fire('Actualizado', 'Estado del pedido actualizado', 'success');
        }
    });
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