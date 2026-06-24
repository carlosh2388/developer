function Sidebar({ setVista }) {

  return (
    <aside className="sidebar">

      <h2>Menú</h2>

      <ul className="menu">

        {/* CONFIGURACION */}
        <li className="menu-item">
          Configuración del Sistema
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
      			<li onClick={() => setVista("productos")}>
              Productos
            </li>
      			<li onClick={() => setVista("clientes")}>
              Clientes
            </li>
            <li>
              Usuarios
            </li>
          </ul>
        </li>

        {/* CONTROLES */}
        <li className="menu-item">
          Controles
          <ul>
            <li onClick={() => setVista("controlPesoAves")}>
              Control de Peso en Aves
            </li>
      			<li onClick={() => setVista("controlPesoHuevos")}>
              Control de Peso en Huevos
            </li>
          </ul>
        </li>

        {/* MOVIMIENTOS */}
        <li className="menu-item">
          Movimientos
          <ul>
            <li onClick={() => setVista("IngresoAlimento")}>
              Ingreso de Alimento
            </li>
            <li onClick={() => setVista("EgresoAlimento")}>
              Egreso de Alimento
            </li>
            <li onClick={() => setVista("ingresoHuevos")}>
              Ingreso de Huevos
            </li>
            <li onClick={() => setVista("egresoHuevos")}>
              Egreso de Huevos
            </li>
            <li onClick={() => setVista("IngresoInsumos")}>
              Ingreso de Insumos
            </li>
            <li onClick={() => setVista("EgresoInsumos")}>                
              Egreso de Insumos
            </li>
            <li>
            <li onClick={() => setVista("AjustesEntrada")}> 
              Ajustes de Entrada
            </li>
            <li>
              Ajustes de Salida
            </li>
                
      			<li onClick={() => setVista("EgresoReproductores")}>
              Egreso de Reproductores
            </li>
          </ul>
        </li>

        {/* REPORTERIA */}
        <li className="menu-item">
          Reportería
          <ul>
              Dashboard Gerencial
          </ul>
        </li>

      </ul>

    </aside>
  );
}

export default Sidebar;
