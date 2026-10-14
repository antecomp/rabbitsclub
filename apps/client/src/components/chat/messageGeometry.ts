import { css } from 'solid-styled-components';

/** Clockwise polygon with matching cuts on opposite corners. */
function bubblePolygon(topLeft: string, topRight: string) {
    return `polygon(
        ${topLeft} 0,
        calc(100% - ${topRight}) 0,
        100% ${topRight},
        100% calc(100% - ${topLeft}),
        calc(100% - ${topLeft}) 100%,
        ${topRight} 100%,
        0 calc(100% - ${topRight}),
        0 ${topLeft}
    )`;
}

// Moving both edges inward by b moves their 45-degree intersection by
// (2 - sqrt(2)) * b in the inset element's coordinate system.
const diagonalInsetCorrection = 2 - Math.SQRT2;

// Generate these rules once. Dimensions remain CSS variables so geometry
// responds to DevTools edits without JS measurements or per-message styles.
export const messageGeometryClass = css(`
    --inner-corner-cut: calc(var(--corner-cut) - var(--border-width) * ${diagonalInsetCorrection});
    --inner-small-corner-cut: calc(var(--small-corner-cut) - var(--border-width) * ${diagonalInsetCorrection});

    &.message-incoming {
        --bubble-clip-path: ${bubblePolygon('var(--corner-cut)', 'var(--small-corner-cut)')};
        --bubble-inner-clip-path: ${bubblePolygon('var(--inner-corner-cut)', 'var(--inner-small-corner-cut)')};
    }

    &.message-outgoing {
        --bubble-clip-path: ${bubblePolygon('var(--small-corner-cut)', 'var(--corner-cut)')};
        --bubble-inner-clip-path: ${bubblePolygon('var(--inner-small-corner-cut)', 'var(--inner-corner-cut)')};
    }

    --tag-clip-path: polygon(
        0 0,
        calc(100% - var(--tag-height)) 0,
        100% var(--tag-height),
        var(--corner-cut) var(--tag-height),
        0 calc(var(--tag-height) + var(--corner-cut))
    );
    --tag-inner-clip-path: polygon(
        var(--border-width) var(--border-width),
        calc(100% - var(--tag-height) - var(--border-width) * ${Math.SQRT2} + var(--border-width)) var(--border-width),
        calc(100% - var(--border-width) * ${Math.SQRT2} - var(--border-width)) calc(var(--tag-height) - var(--border-width)),
        calc(var(--corner-cut) - var(--border-width) * ${Math.SQRT2 - 1}) calc(var(--tag-height) - var(--border-width)),
        var(--border-width) calc(var(--corner-cut) + var(--tag-height) - var(--border-width) * ${Math.SQRT2} - var(--border-width))
    );
`);
