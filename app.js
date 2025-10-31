// --- JS: app.js (Añadir a tu archivo principal) ---

/**
 * Muestra el listado de productos en el contenedor HTML.
 */
function cargarListadoProductos() {
    const productos = obtenerProductos(); // Función para obtener datos de localStorage
    const contenedor = document.getElementById('listado-productos');
    
    // Si no hay productos, mostrar un mensaje
    if (productos.length === 0) {
        contenedor.innerHTML = '<div class="alert alert-info">No hay productos registrados.</div>';
        return;
    }

    // 1. Crear el esqueleto de la tabla con Bootstrap
    let htmlTabla = `
        <table class="table table-striped table-hover align-middle">
            <thead>
                <tr>
                    <th scope="col">ID</th>
                    <th scope="col">Imagen</th>
                    <th scope="col">Nombre</th>
                    <th scope="col">Categoría</th>
                    <th scope="col">Precio</th>
                    <th scope="col">Stock</th>
                    <th scope="col">Acciones</th>
                </tr>
            </thead>
            <tbody>
    `;

    // 2. Iterar sobre los productos para generar las filas (filas dinámicas)
    productos.forEach(producto => {
        htmlTabla += `
            <tr>
                <td>${producto.id.split('-')[1]}</td> <td>
                    <img src="${producto.imagenUrl || 'placeholder.png'}" 
                         alt="${producto.nombre}" 
                         style="width: 50px; height: 50px; object-fit: cover;">
                </td>
                <td>${producto.nombre}</td>
                <td>${producto.categoria}</td>
                <td>$${producto.precio.toFixed(2)}</td>
                <td>${producto.stock}</td>
                <td>
                    <button class="btn btn-warning btn-sm" onclick="iniciarEdicion('${producto.id}')">
                        <i class="bi bi-pencil"></i> Editar
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="confirmarEliminar('${producto.id}')">
                        <i class="bi bi-trash"></i> Eliminar
                    </button>
                </td>
            </tr>
        `;
    });

    // 3. Cerrar el HTML de la tabla
    htmlTabla += `
            </tbody>
        </table>
    `;
    
    // Inyectar el HTML completo en el contenedor
    contenedor.innerHTML = htmlTabla;
}
// --- JS: app.js (Funciones de Lógica de Datos) ---

/**
 * Elimina un producto del array por su ID y actualiza localStorage.
 * @param {string} id - El ID único del producto a eliminar.
 */
function eliminarProducto(id) {
    let productos = obtenerProductos();
    
    // Filtrar el array para crear uno nuevo sin el producto cuyo ID coincide
    // Es decir, mantener todos los productos DONDE el ID es diferente al que queremos eliminar
    productos = productos.filter(producto => producto.id !== id);
    
    // Guardar el nuevo array (filtrado) en localStorage
    guardarProductos(productos);
}

// --- JS: app.js (Función de Interacción con SweetAlert) ---

/**
 * Muestra un cuadro de diálogo de confirmación antes de eliminar el producto.
 * @param {string} id - El ID del producto a eliminar.
 */
function confirmarEliminar(id) {
    Swal.fire({
        title: '¿Estás seguro?',
        text: "¡No podrás revertir esta acción!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, ¡Eliminar!',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            // Si el usuario confirma:
            eliminarProducto(id); // 1. Eliminar de LocalStorage
            cargarListadoProductos(); // 2. Recargar la tabla
            
            Swal.fire(
                '¡Eliminado!',
                'El producto ha sido eliminado correctamente.',
                'success'
            );
        }
    });
}

// --- JS: app.js (Funciones de Edición) ---

/**
 * Carga los datos de un producto al formulario para su edición.
 * @param {string} id - El ID del producto a editar.
 */
function iniciarEdicion(id) {
    const productos = obtenerProductos();
    // 1. Encontrar el producto por su ID
    const productoAEditar = productos.find(p => p.id === id);

    if (!productoAEditar) {
        Swal.fire('Error', 'Producto no encontrado para editar.', 'error');
        return;
    }

    // 2. Cargar los valores del producto en los campos del formulario
    document.getElementById('nombre').value = productoAEditar.nombre;
    document.getElementById('categoria').value = productoAEditar.categoria;
    document.getElementById('precio').value = productoAEditar.precio;
    document.getElementById('stock').value = productoAEditar.stock;
    document.getElementById('imagenUrl').value = productoAEditar.imagenUrl;
    
    // 3. Establecer el ID en el campo oculto
    document.getElementById('productoIdEditar').value = productoAEditar.id;

    // 4. Cambiar la apariencia del formulario para indicar que estamos editando
    document.getElementById('btn-submit-form').textContent = 'Guardar Cambios';
    document.getElementById('btn-submit-form').classList.remove('btn-primary');
    document.getElementById('btn-submit-form').classList.add('btn-success');
    
    // Opcional: Hacer scroll hasta el formulario para mejor UX
    document.getElementById('formulario-producto').scrollIntoView({ behavior: 'smooth' });
}

