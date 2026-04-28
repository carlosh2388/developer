// Función para cargar vistas HTML dentro del <main>
async function loadView(view) {

  // Selecciona el contenedor principal
  const content = document.getElementById("content");

  try {
    // Hace una petición al archivo HTML de la vista
    const res = await fetch(`views/${view}.html`);

    // Convierte la respuesta en texto HTML
    const html = await res.text();

    // Inserta el HTML en el contenedor
    content.innerHTML = html;

  } catch (error) {

    // Manejo de error si no existe la vista
    content.innerHTML = "<h2>Error cargando vista</h2>";
  }
}