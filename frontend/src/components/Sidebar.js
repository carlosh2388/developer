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
          </ul>
        </li>

        {/* GRANJA */}
        <li className="menu-item">
		  Granja Reproductora

		  <ul className="submenu">
			<li className="submenu-item">
			  Controles

			  <ul className="submenu submenu-level-2">
				<li className="submenu-item">Alimento</li>
			  </ul>
			
			</li>
		  </ul>
		</li>

      </ul>

    </aside>
  );
}

export default Sidebar;