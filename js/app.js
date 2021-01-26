// Variables y Selectores
const formulario = document.querySelector("#agregar-gasto");
const gastoListado = document.querySelector("#gastos ul");
const fragment = new DocumentFragment();



// Eventos
eventListeners();
function eventListeners() {
    document.addEventListener("DOMContentLoaded", preguntarPresupuesto);

    formulario.addEventListener("submit", agregarGasto);
}



// Clases
class Presupuesto {
    constructor(presupuesto) {
        this.presupuesto = Number(presupuesto);
        this.restante = Number(presupuesto);
        this.gastos = [];
    }

    nuevoGasto(gasto) {
        this.gastos = [...this.gastos, gasto];
        this.calcularRestante();
    }

    calcularRestante() {
        const gastado = this.gastos.reduce( (total, gasto) => total + gasto.cantidad, 0 );
        this.restante = this.presupuesto - gastado;
    }

    eliminarGasto(id) {
        this.gastos = this.gastos.filter( gasto => gasto.id != id );
        this.calcularRestante();
    }
}

class UI {
    insertarPresupuesto(cantidad) {
        // Extrayendo el valor
        const { presupuesto, restante } = cantidad;

        // Agregando al html
        document.querySelector("#total").textContent = presupuesto; 
        document.querySelector("#restante").textContent = restante; 
    }

    imprimirAlerta(mensaje, tipo) {
        // crear el div
        const divAlerta = document.createElement("div"); 
        divAlerta.classList.add("text-center", "alert");

        if(tipo === "error") {
            if(document.querySelector('div .alert-danger')) {
                return;
            } else {
                divAlerta.classList.add('alert-danger');
            }
        } else {
            divAlerta.classList.add('alert-success');
        }

        // Agregar el mensaje al div
        divAlerta.textContent = mensaje;

        // Insertar en el HTML
        fragment.appendChild(divAlerta);
        document.querySelector(".primario").insertBefore(fragment, formulario);

        setTimeout(() => {
            divAlerta.remove();
        }, 3000);
    }

    mostrarGastos(gastos) {
        
        this.limpiarHTML();

        // Iterar sobre los gastos
        gastos.forEach(gasto => {
            
            const { cantidad, nombre, id } = gasto;

            // Crear un li
            const nuevoGasto = document.createElement("li");
            nuevoGasto.className = "list-group-item d-flex justify-content-between align-items-center";
            nuevoGasto.dataset.id = id;

            // Agregar el HTML del gasto
            nuevoGasto.innerHTML = `${nombre}<span class="badge badge-primary badge-pill">$${cantidad}</span>`;
            
            // Boton para eliminar el gasto
            const btnBorrar = document.createElement("button");
            btnBorrar.classList.add("btn", "btn-danger", "borrar-gasto");
            btnBorrar.innerHTML = "Borrar &times;";
            btnBorrar.onclick = () => {
                eliminarGasto(id);
            };
            nuevoGasto.appendChild(btnBorrar);
            
            // Agregar al HTML
            fragment.appendChild(nuevoGasto);
        });

        gastoListado.appendChild(fragment);
    }

    actualizarRestante(restante) {
        document.querySelector("#restante").textContent = restante; 
    }

    comprobarPresupuesto(presupuestoObj) {
        const { presupuesto, restante } = presupuestoObj;
        const restanteDiv = document.querySelector(".restante");

        // Comprobar 25%
        if( (presupuesto / 4) > restante ) {
            restanteDiv.classList.remove("alert-success", "alert-warning");
            restanteDiv.classList.add("alert-danger");

        } else if( (presupuesto / 2) > restante ) { // Comprobar 50%
            restanteDiv.classList.remove("alert-success", "alert-danger");
            restanteDiv.classList.add("alert-warning");
            
        } else {
            restanteDiv.classList.remove("alert-danger", "alert-warning");
            restanteDiv.classList.add("alert-success");

        }

        // Si total es menor a cero
        if( restante <= 0 ) {
            this.imprimirAlerta("El presupuesto se ha agotado", "error");

            formulario.querySelector("button[type='submit']").disabled = true;
        }
    }

    limpiarHTML() {
        gastoListado.textContent = "";
    }
}


// Instanciar
const ui = new UI();
let presupuesto; 


// Funciones
function preguntarPresupuesto() {
    const presupuestoUsuario = prompt('¿Cuál es tu presupuesto?');
    
    if(presupuestoUsuario === null ? true : presupuestoUsuario.trim() === "" || isNaN(presupuestoUsuario) || presupuestoUsuario <= 0) {
        window.location.reload();
    }

    presupuesto = new Presupuesto(presupuestoUsuario);

    ui.insertarPresupuesto(presupuesto);
}

function agregarGasto(evt) {
    evt.preventDefault();
    
    // Leer los datos del formulario
    const nombre = document.querySelector("#gasto").value.trim();
    const cantidad = Number(document.querySelector("#cantidad").value);

    if(nombre === "" || cantidad === "") {
        ui.imprimirAlerta("Ambos campos son obligatorios", "error");
        return;
        
    } else if(cantidad <= 0 || isNaN(cantidad)) {
        ui.imprimirAlerta("Cantidad no valida", "error");
        return;

    }

    // Generar un objeto con el gasto
    const gasto = { nombre, cantidad, id: Date.now() };

    presupuesto.nuevoGasto(gasto);

    // Mensaje de todo bien
    ui.imprimirAlerta("Gasto agregado correctamente");

    // Imprimir los gastos
    const { gastos, restante } = presupuesto;
    ui.mostrarGastos(gastos);

    ui.actualizarRestante(restante);

    ui.comprobarPresupuesto(presupuesto);

    // Reinicia el formulario
    formulario.reset();
}

function eliminarGasto(id) {
    presupuesto.eliminarGasto(id);
    const { gastos, restante } = presupuesto;
    ui.mostrarGastos(gastos);
    ui.actualizarRestante(restante);
    ui.comprobarPresupuesto(presupuesto);
}