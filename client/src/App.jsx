import {BrowserRouter, Routes, Route, Navigate, useLocation} from "react-router-dom"
import { Login } from "./features/login/pages/Login";
import { Footer } from "./components/footer/Footer";
import { Inicio } from "./features/Inicio";
import { Navegacion } from "./components/navbar/Navegacion";
import { Inventario } from "./features/inventario/pages/Inventario";
import { CrudCategoria } from "./features/inventario/pages/Crud-Categoria";
import { CrudMaterial } from "./features/inventario/pages/Crud-Materiales";
import { CrudRegistroMat } from "./features/inventario/pages/Crud-Registro-Mat";
import { Toaster } from "react-hot-toast"
import { Personal } from "./features/personal/pages/Personal";
import { CrudPersonal } from "./features/personal/pages/crudPersonal/Crud-Personal";
import { AdminPersonal } from "./features/personal/pages/adminPersonal/Admin-Personal";
import { CrudGremio } from "./features/personal/pages/adminPersonal/gremio/CrudGremio";
import { CrudRango } from "./features/personal/pages/adminPersonal/rango/CrudRango";
import { CrudStaff } from "./features/personal/pages/adminPersonal/staff/CrudStaff";
import { CrudUsers } from "./features/personal/pages/adminPersonal/usuarios/CrudUsers";
import { CrudPcampo } from "./features/personal/pages/adminPersonal/pcampo/CrudPcampo";
import { AuthProvider } from "./context/AuthContext";
import { PrivateRoute } from "./components/PrivateRoute";
import AxiosInterceptor from "./components/AxiosInterceptor";
import { RegistroTareoDiario } from "./features/personal/pages/ControlAsistencia/RegistroTareoDiario";
import { CrudHorarioTrabajo } from "./features/personal/pages/adminPersonal/horarios/CrudHorarioTrabajo";

function App(){
  return(
    
    <BrowserRouter>
      <AuthProvider>
        <AxiosInterceptor>
          <Content />
        </AxiosInterceptor>
      </AuthProvider> 
    </BrowserRouter>
    
  );
}

function Content(){
  const location = useLocation();
  const showNav = ["/inicio", "/inventario", "/crud-categoria", "/crud-material", "/crud-registro-mat", "/personal", "/crud-personal", "/admin-personal", "/crud-gremio", "/crud-rango", "/crud-staff", "/crud-users", "/crud-pcampo", "/tareo-personal", "/horario-trabajo"].includes(location.pathname);

  return(
      <>
        <Toaster/>
        {showNav && <Navegacion/>}
        <div className="content-wrapper">
            <Routes>
                <Route path="/" element={<Navigate to="/login"/>} />
                <Route path="/login" element={<Login/>} />
                <Route path="/inicio" element={<PrivateRoute><Inicio/></PrivateRoute>} />
                <Route path="/inventario" element= {<PrivateRoute adminOnly><Inventario/></PrivateRoute>} />
                <Route path="/crud-categoria" element= {<PrivateRoute><CrudCategoria/></PrivateRoute>} />
                <Route path="/crud-material" element={<PrivateRoute><CrudMaterial/></PrivateRoute>} />
                <Route path="/crud-registro-mat" element={<PrivateRoute><CrudRegistroMat/></PrivateRoute>}/>
                <Route path="/personal" element={<PrivateRoute /* adminOnly */><Personal/></PrivateRoute>}/>
                <Route path="/crud-personal" element={<PrivateRoute><CrudPersonal/></PrivateRoute>}/>
                <Route path="/admin-personal" element={<PrivateRoute><AdminPersonal/></PrivateRoute>}/>
                <Route path="/crud-gremio" element={<PrivateRoute><CrudGremio/></PrivateRoute>}/>
                <Route path="/crud-rango" element={<PrivateRoute><CrudRango/></PrivateRoute>}/>
                <Route path="/crud-staff" element={<PrivateRoute><CrudStaff/></PrivateRoute>}/>
                <Route path="/crud-users" element={<PrivateRoute><CrudUsers/></PrivateRoute>}/>
                <Route path="/crud-pcampo" element={<PrivateRoute><CrudPcampo/></PrivateRoute>}/>
                <Route path="/tareo-personal" element={<PrivateRoute><RegistroTareoDiario/></PrivateRoute>}/>
                <Route path="/horario-trabajo" element={<PrivateRoute><CrudHorarioTrabajo/></PrivateRoute>}/>
            </Routes>
        </div>
          <Footer/>
      </>
  );
}

  


export default App
