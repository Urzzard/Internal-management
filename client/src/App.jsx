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

function App(){
  return(
    <BrowserRouter>
      <Content />
    </BrowserRouter>
  );
}

function Content(){
  const location = useLocation();
  const showNav = ["/inicio", "/inventario", "/crud-categoria", "/crud-material", "/crud-registro-mat", "/personal", "/crud-personal", "/admin-personal", "/crud-gremio", "/crud-rango", "/crud-staff"].includes(location.pathname);

  return(
      <>
      <Toaster/>
       {showNav && <Navegacion/>}
       <div className="content-wrapper">
          <Routes>
              <Route path="/" element={<Navigate to="/login"/>} />
              <Route path="/login" element={<Login/>} />
              <Route path="/inicio" element={<Inicio/>} />
              <Route path="/inventario" element= {<Inventario/>} />
              <Route path="/crud-categoria" element= {<CrudCategoria/>} />
              <Route path="/crud-material" element={<CrudMaterial/>} />
              <Route path="/crud-registro-mat" element={<CrudRegistroMat/>}/>
              <Route path="/personal" element={<Personal/>}/>
              <Route path="/crud-personal" element={<CrudPersonal/>}/>
              <Route path="/admin-personal" element={<AdminPersonal/>}/>
              <Route path="/crud-gremio" element={<CrudGremio/>}/>
              <Route path="/crud-rango" element={<CrudRango/>}/>
              <Route path="/crud-staff" element={<CrudStaff/>}/>
          </Routes>
       </div>
        <Footer/>
      </>
  );
}

  


export default App
