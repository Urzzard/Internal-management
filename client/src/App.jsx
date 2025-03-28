import {BrowserRouter, Routes, Route, Navigate, useLocation} from "react-router-dom"
import { Login } from "./pages/Login";
import { Footer } from "./components/Footer";
import { Inicio } from "./pages/Inicio";
import { Navegacion } from "./components/Navegacion";
import { Inventario } from "./pages/Inventario/Inventario";
import { CrudCategoria } from "./pages/Inventario/Crud-Categoria";
import { CrudMaterial } from "./pages/Inventario/Crud-Materiales";
import { CrudRegistroMat } from "./pages/Inventario/Crud-Registro-Mat";
import { Toaster } from "react-hot-toast"
import { Personal } from "./pages/Personal/Personal";
import { CrudPersonal } from "./pages/Personal/Crud-Personal";

function App(){
  return(
    <BrowserRouter>
      <Content />
    </BrowserRouter>
  );
}

function Content(){
  const location = useLocation();
  const showNav = ["/inicio", "/inventario", "/crud-categoria", "/crud-material", "/crud-registro-mat", "/personal", "/crud-personal"].includes(location.pathname);

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
          </Routes>
       </div>
        <Footer/>
      </>
  );
}

  


export default App
