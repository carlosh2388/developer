{/* VARIEDAD Y GALERA EN LA MISMA LÍNEA */}
<div style={styles.row}>

  {/* VARIEDAD */}
  <div style={styles.field}>

    <label>Variedad</label>

    <div style={styles.row}>

      <select
        value={variedad}
        onChange={(e) =>
          setVariedad(e.target.value)
        }
        style={{
          ...styles.input,
          flex: 1
        }}
      >

        <option value="">
          Seleccione
        </option>

        {variedades.map((v, index) => (

          <option
            key={index}
            value={v}
          >
            {v}
          </option>

        ))}

      </select>

      {mostrarNuevaVariedad && (

        <input
          type="text"
          placeholder="Nueva variedad"
          value={nuevaVariedad}
          onChange={(e) =>
            setNuevaVariedad(e.target.value)
          }
          style={{
            ...styles.input,
            flex: 1
          }}
        />

      )}

      <button
        type="button"
        onClick={() => {

          if (mostrarNuevaVariedad) {

            agregarVariedad();

          } else {

            setMostrarNuevaVariedad(true);
          }
        }}
        style={styles.addButton}
      >
        +
      </button>

    </div>

  </div>

  {/* GALERA */}
  <div style={styles.field}>

    <label>Galera</label>

    <div style={styles.row}>

      <select
        value={galera}
        onChange={(e) =>
          setGalera(e.target.value)
        }
        style={{
          ...styles.input,
          flex: 1
        }}
      >

        <option value="">
          Seleccione
        </option>

        {galeras.map((g, index) => (

          <option
            key={index}
            value={g}
          >
            {g}
          </option>

        ))}

      </select>

      {mostrarNuevaGalera && (

        <input
          type="text"
          placeholder="Nueva galera"
          value={nuevaGalera}
          onChange={(e) =>
            setNuevaGalera(e.target.value)
          }
          style={{
            ...styles.input,
            flex: 1
          }}
        />

      )}

      <button
        type="button"
        onClick={() => {

          if (mostrarNuevaGalera) {

            agregarGalera();

          } else {

            setMostrarNuevaGalera(true);
          }
        }}
        style={styles.addButton}
      >
        +
      </button>

    </div>

  </div>

</div>