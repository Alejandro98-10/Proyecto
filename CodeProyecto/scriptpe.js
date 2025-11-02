let productosCarrito = [];
let usuario = null;
let comprobar = true;
let contenedor = document.getElementById('pedidos');

/*window.addEventListener('load', function() {
    const loader = document.getElementById('loader');
    loader.style.display = "none";
    contenedor.style.display = "block";
});*/

function cargarDatos() {
    let usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
    let user = JSON.parse(localStorage.getItem('usuario'));

    if (user) {
        usuario = user;
        let saludo = document.getElementById('saludo');
        if (saludo) {
            saludo.style.display = 'inline';
            saludo.textContent = 'Hola, ' + usuario.nom;
        }
        comprobar = true;

        let usuarioEncontrado = usuarios.find(u => u.correo === usuario.correo);
        if (usuarioEncontrado && Array.isArray(usuarioEncontrado.pedidos)) {
            productosCarrito = usuarioEncontrado.pedidos;
        } else {
            productosCarrito = [];
        }
    } else {
        comprobar = false;
    }
}

function mostrarPedidos() {
    const pedidosDiv = document.getElementById('pedidos');
    pedidosDiv.innerHTML = '';

    if ((productosCarrito.length === 0) && comprobar) {
        pedidosDiv.innerHTML = '<h3>No tienes pedidos realizados</h3>';
        return;
    }

    if (!comprobar) {
        pedidosDiv.innerHTML = '<h3>Parece que no has iniciado sesion :(, inicia sesión para ver tus pedidos</h3>';
        return;
    }
    productosCarrito.forEach((pedido, index) => {
        const pedidoContainer = document.createElement('div');
        pedidoContainer.className = 'card shadow-sm mb-4';
        pedidoContainer.style.borderRadius = '12px';

        const header = document.createElement('div');
        header.className = 'card-header bg-primary text-white';
        header.innerHTML = `
            <div class="d-flex justify-content-between">
                <h5>Pedido #${index + 1}</h5>
                <span>${pedido.fecha}</span>
            </div>
        `;

        const body = document.createElement('div');
        body.className = 'card-body';
        (pedido.productos || []).forEach(prod => {
            const prodCard = document.createElement('div');
            prodCard.className = 'card mb-2';
            prodCard.innerHTML = `
                <div class="row g-0 align-items-center">
                    <div class="col-md-3 text-center">
                        <img src="${prod.img}" alt="${prod.nom}" class="img-fluid rounded-start" style="max-height:100px; object-fit:cover;">
                    </div>
                    <div class="col-md-9">
                        <div class="card-body py-2">
                            <h6 class="card-title mb-0">${prod.nom}</h6>
                            <p class="text-muted mb-1">${prod.desc || ''}</p>
                            <p class="mb-0"><strong>Precio:</strong> $${prod.precio}</p>
                        </div>
                    </div>
                </div>
            `;
            body.appendChild(prodCard);
        });

        const footer = document.createElement('div');
        footer.className = 'card-footer text-end bg-light';
        footer.innerHTML = `<strong>Total del pedido: $${pedido.total}</strong>`;

        pedidoContainer.appendChild(header);
        pedidoContainer.appendChild(body);
        pedidoContainer.appendChild(footer);
        pedidosDiv.appendChild(pedidoContainer);
    });
}

function exportar_exe() {
    let usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
    let usuarioActual = JSON.parse(localStorage.getItem('usuario'));

    if (!usuarioActual) {
        Swal.fire('Advertencia', 'Debes iniciar sesión para exportar.', 'warning');
        return;
    }

    let usuarioEncontrado = usuarios.find(u => u.correo === usuarioActual.correo);

    if (!usuarioEncontrado || !usuarioEncontrado.pedidos || usuarioEncontrado.pedidos.length === 0) {
        Swal.fire('Advertencia', 'No hay pedidos para exportar.', 'warning');
        return;
    }

    let datos = [["PRODUCTO", "CANTIDAD", "PRECIO UNITARIO", "PRECIO TOTAL", "FECHA"]];

    usuarioEncontrado.pedidos.forEach(function(pedido) {
        let productos = pedido.productos;

        let contador = {};
        productos.forEach(function(prod) {
            if (contador[prod.nom]) {
                contador[prod.nom].cantidad++;
            } else {
                contador[prod.nom] = {
                    cantidad: 1,
                    precio: parseFloat(prod.precio)
                };
            }
        });

        for (let nombre in contador) {
            let cantidad = contador[nombre].cantidad;
            let precioUnitario = contador[nombre].precio;
            let precioTotal = (cantidad * precioUnitario).toFixed(2);
            datos.push([nombre, cantidad, precioUnitario, precioTotal, pedido.fecha]);
        }

        datos.push(["", "",  "Total del pedido:", pedido.total]);
        datos.push([]);
    });

    let libro = XLSX.utils.book_new();
    let hoja = XLSX.utils.aoa_to_sheet(datos);
    XLSX.utils.book_append_sheet(libro, hoja, "Pedidos");
    XLSX.writeFile(libro, "reporte_pedidos_de_Kibuy.xlsx");

    Swal.fire('Confirmacion', 'El archivo Excel se generó correctamente.', 'success');
}

let botonExcel = document.getElementById("btnExcel");
if (botonExcel) {
    botonExcel.addEventListener("click", exportar_exe);
}

cargarDatos();
mostrarPedidos();