import { noticias } from "../constants/const";

const Notices = () => {
  return (
    <div className="min-h-screen bg-white">
      <header className="bg-blue-700 text-white py-4">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold animate-fade-right animate-duration-[2000ms] animate-delay-2000ms]">Noticias Tecnologico De Antioquia (TDEA)</h1>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        <h2 className="text-4xl font-bold text-blue-700 mb-8 animate-fade-right animate-duration-[2000ms] animate-delay-[2000ms]">
          Noticias Universitarias
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-up animate-duration-[2000ms] animate-delay-[2000ms]">
          {noticias.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-lg shadow-md overflow-hidden"
            >
              <img
                src={item.imagen}
                alt={item.titulo}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h3 className="text-xl font-semibold text-blue-700 mb-2">
                  {item.titulo}
                </h3>
                <p className="text-gray-600 mb-4">{item.descripcion}</p>
                <button className="bg-blue-700 hover:bg-blue-800 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out">
                  Leer más
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Notices;
