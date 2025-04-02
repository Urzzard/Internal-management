import React from 'react';
import { BaseLayout } from '../../../components/layout/BaseLayout';

/* import styles from './Admin-Personal.css'; */

export function AdminPersonal(){

    return(
        <BaseLayout breadcrumbs={[
            {label: 'INICIO', path: '/inicio'},
            {label: 'PERSONAL', path: '/personal'},
            {label: 'ADMINISTRACION DEL PERSONAL', path: '/admin-personal'}
        ]}>

        <a href='' className='adm-staff'>
            <h2>ADMINISTRACION DE STAFF</h2>
        </a>
        <a href='' className='adm-gremio'>
            <h2>ADMINISTRACION DE GREMIO</h2>
        </a>
        <a href='' className='adm-rango'>
            <h2>ADMINISTRACION DE RANGO</h2>
        </a>
        <a href='' className='adm-pcampo'>
            <h2>ADMINISTRACION DE PERSONAL DE CAMPO</h2>
        </a>

        </BaseLayout>
    )
}