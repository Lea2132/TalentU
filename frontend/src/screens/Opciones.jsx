import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faHeartbeat, faWallet, faGlobe, faBriefcase } from '@fortawesome/free-solid-svg-icons';

const Opciones = () => {
  return (
    <div className="flex flex-col items-center justify-center p-6 bg-blue-100 min-h-screen">
      <h2 className="text-4xl font-bold text-blue-600 mb-2 text-center animate-fade-down animate-once animate-duration-1000 animate-delay-1000">Opciones Universitarias</h2>
      <p className="text-lg text-gray-700 mb-6 text-center max-w-2xl animate-fade-down animate-once animate-duration-1000 animate-delay-1000">
        Explora las diferentes opciones que la universidad ofrece para potenciar tu experiencia academica y personal 
        Cada opcion esta diseñada para apoyarte en diferentes aspectos de tu vida universitaria
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-6xl animated-opciones">
        {/* Atencion */}
            <div className="flex flex-col items-center p-6 bg-white border border-blue-300 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 transform hover:scale-105">
          <FontAwesomeIcon icon={faUser} size="3x" className="text-blue-500 mb-4" />
          <span className="text-center font-semibold text-xl">Atencion</span>
          <p className="text-center text-gray-600 mt-2">
            Servicio integral de asesoria academica y personal Te ayudamos a 
            definir tu camino universitario, ofreciendo consultas sobre cursos 
            y orientacion vocacional
          </p>
        </div>
        
        {/* Bienestar */}
            <div className="flex flex-col items-center p-6 bg-white border border-blue-300 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 transform hover:scale-105">
          <FontAwesomeIcon icon={faHeartbeat} size="3x" className="text-blue-500 mb-4" />
          <span className="text-center font-semibold text-xl">Bienestar</span>
          <p className="text-center text-gray-600 mt-2">
            Programas de salud integral que incluyen servicios psicologicos, 
            talleres de meditacion, y actividades recreativas para mejorar 
            tu calidad de vida en la universidad
          </p>
        </div>
        
        {/* Financiero */}
            <div className="flex flex-col items-center p-6 bg-white border border-blue-300 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 transform hover:scale-105">
          <FontAwesomeIcon icon={faWallet} size="3x" className="text-blue-500 mb-4" />
          <span className="text-center font-semibold text-xl">Financiero</span>
          <p className="text-center text-gray-600 mt-2">
            Ofrecemos informacion sobre becas, ayudas financieras y opciones 
            de pago Brindamos asesoria para una mejor gestion de tus 
            finanzas durante tu etapa estudiantil
          </p>
        </div>
        
        {/* Internacionalizacion */}
            <div className="flex flex-col items-center p-6 bg-white border border-blue-300 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 transform hover:scale-105">
          <FontAwesomeIcon icon={faGlobe} size="3x" className="text-blue-500 mb-4" />
          <span className="text-center font-semibold text-xl">Internacionalizacion</span>
          <p className="text-center text-gray-600 mt-2">
            Explora oportunidades de intercambio academico y programas de 
            estudios en el extranjero Te asesoramos sobre visas y becas 
            internacionales para ampliar tus horizontes
          </p>
        </div>
        
        {/* Ofertas Laborales */}
            <div className="flex flex-col items-center p-6 bg-white border border-blue-300 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 transform hover:scale-105">
          <FontAwesomeIcon icon={faBriefcase} size="3x" className="text-blue-500 mb-4" />
          <span className="text-center font-semibold text-xl">Ofertas Laborales</span>
          <p className="text-center text-gray-600 mt-2">
            Accede a una amplia variedad de ofertas de empleo, pasantias y 
            practicas profesionales Conectamos a estudiantes con empresas 
            para impulsar su carrera profesional
          </p>
        </div>
      </div>
    </div>
  );
};

export default Opciones;
