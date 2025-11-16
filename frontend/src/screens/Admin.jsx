import { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";

function Admin() {
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const resUsers = await axios.get("http://localhost:3000/api/users");
      const resProducts = await axios.get("http://localhost:3000/api/allproducts");
      setUsers(resUsers.data);
      setProducts(resProducts.data);
    } catch (error) {
      console.error("Error al obtener datos:", error);
    }
  };

  const deleteUser = async (id) => {
    const confirm = await Swal.fire({
      title: "¿Eliminar usuario?",
      text: "Esta acción no se puede deshacer",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#d33",
    });
    if (!confirm.isConfirmed) return;

    try {
      await axios.delete(`http://localhost:3000/api/users/${id}`);
      Swal.fire("Eliminado", "Usuario eliminado correctamente", "success");
      fetchData();
    } catch (error) {
      Swal.fire("Error", "No se pudo eliminar el usuario", "error");
    }
  };

  const deleteProduct = async (id) => {
    const confirm = await Swal.fire({
      title: "¿Eliminar producto?",
      text: "Esta acción no se puede deshacer",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#d33",
    });
    if (!confirm.isConfirmed) return;

    try {
      await axios.delete(`http://localhost:3000/api/products/${id}`);
      Swal.fire("Eliminado", "Producto eliminado correctamente", "success");
      fetchData();
    } catch (error) {
      Swal.fire("Error", "No se pudo eliminar el producto", "error");
    }
  };

  return (
    <div className="min-h-screen bg-blue-50 p-8">
      <h1 className="text-4xl font-bold text-center mb-8 text-blue-700">
        Panel de Administrador
      </h1>

      {/* Usuarios */}
      <section className="mb-12 bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-2xl font-semibold mb-4 text-blue-600">Usuarios Registrados</h2>
        <div className="overflow-x-auto">
          <table className="w-full border border-gray-300">
            <thead className="bg-blue-200">
              <tr>
                <th className="p-2">ID</th>
                <th className="p-2">Nombre</th>
                <th className="p-2">Correo</th>
                <th className="p-2">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-t text-center">
                  <td className="p-2">{u.id}</td>
                  <td className="p-2">{u.name}</td>
                  <td className="p-2">{u.email}</td>
                  <td className="p-2">
                    <button
                      onClick={() => deleteUser(u.id)}
                      className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 transition-all"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Productos */}
      <section className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-2xl font-semibold mb-4 text-blue-600">Productos Publicados</h2>
        <div className="overflow-x-auto">
          <table className="w-full border border-gray-300">
            <thead className="bg-blue-200">
              <tr>
                <th className="p-2">ID</th>
                <th className="p-2">Título</th>
                <th className="p-2">Categoría</th>
                <th className="p-2">Precio</th>
                <th className="p-2">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-t text-center">
                  <td className="p-2">{p.id}</td>
                  <td className="p-2">{p.title}</td>
                  <td className="p-2">{p.category}</td>
                  <td className="p-2">${p.price}</td>
                  <td className="p-2">
                    <button
                      onClick={() => deleteProduct(p.id)}
                      className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 transition-all"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default Admin;
