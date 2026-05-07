import { useState } from "react";

import "./assets/styles.css";

import Sidebar from "./components/Sidebar";


import Lotes from "./pages/Lotes";
import Bodegas from "./pages/Bodegas";
import Localidades from "./pages/Localidades";

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