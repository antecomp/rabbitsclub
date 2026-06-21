import { styled } from "solid-styled-components";
import cbr from '../assets/ui/c_br.png';

export const AvatarContainer = styled("div")`
    position: absolute;
    top: 40%;
    left: 10vw;
    transform: translate(0%, -50%);
    max-width: 580px;
    width: 70vw;
    height: 300px;
    user-select: none;
    animation: flicker-in 0.3s steps(12, end) forwards;
`;

export const Split = styled('div')`
    display: grid;
    grid-template-columns: 300px 1fr;
    gap: 10px;
    height: 100%;
    padding-bottom: 10px;
    padding-top: 10px;

    canvas {
        width: 100%;
        overflow: hidden;
        height: 100%;
        object-fit: contain;

        background: url(${cbr});

        --bevel: 20px;

        clip-path: polygon(
            var(--bevel) 0,
            calc(100% - var(--bevel)) 0,
            100% var(--bevel),
            100% calc(100% - var(--bevel)),
            calc(100% - var(--bevel)) 100%,
            var(--bevel) 100%,
            0 calc(100% - var(--bevel)),
            0 var(--bevel)
        );
    }
`;

export const Menu = styled('div')`
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    padding: 10px;
    box-sizing: border-box;

    height: 100%;
    overflow: hidden;
`;

export const MenuButton = styled('button')`
    border: none;
    background: none;
    padding: 0;
    font-size: 18px;

    &:hover, &:focus {
        color: gray;
        cursor: pointer;
        outline: none;
    }
`;

export const MenuTitle = styled('div')`
    display: flex;
    justify-content: space-between;
    width: 100%;
    gap: 12px;
    margin-bottom: 10px;
    font-size: 18px;
`;

export const BackButton = styled('button')`
    border: none;
    background: none;
    padding: 0;
    font-size: 18px;

    &:hover, &:focus {
        color: gray;
        cursor: pointer;
        outline: none;
    }
`;

export const ThumbnailGrid = styled('div')`
    gap: 4px;
    width: 100%;
    overflow: auto;
    padding: 1px;
    display: flex;
    flex-wrap: wrap;
`;

export const ThumbnailButton = styled('button')`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4px;
    min-height: 78px;
    padding: 6px;
    border: 1px solid black;
    outline: 1px solid transparent;
    background: #aaa;
    font-family: 'main';
    font-size: 12px;
    aspect-ratio: 1;
    flex-grow: 1;
    max-width: 32%;

    &:hover, &:focus {
        background: lightgray;
        cursor: pointer;
        outline-color: gray;
    }

    &[data-selected='true'] {
        outline: 1px solid black;
        background: #ddd;
    }

    img {
        max-width: 48px;
        max-height: 48px;
        image-rendering: pixelated;
        object-fit: contain;
        flex-grow: 1;
    }
`;

export const OffsetControls = styled('div')`
    display: grid;
    grid-template-columns: repeat(3, 15px);
    grid-template-rows: repeat(3, 15px);
    gap: 1px;
    margin-bottom: 5px;
    align-self: center;
`;

export const OffsetButton = styled('button')`
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 0;

    &:hover, &:focus {
        filter: brightness(1.5);
        cursor: pointer;
    }

    img {
        object-fit: contain;
        image-rendering: pixelated;
    }
`;

