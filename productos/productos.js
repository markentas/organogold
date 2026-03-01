const PRODUCTOS_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRwK7lphThsdDj4LSo-YsCh8vv9UPKQj8Xk85ppsPSpWnfWb0pHWH1XFQve4dbp_mjpolLuxqL0q9wi/pub?output=csv';
function renderizarProductos(productos) {
    const grid = document.getElementById('productosGrid');
    
    if (!grid) {
        console.error('No se encontró el elemento productosGrid');
        return;
    }
    
    const hayDisponibles = productos.some(p => p.cantidad > 0);
    
    if (!hayDisponibles) {
        grid.innerHTML = `
            <div class="disponibles-mensaje">
                <i class="fas fa-coffee"></i>
                <span class="disponibles-mensaje-leyenda">Próximamente tendremos cafés disponibles.</span>
                <p>Enterate de las novedades<br>contactános por WhatsApp.</p>
                <a href="https://wa.me/5493873407054?text=Hola%2C%20quiero%20informaci%C3%B3n" target="_blank" class="producto-btn">CONTACTAR</a>
            </div>
        `;
        return;
    }
    
    grid.innerHTML = productos.map((producto) => {
        const cantidad = parseInt(producto.cantidad) || 0;
        const esAgotado = cantidad === 0;
        const mensajeWhatsApp = `Hola%2C%20quiero%20pedir%20${encodeURIComponent(producto.nombre)}`;
        
        const imagenSrc = (producto.imagen && (producto.imagen.startsWith('http') || producto.imagen.startsWith('https')))
            ? producto.imagen 
            : `productos/img/${producto.imagen}`;
        
        const precioNumero = parseInt(producto.precio) || 0;
        const precioFormateado = precioNumero > 0 ? '$' + precioNumero.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') : producto.precio;
        
        return `
            <div class="producto-card ${esAgotado ? 'agotado' : ''}">
                <img src="${imagenSrc}" alt="${producto.nombre}" class="producto-imagen">
                <div class="producto-info">
                    <h3 class="producto-nombre">${producto.nombre}</h3>
                    <p class="producto-precio">${precioFormateado}</p>
                    ${esAgotado 
                        ? '<span class="producto-agotado-badge">AGOTADO</span>' 
                        : `<div class="producto-disponibles">Disponible: ${cantidad}</div>
                           <a href="https://wa.me/5493873407054?text=${mensajeWhatsApp}" target="_blank" class="producto-btn">PEDIR</a>`
                    }
                </div>
            </div>
        `;
    }).join('');
}

async function cargarProductos() {
    try {
        const response = await fetch(PRODUCTOS_CSV_URL);
        const csvText = await response.text();
        
        const textoNormalizado = csvText.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
        let lineas = textoNormalizado.trim().split('\n');
        
        if (lineas.length === 1 && lineas[0].includes(',')) {
            const partes = lineas[0].split(',');
            if (partes.length > 4) {
                const header = partes.slice(0, 4).join(',');
                const data = partes.slice(4).join(',');
                lineas = [header, data];
            }
        }
        
        const esHeader = lineas[0]?.toLowerCase().includes('nombre');
        const datos = esHeader ? lineas.slice(1) : lineas;
        
        const productos = datos.map(linea => {
            const [nombre, imagen, precio, cantidad] = linea.split(',');
            return {
                nombre: nombre?.trim() || '',
                imagen: imagen?.trim() || '',
                precio: precio?.trim() || '',
                cantidad: parseInt(cantidad?.trim()) || 0
            };
        });
        
        renderizarProductos(productos);
    } catch (error) {
        console.error('Error cargando productos:', error);
        const grid = document.getElementById('productosGrid');
        if (grid) {
            grid.innerHTML = '<p style="text-align:center;color:#888;">Error al cargar productos</p>';
        }
    }
}

document.addEventListener('DOMContentLoaded', cargarProductos);
