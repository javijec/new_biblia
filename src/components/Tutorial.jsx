import React, { useEffect } from 'react';
import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import { useTheme, useMediaQuery } from '@mui/material';

export default function Tutorial() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));

    useEffect(() => {
        const tutorialSeen = localStorage.getItem('tutorial_seen');

        if (!tutorialSeen) {
            // Define steps based on screen size
            const steps = [
                {
                    element: isMobile ? '#mobile-menu-btn' : '#sidebar-nav',
                    popover: {
                        title: 'Navegación',
                        description: isMobile
                            ? 'Toca este botón para abrir el menú y ver los libros de la Biblia.'
                            : 'Aquí encontrarás todos los libros de la Biblia. Puedes filtrar por Antiguo o Nuevo Testamento.',
                        side: isMobile ? "bottom" : "right",
                        align: 'start'
                    }
                },
                {
                    element: '#search-trigger',
                    popover: {
                        title: 'Búsqueda',
                        description: 'Busca versículos o palabras clave rápidamente. ¡Prueba buscar verbos conjugados!',
                        side: "bottom",
                        align: 'end'
                    }
                },
                {
                    element: '#settings-trigger',
                    popover: {
                        title: 'Personalización',
                        description: 'Ajusta el tamaño de letra, la fuente y el tema (claro/oscuro) para leer cómodamente.',
                        side: "bottom",
                        align: 'end'
                    }
                },
                {
                    popover: {
                        title: '¡Todo listo!',
                        description: 'Disfruta de tu lectura en la Biblia Digital.',
                    }
                }
            ];

            const driverObj = driver({
                showProgress: true,
                animate: true,
                allowClose: false,
                doneBtnText: "¡Empezar!",
                nextBtnText: "Siguiente",
                prevBtnText: "Anterior",
                progressText: "{{current}} de {{total}}",
                steps: steps,
                onDestroyStarted: () => {
                    if (!driverObj.hasNextStep() || confirm("¿Quieres salir del tutorial?")) {
                        driverObj.destroy();
                        localStorage.setItem('tutorial_seen', 'true');
                    }
                },
            });

            // Small delay to ensure elements are rendered
            setTimeout(() => {
                driverObj.drive();
            }, 1000);
        }
    }, [isMobile]); // Re-run if screen size changes (though unlikely during tutorial)

    return null;
}
