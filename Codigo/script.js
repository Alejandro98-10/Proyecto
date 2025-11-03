let productos = [];
let editando = null;
let usuario = null;
let carroUsuario = [];
//Esas variables son las globales
//localStorage.clear();

window.addEventListener('load', function() {
    const loader = document.getElementById('loader');
    loader.style.display = "none";
});

//Funcion para que cada que cargue la pagina carguen los productos y si hay un usuario activo pues solo muestra un hola y el nombre de este
function cargarDatos() {
    let prod = JSON.parse(window.localStorage.getItem('productos'));
    if (prod) {
        productos = prod;
    }
    let user = JSON.parse(window.localStorage.getItem('usuario'));
    if (user) {
        usuario = user;
        let saludo = document.getElementById('saludo');
        if (saludo) {
            saludo.style.display = 'inline';
            saludo.textContent = 'Hola, ' + usuario.nom;
        }
    }
}

//Para guardar productos
function guardar() {
    window.localStorage.setItem('productos', JSON.stringify(productos));
}

//La estructura de los card para mostrarlos en cada producto
function mostrar() {
    let contenedor = document.getElementById('productos');
    contenedor.innerHTML = '';

    productos.forEach(function (p) {
        let col = document.createElement('div');
        col.className = 'col-md-3 mb-4';
        col.innerHTML = `
            <div class="card h-100">
                <img src="${p.img}" class="card-img-top" style="height:200px; object-fit:cover;">
                <div class="card-body">
                    <h5 class="card-title">${p.nom}</h5>
                    <p class="card-text text-muted">${p.desc}</p>
                    <p class="card-text text-muted">Stock: ${p.stock}</p>
                    <p class="card-text"><strong>Categoria:</strong> ${p.cat}</p>
                    <h4 class="text-primary">$${p.precio}</h4>
                    <div class="d-flex gap-2">
                        <button class="btn btn-warning btn-sm flex-fill" onclick="editar(${p.id})">Editar</button>
                        <button class="btn btn-danger btn-sm flex-fill" onclick="eliminar(${p.id})">Eliminar</button>
                        <button class="btn btn btn-primary btn-sm flex-fill" onclick="carro(${p.id})">Agregar al carro</button>
                    </div>
                </div>
            </div>
        `;
        contenedor.appendChild(col);
    });
}

//Abre el modal de agregar productos al dar click al boton agregar
document.getElementById('btnAgregar').addEventListener('click', function () {
    if (!usuario) {
        Swal.fire('Error', 'Debes iniciar sesion para agregar productos', 'error');
        return;
    }
    editando = null;

    document.getElementById('tituloModal').textContent = 'Agregar Producto';
    document.getElementById('formProducto').reset();
    document.getElementById('preview').style.display = 'none';
    let modal = new bootstrap.Modal(document.getElementById('modalProducto'));
    modal.show();
});

//se encarga de guardar la imagen para mostrarla en base64
document.getElementById('img').addEventListener('change', function (e) {
    let file = e.target.files[0];
    if (file) {
        let reader = new FileReader();
        reader.onload = function (evento) {
            document.getElementById('imgPreview').src = evento.target.result;
            document.getElementById('preview').style.display = 'block';
        };
        reader.readAsDataURL(file);
    }
});

