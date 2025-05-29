import React, { useState, useEffect } from 'react';
import { BaseLayout } from '../../../../components/layout/BaseLayout';
import styles from './Admin-Personal.module.css';
import { useAuth } from '../../../../context/AuthContext';
import { getAllStaff } from '../../api/crud-staff.api';
import { getAllpcampo } from '../../api/crud-pcampo.api';
import { useNavigate } from 'react-router-dom';

export function AdminPersonal(){

    const navigate = useNavigate()
    const [staffList, setStaffList] = useState([])
    const [pcampoList, setPcampoList] = useState([])
    const [loading, setLoading] = useState(true);

    const loadData = async () => {
        setLoading(true);

        try{
            const [staffRes, pcampoRes] = await Promise.all([
                getAllStaff(),
                getAllpcampo(),
            ])
            setStaffList(staffRes.data)
            setPcampoList(pcampoRes.data)
            console.log(staffRes.data)
        } catch(error){
            console.error('Error cargando los datos:', error)
            if(error.response?.status === 401 || error.response?.status === 403){
                toast.error("No tienes permisos o tu sesión expiró aqui");
                navigate('/login')
            } else {
                toast.error("Error cargando datos iniciales")
            }
        }finally{
            setLoading(false);
        }
    }

    useEffect(() => {
        loadData();
    }, [navigate]);
    
    const [sortColumnStaff, setSortColumnStaff] = useState('id');
    const [sortDirStaff, setSortDirStaff] = useState('asc');

    const handleSortStaff = (column) => {
        if (sortColumnStaff === column){
            setSortDirStaff(sortDirStaff === 'asc' ? 'desc' : 'asc')

        } else{
            setSortColumnStaff(column)
            setSortDirStaff('asc')
        }
    }

    const sortedStaff = [...staffList].sort((a,b) => {

        let aValue, bValue;

        const getValue = (obj, path) => path.split('.').reduce((o,k) => (o || {}) [k], obj)

        aValue = getValue(a,sortColumnStaff);
        bValue = getValue(b, sortColumnStaff);

        if (aValue == null && bValue == null) return 0;
        if (aValue == null) return sortDirStaff === 'asc' ? -1 : 1;
        if (bValue == null) return sortDirStaff === 'asc' ? 1 : -1;

        const numA = parseFloat(aValue);
        const numB = parseFloat(bValue);
        if (!isNaN(numA) && !isNaN(numB)) {
            if (numA < numB) return sortDirStaff === 'asc' ? -1 : 1;
            if (numA > numB) return sortDirStaff === 'asc' ? 1 : -1;
            return 0;
        }

        if (typeof aValue === 'string' && typeof bValue === 'string') {
            const comparison = aValue.localeCompare(bValue, undefined, { sensitivity: 'base' });
            return sortDirStaff === 'asc' ? comparison : -comparison;
        }

        return 0;
    })

    const [sortColumnPcampo, setSortColumnPcampo] = useState('id');
    const [sortDirPcampo, setSortDirPcampo] = useState('asc');

    

    const handleSortPcampo = (column) => {
        if (sortColumnPcampo === column){
            setSortDirPcampo(sortDirPcampo === 'asc' ? 'desc' : 'asc')

        } else{
            setSortColumnPcampo(column)
            setSortDirPcampo('asc')
        }
    }

     

    const sortedPcampo = [...pcampoList].sort((a,b) => {

        let aValue, bValue;

        const getValue = (obj, path) => path.split('.').reduce((o,k) => (o || {}) [k], obj)

        aValue = getValue(a,sortColumnPcampo);
        bValue = getValue(b, sortColumnPcampo);

        if (aValue == null && bValue == null) return 0;
        if (aValue == null) return sortDirPcampo === 'asc' ? -1 : 1;
        if (bValue == null) return sortDirPcampo === 'asc' ? 1 : -1;

        const numA = parseFloat(aValue);
        const numB = parseFloat(bValue);
        if (!isNaN(numA) && !isNaN(numB)) {
            if (numA < numB) return sortDirPcampo === 'asc' ? -1 : 1;
            if (numA > numB) return sortDirPcampo === 'asc' ? 1 : -1;
            return 0;
        }

        if (typeof aValue === 'string' && typeof bValue === 'string') {
            const comparison = aValue.localeCompare(bValue, undefined, { sensitivity: 'base' });
            return sortDirPcampo === 'asc' ? comparison : -comparison;
        }

        return 0;
    }) 

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
                    <a href='/horario-trabajo' className={styles.adminlink}>
                        <h2>GESTION DE HORARIO DE TRABAJO</h2>
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
                                <th onClick={() => handleSortStaff('id')}>ID {sortColumnStaff === 'id' && (sortDirStaff === 'asc' ? '▲' : '▼')}</th>
                                <th onClick={() => handleSortStaff('personal.nombre')}>NOMBRE {sortColumnStaff === 'personal.nombre' && (sortDirStaff === 'asc' ? '▲' : '▼')}</th>
                                <th onClick={() => handleSortStaff('personal.a_paterno')}>APELLIDO {sortColumnStaff === 'personal.a_paterno' && (sortDirStaff === 'asc' ? '▲' : '▼')}</th>
                                <th onClick={() => handleSortStaff('personal.dni')}>DNI {sortColumnStaff === 'personal.dni' && (sortDirStaff === 'asc' ? '▲' : '▼')}</th>
                                <th onClick={() => handleSortStaff('personal.f_ingreso')}>FECHA DE INGRESO {sortColumnStaff === 'personal.f_ingreso' && (sortDirStaff === 'asc' ? '▲' : '▼')}</th>
                                <th onClick={() => handleSortStaff('personal.estado')}>ESTADO {sortColumnStaff === 'personal.estado' && (sortDirStaff === 'asc' ? '▲' : '▼')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedStaff.map(staff => (
                                <tr key={staff.id} className="border-b border-gray-200 hover:bg-gray-50">
                                    <td className='w-24'>{staff.id}</td>
                                    <td className='w-48'>{staff.personal?.nombre}</td>
                                    <td className='w-48'>{staff.personal.a_paterno} {staff.personal.a_materno}</td>
                                    <td className='w-24'>{staff.personal?.dni}</td>
                                    <td className='w-40'>{staff.personal?.f_ingreso}</td>
                                    <td className='w-24'>{staff.personal?.estado}</td>
                                </tr>
                            ))}
                        </tbody>

                    </table>
                </div>

                <div className={styles.personallist}>
                    <h3>PERSONAL DE CAMPO</h3>
                    <table className='min-w-full'>
                        <thead>
                            <tr>
                                <th onClick={() => handleSortPcampo('personal.id')}>ID {sortColumnPcampo === 'personal.id' && (sortDirPcampo === 'asc' ? '▲' : '▼')}</th>
                                <th onClick={() => handleSortPcampo('personal.nombre')}>NOMBRE {sortColumnPcampo === 'personal.nombre' && (sortDirPcampo === 'asc' ? '▲' : '▼')}</th>
                                <th onClick={() => handleSortPcampo('personal.a_paterno')}>APELLIDO {sortColumnPcampo === 'personal.a_paterno' && (sortDirPcampo === 'asc' ? '▲' : '▼')}</th>
                                <th onClick={() => handleSortPcampo('personal.dni')}>DNI {sortColumnPcampo === 'personal.dni' && (sortDirPcampo === 'asc' ? '▲' : '▼')}</th>
                                <th onClick={() => handleSortPcampo('personal.f_ingreso')}>FECHA DE INGRESO {sortColumnPcampo === 'personal.f_ingreso' && (sortDirPcampo === 'asc' ? '▲' : '▼')}</th>
                                <th onClick={() => handleSortPcampo('personal.estado')}>ESTADO {sortColumnPcampo === 'personal.estado' && (sortDirPcampo === 'asc' ? '▲' : '▼')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedPcampo.map(staff => (
                                <tr key={staff.id} className="border-b border-gray-200 hover:bg-gray-50">
                                    <td className='w-24'>{staff.id}</td>
                                    <td className='w-48'>{staff.personal?.nombre}</td>
                                    <td className='w-48'>{staff.personal.a_paterno} {staff.personal.a_materno}</td>
                                    <td className='w-24'>{staff.personal?.dni}</td>
                                    <td className='w-40'>{staff.personal?.f_ingreso}</td>
                                    <td className='w-24'>{staff.personal?.estado}</td>
                                </tr>
                            ))}
                        </tbody>

                    </table>
                </div>
                
            </div>

        </BaseLayout>
    )
}