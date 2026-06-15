import { useState } from "react";

import "./assets/styles.css";

import Sidebar from "./components/Sidebar";


import Lotes from "./pages/Lotes";
import Bodegas from "./pages/Bodegas";
import Localidades from "./pages/Localidades";
import Productos from "./pages/Productos";
import Clientes from "./pages/Clientes";

import ControlAlimento from "./pages/ControlAlimento";
import ControlPesoAves from "./pages/ControlPesoAves";
import ControlPesoHuevos from "./pages/ControlPesoHuevos";

import IngresoHuevos from "./pages/IngresoHuevos";
import EgresoHuevos from "./pages/EgresoHuevos";
import Traslados from "./pages/Traslados";

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

	  case "controlAlimento":
        return <ControlAlimento />;

      case "controlPesoAves":
        return <ControlPesoAves />;

      case "controlPesoHuevos":
        return <ControlPesoHuevos />;
      
	  case "ingresoHuevos":
        return <IngresoHuevos />;

      case "egresoHuevos":
        return <EgresoHuevos />;

      case "traslados":
        return <Traslados />;
      

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