/*Cuando presionas submit en el de agregar productos guarda los datos en variables para despues ir pasandolas a
un vector si cuentan con las validaciones y solo si el usuario no esta editando, esto se hace con una variable
la cual verificara si el usuario se encuentra editando o esta creando un nuevo articulo, esta variable se encuentra
en la funcion editar y tiene como parametro la id del producto para asi poder buscarlo por ese id para poder
modificar directamente los datos de este.*/
document.getElementById('formProducto').addEventListener('submit', function (e) {
    e.preventDefault();

    let nom = document.getElementById('nomProdus').value;
    let precio = document.getElementById('precio').value;
    let stock = document.getElementById('stock').value;
    let desc = document.getElementById('desc').value;
    let cat = document.getElementById('categoria').value;
    let img = document.getElementById('img').files[0];

    if (editando) {
        let indice = productos.findIndex(p => p.id === editando);
        if (img) {
            if (precio<0 || stock<0){
            Swal.fire('Error', 'No puede haber valores negativos', 'error');
            return;
        }
            let leer = new FileReader();
            leer.onload = function (evento) {
                productos[indice].nom = nom;
                productos[indice].precio = precio;
                productos[indice].stock = stock;
                productos[indice].desc = desc;
                productos[indice].cat = cat;
                productos[indice].img = evento.target.result;
                guardar();
                mostrar();
                bootstrap.Modal.getInstance(document.getElementById('modalProducto')).hide();
                Swal.fire('Listo!!!', 'Producto actualizado', 'success');
            };
            leer.readAsDataURL(img);
            //no es necesario poner una imagen 
        } else {
            if (precio<0 || stock<0){
            Swal.fire('Error', 'No puede haber valores negativos', 'error');
            return;
        }
        if (precio==0){
            Swal.fire('Error', 'El precio no puede ser 0', 'error');
            return;
        }
            productos[indice].nom = nom;
            productos[indice].precio = precio;
            productos[indice].stock = stock;
            productos[indice].desc = desc;
            productos[indice].cat = cat;
            guardar();
            mostrar();
            bootstrap.Modal.getInstance(document.getElementById('modalProducto')).hide();
            Swal.fire('Listo!', 'Producto actualizado', 'success');
        }
    } else {
        if (!img) {
            Swal.fire('Error', 'Debes subir una imagen', 'error');
            return;
        }
        if (precio<0 || stock<0){
            Swal.fire('Error', 'No puede haber valores negativos', 'error');
            return;
        }
        if (precio==0){
            Swal.fire('Error', 'El precio no puede ser 0', 'error');
            return;
        }
        let reader = new FileReader();
        reader.onload = function (evento) {
            let prod = {
                id: Date.now(),
                nom: nom,
                precio: precio,
                stock: stock,
                desc: desc,
                cat: cat,
                img: evento.target.result
            };
            productos.push(prod);
            guardar();
            mostrar();
            bootstrap.Modal.getInstance(document.getElementById('modalProducto')).hide();
            Swal.fire('Listo!', 'Producto agregado', 'success');
        };
        reader.readAsDataURL(img);
    }
});

/*Esta es mi funcion de editar la cual agarrara los valores que ya tiene para mostrarlos y ya que de ahi
modifique*/
function editar(id) {
    editando = id;
    let prod = productos.find(p => p.id === id);
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
    Swal.fire({
        title: 'Estás seguro?',
        text: 'No podras recuperar este producto',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Si, eliminar',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            productos = productos.filter(p => p.id !== id);
            guardar();
            mostrar();
            Swal.fire('Eliminado', 'El producto ha sido eliminado', 'success');
        }
    });
}

function carro(id) {
    if(!usuario){
        Swal.fire('Error', 'Debes iniciar sesion para agregar productos al carro', 'error');
        return;
    }
    let prod = productos.find(p => p.id === id);
    //console.log(prod.id)
    //console.log(prod.stock)
    if (prod.stock<=0){
        Swal.fire('Agotado', 'No hay stock disponible de este producto', 'error');
        return;
    }
    //aqui busco al usuario para asignarle el producto al carro de este
    let usuarios = JSON.parse(window.localStorage.getItem('usuarios')) || [];
    let indiceUsuario = usuarios.findIndex(u => u.correo === usuario.correo);



    let carroActual = usuarios[indiceUsuario].carro || [];

    //let carroActual = JSON.parse(localStorage.getItem('carro')) || [];
    //console.log(carroActual)s

    carroActual.push(prod);
    usuarios[indiceUsuario].carro = carroActual;
    window.localStorage.setItem('usuarios', JSON.stringify(usuarios));
    Swal.fire('Añadido al carro', 'Se agrego al carro correctamente', 'success');
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
        carros: [],
        pedidos: []
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
mostrar();