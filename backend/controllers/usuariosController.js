const obtenerUsuarios = (req, res) => {

  const usuarios = [
    { nombre: "Admin", rol: "Administrador" },
    { nombre: "Juan", rol: "Operador" }
  ];

  res.json(usuarios);
};

module.exports = {
  obtenerUsuarios
};






