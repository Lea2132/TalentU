import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";

function Admin() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [comments, setComments] = useState([]);

  const fetchData = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const resUsers = await axios.get("http://localhost:3000/api/users", { headers });
      const resProducts = await axios.get("http://localhost:3000/api/allproducts");
      setUsers(resUsers.data);
      setProducts(resProducts.data);
    } catch (error) {
      console.error("Error al obtener datos:", error);
    }

    try {
      const token = localStorage.getItem("token");
      const resComments = await axios.get("http://localhost:3000/api/admin/comments", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      setComments(resComments.data);
    } catch (error) {
      console.error("Error al obtener comentarios:", error);
    }
  }, []);

  useEffect(() => {
    if (localStorage.getItem("isAdmin") !== "true") {
      navigate("/home", { replace: true });
      return;
    }
    fetchData();
  }, [fetchData, navigate]);

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
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:3000/api/users/${id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      Swal.fire("Eliminado", "Usuario eliminado correctamente", "success");
      fetchData();
    } catch {
      Swal.fire("Error", "No se pudo eliminar el usuario", "error");
    }
  };

  const deleteProduct = async (id) => {
    const confirm = await Swal.fire({
      title: "¿Eliminar servicio?",
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
      Swal.fire("Eliminado", "Servicio eliminado correctamente", "success");
      fetchData();
    } catch {
      Swal.fire("Error", "No se pudo eliminar el servicio", "error");
    }
  };

  const deleteComment = async (id) => {
    const confirm = await Swal.fire({
      title: "¿Eliminar comentario?",
      text: "Esta acción no se puede deshacer",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#d33",
    });
    if (!confirm.isConfirmed) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:3000/api/admin/comments/${id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      setComments((current) => current.filter((comment) => comment.id !== id));
      Swal.fire("Eliminado", "Comentario eliminado correctamente", "success");
    } catch (error) {
      console.error("Error al eliminar comentario:", error);
      Swal.fire("Error", "No se pudo eliminar el comentario", "error");
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

      {/* Servicios */}
      <section className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-2xl font-semibold mb-4 text-blue-600">Servicios publicados</h2>
        <div className="overflow-x-auto">
          <table className="w-full border border-gray-300">
            <thead className="bg-blue-200">
              <tr>
                <th className="p-2">ID</th>
                <th className="p-2">Título</th>
                <th className="p-2">Categoría</th>
                <th className="p-2">Tarifa</th>
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

      {/* Comentarios */}
      <section className="mt-12 bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-2xl font-semibold mb-4 text-blue-600">Comentarios de la comunidad</h2>
        <div className="overflow-x-auto">
          <table className="w-full border border-gray-300">
            <thead className="bg-blue-200">
              <tr>
                <th className="p-2">Usuario</th>
                <th className="p-2">Servicio</th>
                <th className="p-2">Comentario</th>
                <th className="p-2">Fecha</th>
                <th className="p-2">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {comments.map((comment) => (
                <tr key={comment.id} className="border-t text-center">
                  <td className="p-2">{comment.user_name}</td>
                  <td className="p-2">{comment.product_title}</td>
                  <td className="p-2 text-left whitespace-pre-wrap">{comment.text}</td>
                  <td className="p-2">
                    {new Date(comment.created_at).toLocaleDateString()}
                  </td>
                  <td className="p-2">
                    <button
                      onClick={() => deleteComment(comment.id)}
                      className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 transition-all"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
              {comments.length === 0 && (
                <tr>
                  <td colSpan="5" className="p-4 text-center text-gray-500">
                    No hay comentarios registrados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default Admin;
