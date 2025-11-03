let productos = [];
let usuario = null;

function cargarDatos() {
    productos = JSON.parse(localStorage.getItem('productos')) || [];
    let user = JSON.parse(localStorage.getItem('usuario'));
    
    if (user) {
        usuario = user;
        let saludo = document.getElementById('saludo');
        if (saludo) {
            saludo.style.display = 'inline';
            saludo.textContent = 'Hola, ' + usuario.nom;
        }
    }
}
function mostrarCatalogo() {
    let catalogo = document.getElementById('catalogo');
    catalogo.innerHTML = '';
    
    if (productos.length === 0) {
        catalogo.innerHTML = '<p class="text-center text-muted">No hay productos disponibles</p>';
        return;
    }
    
    let productosPC = {};
    
    productos.forEach(function(producto) {
        let categoria = producto.cat || 'Sin categoria';
        if (!productosPC[categoria]) {
            productosPC[categoria] = [];
        }
        productosPC[categoria].push(producto);
    });
    
    for (let categoria in productosPC) {
        let seccionCategoria = document.createElement('div');
        seccionCategoria.className = 'mb-5';
        
        let titulo = document.createElement('h3');
        titulo.className = 'border-bottom pb-2 mb-3';
        titulo.textContent = categoria;
        seccionCategoria.appendChild(titulo);
        
        let row = document.createElement('div');
        row.className = 'row';
        
        productosPC[categoria].forEach(function(producto) {
            let col = document.createElement('div');
            col.className = 'col-md-4 col-lg-3 mb-4';
            col.innerHTML = `
                <div class="card h-100 shadow-sm">
                    <img src="${producto.img}" class="card-img-top" alt="${producto.nom}" style="height:200px; object-fit:cover;">
                    <div class="card-body d-flex flex-column">
                        <h5 class="card-title">${producto.nom}</h5>
                        <p class="card-text text-muted">${producto.desc}</p>
                        <div class="mt-auto">
                            <p class="text-primary fw-bold fs-5 mb-2">$${producto.precio}</p>
                            <p class="text-muted mb-2">Stock: ${producto.stock}</p>
                            <button class="btn btn-primary w-100" onclick="agregarAlCarro(${producto.id})">
                                <i class="fas fa-cart-plus"></i> Agregar al carro
                            </button>
                        </div>
                    </div>
                </div>
            `;
            row.appendChild(col);
        });
        
        seccionCategoria.appendChild(row);
        catalogo.appendChild(seccionCategoria);
    }
}

function agregarAlCarro(id) {
    if (!usuario) {
        Swal.fire('Advertencia', 'Debes iniciar sesión para agregar productos al carro', 'warning');
        return;
    }
    
    let producto = productos.find(p => p.id === id);
    
    if (producto.stock <= 0) {
        Swal.fire('Agotado', 'Este producto no tiene stock disponible', 'error');
        return;
    }
    
    let usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
    let indiceUsuario = usuarios.findIndex(u => u.correo === usuario.correo);
    
    if (!usuarios[indiceUsuario].carro) {
        usuarios[indiceUsuario].carro = [];
    }
    
    usuarios[indiceUsuario].carro.push(producto);
    localStorage.setItem('usuarios', JSON.stringify(usuarios));
    
    Swal.fire('Agregado', 'Producto agregado al carro', 'success');
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

document.getElementById('abrirRegistro').addEventListener('click', function (e) {
    e.preventDefault();
    bootstrap.Modal.getInstance(document.getElementById('modalLogin')).hide();
    let modal = new bootstrap.Modal(document.getElementById('modalRegistro'));
    modal.show();
});

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
mostrarCatalogo();