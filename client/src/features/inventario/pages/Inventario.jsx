import crudinventario from '../../../assets/inventario/agregar-producto.png'
import crudcategoria from '../../../assets/inventario/categorias.png'
import entradasalida from '../../../assets/inventario/registro-inventario.png'
import { BaseLayout } from '../../../components/layout/BaseLayout'
import { BoxMenu } from '../../../components/boxmenu/BoxMenu'
import './Inventario.css'

export function Inventario(){

    const menuOptions = [
            {
                tittle: 'CRUD CATEGORIAS DE MATERIALES',
                icon: crudcategoria,
                path: '/crud-categoria'
            },
            {
                tittle: 'CRUD MATERIALES',
                icon: crudinventario,
                path: '/crud-material'
            },
            {
                tittle: 'REGISTROS DE INGRESOS Y SALIDAS',
                icon: entradasalida,
                path: '/crud-registro-mat'
            }
        ]

    return(
        <BaseLayout breadcrumbs={[
            {label: 'INICIO', path: '/inicio'},
            {label: 'INVENTARIO', path: '/inventario'}
        ]}>
            {menuOptions.map((option) => (
                <BoxMenu
                    key={option.tittle}
                    tittle={option.tittle}
                    icon={option.icon}
                    path={option.path}
                />
            ))}
        </BaseLayout>
    )
}