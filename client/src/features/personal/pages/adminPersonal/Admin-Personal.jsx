import React from 'react';
import { BaseLayout } from '../../../../components/layout/BaseLayout';
import styles from './Admin-Personal.module.css';
import { useAuth } from '../../../../context/AuthContext';

export function AdminPersonal(){

    const {user} = useAuth();

    return(
        <BaseLayout breadcrumbs={[
            {label: 'INICIO', path: '/inicio'},
            {label: 'PERSONAL', path: '/personal'},
            {label: 'ADMINISTRACION DEL PERSONAL', path: '/admin-personal'}
        ]}>
            {user.is_superuser &&(
                <div className={styles.adminbox}>
                    <a href='/crud-staff' className={styles.adminlink}>
                        <h2>ADMINISTRACION DE STAFF</h2>
                    </a>
                    <a href='/crud-users' className={styles.adminlink}>
                        <h2>ADMINISTRACION DE USUARIOS</h2>
                    </a>
                    <a href='/crud-gremio' className={styles.adminlink}>
                        <h2>ADMINISTRACION DE GREMIO</h2>
                    </a>
                    <a href='/crud-rango' className={styles.adminlink}>
                        <h2>ADMINISTRACION DE RANGO</h2>
                    </a>
                    <a href='/crud-pcampo' className={styles.adminlink}>
                        <h2>ADMINISTRACION DE PERSONAL DE CAMPO</h2>
                    </a>
                    
                </div>
            )}
            
            <div className={styles.adminlist}>
                <div className={styles.adminlistsubtittle}>
                    <h2>
                        LISTA POR CLASIFICACION DE PERSONAL
                    </h2>
                </div>
                <div className={styles.personallist}>
                    <h3>PERSONAL TÉCNICO O STAFF</h3>
                    <table className='min-w-full'>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>NOMBRE</th>
                                <th>APELLIDO</th>
                                <th>DNI</th>
                                <th>FECHA DE INGESO</th>
                                <th>ESTADO</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td></td>
                            </tr>
                        </tbody>

                    </table>
                </div>

                <div className={styles.personallist}>
                    <h3>PERSONAL DE CAMPO</h3>
                    <table className='min-w-full'>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>NOMBRE</th>
                                <th>APELLIDO</th>
                                <th>DNI</th>
                                <th>FECHA DE INGESO</th>
                                <th>ESTADO</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td></td>
                            </tr>
                        </tbody>

                    </table>
                </div>
                
            </div>

        </BaseLayout>
    )
}