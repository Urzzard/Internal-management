import styles from './BoxMenu.module.css';
import React from 'react';

export const BoxMenu = ({tittle, icon, path}) => {
    return(
        <a href={path} className={styles.i1}>
            <img src={icon} alt={tittle} className={styles.iconmenu}/>
            <h3 className={styles.menutittle}>{tittle}</h3>
        </a>
    )
}