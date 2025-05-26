import addpersonal from '../../../assets/personal/agregar-usuario.png'
import apersonal from '../../../assets/personal/padmin2.png'
import tareo from '../../../assets/personal/tareo.png'
import { BaseLayout } from '../../../components/layout/BaseLayout'
import { BoxMenu } from '../../../components/boxmenu/BoxMenu'


export function Personal(){

    const menuOptions = [
        {
            tittle: 'GESTIÓN DE DATOS DE PERSONAL',
            icon: addpersonal,
            path: '/crud-personal'
        },
        {
            tittle: 'ADMINISTRACION DE PERSONAL',
            icon: apersonal,
            path: '/admin-personal'
        },
        {
            tittle: 'REGISTRO DE TAREO DIARIO',
            icon: tareo,
            path: '/tareo-personal'
        }
    ]

    return(
        <BaseLayout breadcrumbs={[
            {label: 'INICIO', path: '/inicio'},
            {label: 'PERSONAL', path: '/personal'},
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