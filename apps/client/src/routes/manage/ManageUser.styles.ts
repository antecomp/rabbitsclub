import cbr from '@/assets/ui/c_br.png?url&no-inline';
import { styled } from 'solid-styled-components';

export const ManageUserGrid = styled('div')`
    display: grid;
    grid-template-columns: 1fr 2fr;
    align-items: center;
    gap: 10px;
    min-height: 220px;
`;

export const ManageUserMenu = styled('div')`
    overflow: auto;
    align-self: self-start;
`;

export const AvatarContainer = styled('div')`
    height: 100%;
    aspect-ratio: 1;
    position: relative;    

    canvas {
        width: 100%;
        overflow: hidden;
        height: 100%;
        object-fit: contain;

        background: url(${cbr});

        --bevel: 20px;

        clip-path: polygon(
            var(--bevel) 0,
            100% 0,
            100% var(--bevel),
            100% 100%,
            calc(100% - var(--bevel)) 100%,
            var(--bevel) 100%,
            0 calc(100% - var(--bevel)),
            0 var(--bevel)
        );
    }

    h3 {
        position: absolute;
        top: 0;
        left: 0;
        z-index: 2;
        background-color: #ffffff;
        padding: 2px;

        clip-path: polygon(100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 0);
    }
`;