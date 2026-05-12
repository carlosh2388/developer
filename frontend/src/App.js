import { useState } from "react";

import "./assets/styles.css";

import Sidebar from "./components/Sidebar";


import Lotes from "./pages/Lotes";
import Bodegas from "./pages/Bodegas";
import Localidades from "./pages/Localidades";
import Inventarios from "./pages/Inventarios";
import Clientes from "./pages/Clientes";

function App() {

  const [vista, setVista] = useState("inicio");

  const renderVista = () => {

    switch(vista) {

      case "lotes":
        return <Lotes />;

      case "bodegas":
        return <Bodegas />;
	
	    case "localidades":
        return <Localidades />;

	    case "inventarios":
        return <Inventarios />;
        
	    case "clientes":
        return <Clientes />;
        
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