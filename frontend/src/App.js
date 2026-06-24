import { useState } from "react";

import "./assets/styles.css";

import Sidebar from "./components/Sidebar";


import Lotes from "./pages/Lotes";
import Bodegas from "./pages/Bodegas";
import Localidades from "./pages/Localidades";
import Productos from "./pages/Productos";
import Clientes from "./pages/Clientes";


import ControlPesoAves from "./pages/ControlPesoAves";
import ControlPesoHuevos from "./pages/ControlPesoHuevos";

import IngresoAlimento from "./pages/IngresoAlimento";
import EgresoAlimento from "./pages/EgresoAlimento";
import IngresoHuevos from "./pages/IngresoHuevos";
import EgresoHuevos from "./pages/EgresoHuevos";
import IngresoInsumos from "./pages/IngresoInsumos";
import EgresoInsumos from "./pages/EgresoInsumos";
import AjustesEntrada from "./pages/AjustesEntrada";
import EgresoReproductores from "./pages/EgresoReproductores";

function App() {

  const [vista, setVista] = useState("inicio");

  const renderVista = () => {

    switch(vista) {

      case "lotes":
        return <Lotes />;
	
	  case "localidades":
        return <Localidades />;
			
      case "bodegas":
        return <Bodegas />;

	  case "productos":
        return <Productos />;
        
	  case "clientes":
        return <Clientes />;

      case "controlPesoAves":
        return <ControlPesoAves />;

      case "controlPesoHuevos":
        return <ControlPesoHuevos />;
      
	  case "IngresoAlimento":
        return <IngresoAlimento />;

	   case "EgresoAlimento":
        return <EgresoAlimento />;
			
	  case "ingresoHuevos":
        return <IngresoHuevos />;

      case "egresoHuevos":
        return <EgresoHuevos />;

		case "IngresoInsumos":
        return <IngresoInsumos />;
			
		case "EgresoInsumos":
        return <EgresoInsumos />;
			
      case "AjustesEntrada":
        return <AjustesEntrada />;
			
      case "EgresoReproductores":
        return <EgresoReproductores />;

      case "AjustesEntrada":
        return <AjustesEntrada />;
     			
      default:
        return <h1>Bienvenido</h1>;
    }
  };

  return (

    <div className="container">

      <Sidebar setVista={setVista} />

      <main id="content">

        {renderVista()}

      </main>

    </div>
  );
}

export default App;
