import { styled } from "solid-styled-components";

export const Container = styled("div")`
    position: absolute;
    top: 40%;
    left: 10vw;
    transform: translate(0%, -50%);
    max-width: 580px;
    width: 70vw;
    height: 350px;
    display: flex;
    flex-direction: column;
    user-select: none;
    animation: flicker-in 0.3s steps(12, end) forwards;
`

export const Selector = styled("button")`
    display: flex;
    width: fit-content;
    padding: 0;
    border: none;
    background: none;
    font-family: 'wo3';
    font-size: 4rem;
    font-weight: normal;

    &:hover, &:focus {
        cursor: pointer;
        color: gray;
        outline: none;
    }
`
export const Title = styled("h1")`
    font-size: 4rem;
`
export const Subtitle = styled("h2")`
    font-size: 2rem;
`
export const Divider = styled("hr")<{color?: string}>`
    border-color: ${props => props.color ?? "black"};
    border-style: solid;
    border-width: 1px;
`

export const AuthForm = styled('form')`
    display: flex;
    flex-direction: column;
    align-items: baseline;
    padding: 10px;
    gap: 5px;
    font-size: 18px;

    input {
        background: lightgray;
        border: none;
        font-size: 18px;
        font-family: 'main';
        padding: 5px;
        width: 70%;
        transition: width 0.11s linear;
        height: 24px;

        clip-path: polygon(
            100% 0, 
            100% calc(100% - 10px), 
            calc(100% - 10px) 100%, 
            0 100%, 
            0 0
        );
    }

    input:hover {
        width: 72%;
        background-color: #ddd;
    }

    input:focus {
        width: 75%;
        outline: none;
        background-color: #ddd;
    }

    input::after {
        content: url(iend)
    }
    

    button {
        border: none;
        background: none;
        font-size: 18px;
    }

    button:hover, button:focus {
        color: gray;
        outline: none;
        cursor: pointer;
    }
`
