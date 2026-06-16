import { styled } from "solid-styled-components";

export const Container = styled("div")`
    position: absolute;
    top: 40%;
    left: 10vw;
    transform: translate(0%, -50%);
    max-width: 400px;
    width: 50vw;
`
export const Selector = styled("div")`
    display: flex;
    > h1:hover {
        cursor: pointer;
        color: gray;
    }
`
export const Title = styled("h1")`
    font-size: 4rem;
`
export const Subtitle = styled("h2")`
    font-size: 2rem;
`
export const Divider = styled("hr")`
    border-color: black;
    border-style: solid;
    border-width: 1px;
`
