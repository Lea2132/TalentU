/* eslint-disable react/prop-types */
const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex justify-center items-center z-50">
      <div className="bg-white shadow-lg rounded-lg w-96 p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
        >
          &times;
        </button>
        <h3 className="text-xl font-bold text-blue-700 mb-4">{title}</h3>
        {children}
      </div>
    </div>
  );
};

export default Modal;
