import styles from './BaseLayout.module.css';
import React from 'react';

export const BaseLayout = ({children, breadcrumbs = [] }) => {
    return(
        <div className={styles.baseContainer}>
            <div className={styles.breadcrumbs}>
                {breadcrumbs.map((bc, index) => (
                    <React.Fragment key={bc.path}>
                        <a href={bc.path} className={styles.bclink}>
                            <h3 className={styles.bclinktext}>
                                {bc.label}
                            </h3>
                        </a>
                        {index < breadcrumbs.length -1 && (
                            <div className={styles.bcseparator}>
                                <h3 className={styles.slash}>
                                    /
                                </h3>
                            </div>
                            
                        )}
                    </React.Fragment>
                ))}
            </div>

            <div className={styles.cprincipal}>
                {children}
            </div>
        </div>
    )
}