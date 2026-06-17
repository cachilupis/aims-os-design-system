# Cómo generar una vista (para PMs / colegas)

Este repo es la base de conocimiento del Design System de AIMS OS. Si lo usas con Claude Code,
los prototipos salen consistentes con el DS sin que tengas que saber de código.

## Requisitos una sola vez
- Tener Claude Code instalado.
- Tener la app de escritorio de Figma abierta con el archivo del Design System (habilita el MCP).
- Clonar este repo y abrirlo.

## Para crear una vista nueva
1. Abre la Terminal, entra a la carpeta del repo (`cd ...`) y escribe `claude`.
2. Pídele la pantalla en lenguaje natural. Dos formas, de mejor a peor fidelidad:
   - **Con referencia de Figma (recomendado):** "Crea la vista de [nombre]. Úsala como referencia:
     [pega el node URL del frame en Figma]."
   - **Solo descripción:** "Crea una vista de listado de facturas con buscador arriba, tabla con
     estados, y un panel lateral de filtros."
3. Claude reutiliza los componentes de `src/components/ui/` y los tokens del Design System.
4. Revisa el resultado. Si algo no calza, pídele el ajuste ("usa el Button Secondary aquí",
   "el espaciado entre cards debe ser 4x").

## Reglas que el repo ya impone por ti
- Usa solo componentes de la librería (no inventa botones/inputs nuevos).
- Usa los tokens de color/spacing/radius del DS (no valores arbitrarios).
- Tema dark e Inter por defecto.

## Si falta un componente
Si necesitas algo que no existe en `src/components/ui/`, Claude lo marcará en vez de improvisar.
Avísale al equipo de diseño para agregarlo a la librería — así crece de forma controlada.

## Catálogo visual
Corre Storybook (`npm run storybook`) para ver todos los componentes disponibles y sus variantes.
