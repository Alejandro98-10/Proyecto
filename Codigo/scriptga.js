/*window.addEventListener('load', function() {
    const loader = document.getElementById('loader');
    loader.style.display = "none";
    contenido.style.display = "block";
});*/

if (!localStorage.getItem('pedidosGenerales')) {
    localStorage.setItem('pedidosGenerales', JSON.stringify({
        ventasPorCategoria: {},
        ventasPorDia: {}
    }));
}

let botonBorrar = document.getElementById("btnBorrarTodo");
let usuario = null;
let comprobar = true;
let fechas = [];
let totales = [];

function cargarDatos() {
    fechas = [];
    totales = [];
    let usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
    let user = JSON.parse(localStorage.getItem('usuario'));

    if (user) {
        usuario = user;
        comprobar = true;

        //let usuarioEncontrado = usuarios.find(u => u.correo === usuario.correo);

        /*if (usuarioEncontrado && Array.isArray(usuarioEncontrado.pedidos) && usuarioEncontrado.pedidos.length > 0) {
            usuarioEncontrado.pedidos.forEach(function (pedido) {
                fechas.push(pedido.fecha);
                totales.push(parseFloat(pedido.total));
            });
        } else {
            alert("No hay pedidos registrados para este usuario.");
            comprobar = false;
        }*/

    } else {
        alert("No hay usuario activo. Inicia sesión para ver tus estadísticas.");
        comprobar = false;
    }
}

function graficarCategorias() {
    let estadisticas = JSON.parse(localStorage.getItem('pedidosGenerales')) || {
        ventasPorCategoria: {},
        ventasPorDia: {}
    };

    if (Object.keys(estadisticas.ventasPorCategoria).length === 0) {
        document.getElementById('graficaCategorias').parentElement.innerHTML = '<p class="text-center text-muted">No hay datos de categorías para mostrar.</p>';
        return;
    }

    let categorias = [];
    let cantidades = [];
    for (let categoria in estadisticas.ventasPorCategoria) {
        categorias.push(categoria);
        cantidades.push(estadisticas.ventasPorCategoria[categoria]);
    }

    let ctx = document.getElementById('graficaCategorias').getContext('2d');
    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: categorias,
            datasets: [{
                label: 'Productos vendidos',
                data: cantidades,
                backgroundColor: [
                    'rgba(255, 99, 132, 0.7)',
                    'rgba(54, 162, 235, 0.7)',
                    'rgba(255, 206, 86, 0.7)',
                    'rgba(75, 192, 192, 0.7)',
                    'rgba(153, 102, 255, 0.7)',
                    'rgba(255, 159, 64, 0.7)',
                    'rgba(199, 199, 199, 0.7)',
                    'rgba(83, 102, 255, 0.7)'
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)',
                    'rgba(199, 199, 199, 1)',
                    'rgba(83, 102, 255, 1)'
                ],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom',
                },
                title: {
                    display: true,
                    text: 'Distribucion de ventas por categoria'
                }
            }
        }
    });
}

function graficarGanancias() {
    let estadisticas = JSON.parse(localStorage.getItem('pedidosGenerales')) || {
        ventasPorCategoria: {},
        ventasPorDia: {}
    };

    if (Object.keys(estadisticas.ventasPorDia).length === 0) {
        document.getElementById('graficaGanancias').parentElement.innerHTML = '<p class="text-center text-muted">No hay datos de ventas por día para mostrar.</p>';
        return;
    }

    let fechas = [];
    let ganancias = [];

    for (let fecha in estadisticas.ventasPorDia) {
        fechas.push(fecha);
        ganancias.push(estadisticas.ventasPorDia[fecha]);
    }

    let ctx = document.getElementById('graficaGanancias').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: fechas,
            datasets: [{
                label: 'Ganancias ($)',
                data: ganancias,
                backgroundColor: 'rgba(194, 194, 194, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointRadius: 5,
                pointBackgroundColor: 'rgba(75, 192, 192, 1)',
                pointBorderColor: '#fff',
                pointBorderWidth: 2
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                },
                title: {
                    display: true,
                    text: 'Evolucion de ganancias diarias'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function (value) {
                            return '$' + value.toFixed(2);
                        }
                    }
                }
            }
        }
    });
}
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

    usuarioEncontrado.pedidos.forEach(function (pedido) {
        let productos = pedido.productos;

        let contador = {};
        productos.forEach(function (prod) {
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

        datos.push(["", "", "Total del pedido:", pedido.total]);
        datos.push([]);
    });

    let libro = XLSX.utils.book_new();
    let hoja = XLSX.utils.aoa_to_sheet(datos);
    XLSX.utils.book_append_sheet(libro, hoja, "Pedidos");
    XLSX.writeFile(libro, "reporte_pedidos_de_Kibuy.xlsx");

    Swal.fire('Confirmacion', 'El archivo Excel se generó correctamente.', 'success');
}

document.getElementById('abrirRegistro').addEventListener('click', function (e) {
    e.preventDefault();
    bootstrap.Modal.getInstance(document.getElementById('modalLogin')).hide();
    let modal = new bootstrap.Modal(document.getElementById('modalRegistro'));
    modal.show();
});

let botonExcel = document.getElementById("btnExcel");
if (botonExcel) {
    botonExcel.addEventListener("click", exportar_exe);
}

document.getElementById('abrirLogin').addEventListener('click', function (e) {
    e.preventDefault();
    bootstrap.Modal.getInstance(document.getElementById('modalRegistro')).hide();
    let modal = new bootstrap.Modal(document.getElementById('modalLogin'));
    modal.show();
});

document.getElementById('formRegistro').addEventListener('submit', function (e) {
    e.preventDefault();

    let nom = document.getElementById('nombre').value;
    let correo = document.getElementById('correoReg').value;
    let tel = document.getElementById('tel').value;
    let pass = document.getElementById('passReg').value;
    let passConf = document.getElementById('passConf').value;
    let carro;
    let pedidos;

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
        pass: pass,
        carro: [],
        pedidos: []
    });

    window.localStorage.setItem('usuarios', JSON.stringify(usuarios));
    bootstrap.Modal.getInstance(document.getElementById('modalRegistro')).hide();
    Swal.fire('Exito', 'Cuenta creada correctamente', 'success');
});

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

cargarDatos();
if (comprobar) {
    graficarCategorias();
    graficarGanancias();
}

if (botonBorrar) {
    botonBorrar.addEventListener("click", function() {
        Swal.fire({
            title: 'Estas seguro?',
            text: 'Se eliminaran todos los datos: usuarios, productos, pedidos y estadisticas. Esta acción no se puede deshacer.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, borrar todo',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6'
        }).then((result) => {
            if (result.isConfirmed) {
                let contraseña = prompt("Ingresa la contraseña para eliminar el producto:");
                if (contraseña === "12345678") {
                    localStorage.clear();
                    Swal.fire('Eliminado', 'Todos los datos han sido borrados', 'success').then(() => {
                        location.reload();
                    });
                } else {
                    Swal.fire('Error', 'Contraseña incorrecta', 'error');
                }
            }
        });
    });
}