// --- JS: app.js (Actualización del Listener) ---

document.addEventListener('DOMContentLoaded', () => {
    // ... (Tu función cargarListadoProductos() debe estar aquí) ...
    // ... (Tu función confirmarEliminar() y eliminarProducto() deben estar aquí) ...

    const formulario = document.getElementById('formulario-producto');

    if (formulario) {
        formulario.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // 1. Capturar todos los valores (igual que en el registro)
            const idEditar = document.getElementById('productoIdEditar').value;
            const nombre = document.getElementById('nombre').value.trim();
            const categoria = document.getElementById('categoria').value.trim();
            const precio = parseFloat(document.getElementById('precio').value);
            const stock = parseInt(document.getElementById('stock').value);
            const imagenUrl = document.getElementById('imagenUrl').value.trim();

            // 2. Validación (igual que en el registro)
            if (!nombre || !categoria || isNaN(precio) || isNaN(stock) || precio <= 0 || stock <= 0) {
                 Swal.fire('Error', 'Por favor, complete y revise todos los campos (valores deben ser positivos).', 'error');
                 return;
            }

            const productoData = { nombre, categoria, precio, stock, imagenUrl };

            // 3. DECISIÓN: REGISTRO o EDICIÓN
            if (idEditar) {
                // Hay un ID: ¡ESTAMOS EDITANDO!
                actualizarProducto(idEditar, productoData);
                Swal.fire('Éxito', '¡Producto actualizado correctamente!', 'success');
            } else {
                // No hay ID: ¡ESTAMOS REGISTRANDO!
                registrarProducto(productoData); // Reutilizamos la función de registro
                Swal.fire({ icon: 'success', title: '¡Producto Registrado!', timer: 1500 });
            }
            
            // 4. Limpieza y Actualización
            limpiarFormulario(formulario); // Función de apoyo que crearemos a continuación
            cargarListadoProductos(); 
        });
    }

    cargarListadoProductos();
});

// Función auxiliar para limpiar y resetear el modo Edición
function limpiarFormulario(form) {
    form.reset();
    document.getElementById('productoIdEditar').value = ''; // Quitar el ID de edición
    document.getElementById('btn-submit-form').textContent = 'Registrar Producto';
    document.getElementById('btn-submit-form').classList.remove('btn-success');
    document.getElementById('btn-submit-form').classList.add('btn-primary');
}

// --- JS: app.js (Función de Lógica de Datos) ---

/**
 * Encuentra un producto por ID y actualiza sus datos.
 * @param {string} id - El ID del producto a actualizar.
 * @param {Object} nuevosDatos - Los datos actualizados del producto (sin el ID).
 */
function actualizarProducto(id, nuevosDatos) {
    let productos = obtenerProductos();
    
    // 1. Encontrar el índice del producto
    const indice = productos.findIndex(p => p.id === id);

    if (indice !== -1) {
        // 2. Mantener el ID original y fusionar los nuevos datos
        productos[indice] = {
            id: id,
            ...nuevosDatos // Esto copia nombre, categoria, precio, stock, etc.
        };
        
        // 3. Guardar el array modificado
        guardarProductos(productos);
    }
}



// 4. Llamar a la función al cargar la página y después de registrar un producto
document.addEventListener('DOMContentLoaded', () => {
    // ... (Tu lógica de registro de formulario debe estar aquí) ...

    // Cargar la lista al inicio
    cargarListadoProductos(); 

    // Modificar la función de registro para que recargue la lista:
    /* formulario.addEventListener('submit', (e) => {
        // ... (Tu lógica de validación y registro) ...
        
        registrarProducto(nuevoProducto);

        // Notificación de éxito
        // ...
        
        formulario.reset();
        
        // **¡Nueva llamada para actualizar la lista!**
        cargarListadoProductos(); 
    });
    */
});