import { NavLink } from "react-router-dom"
import { FaTachometerAlt, FaFilm, FaUsers } from "react-icons/fa"

const Sidebar = () => {
  const menuItems = [
    { path: "/admin", icon: <FaTachometerAlt />, label: "Dashboard" },
    { path: "/admin/cinema-rooms", icon: <FaFilm />, label: "Salas de Cine" },
    { path: "/admin/users", icon: <FaUsers />, label: "Usuarios" },
  ]

  return (
    <aside className="w-64 bg-gray-800 text-white min-h-screen">
      <div className="p-4">
        <h2 className="text-xl font-bold mb-6 border-b border-gray-700 pb-2">Panel de Administración</h2>
        <nav>
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center p-3 rounded-lg transition-colors ${
                      isActive ? "bg-blue-700 text-white" : "text-gray-300 hover:bg-gray-700"
                    }`
                  }
                  end={item.path === "/admin"}
                >
                  <span className="mr-3">{item.icon}</span>
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </aside>
  )
}

export default Sidebar
