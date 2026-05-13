function Sidebar({ setVista }) {

  return (
    <aside className="sidebar">

      <h2>Menú</h2>

      <ul className="menu">

        {/* ADMINISTRATIVO */}
        <li className="menu-item">
          Administrativo
          <ul>
            <li onClick={() => setVista("lotes")}>
              Lotes
            </li>
            <li onClick={() => setVista("bodegas")}>
              Bodegas
            </li>
      			<li onClick={() => setVista("localidades")}>
              Localidades
            </li>
      			<li onClick={() => setVista("inventarios")}>
              Inventarios
            </li>
      			<li onClick={() => setVista("clientes")}>
              Clientes
            </li>
          </ul>
        </li>

        {/* CONTROLES */}
        <li className="menu-item">
          Controles
          <ul>
            <li onClick={() => setVista("controlAlimento")}>
              Control de Alimento
            </li>
            <li onClick={() => setVista("controlPesoAves")}>
              Control de Peso en Aves
            </li>
      			<li onClick={() => setVista("controlPesoHuevos")}>
              Control de Peso en Huevos
            </li>
          </ul>
        </li>



      </ul>

    </aside>
  );
}

export default Sidebar;