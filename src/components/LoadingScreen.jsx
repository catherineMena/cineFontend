import { FaSpinner } from "react-icons/fa"

const LoadingScreen = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="text-center">
        <FaSpinner className="animate-spin text-4xl text-blue-600 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-700">Cargando...</h2>
      </div>
    </div>
  )
}

export default LoadingScreen
