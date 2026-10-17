import { styled } from 'solid-styled-components';

export default styled('p')`
    --stripe-color: #f2490f;
    --label-color: #b82f08;
    --band-width: 3px;
    --stripe-height: 10px;

    align-items: center;
    gap: 8px;
    font-size: 10px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--label-color);

    width: 100%;
    margin: 10px auto;
    display: grid;
    grid-template-columns: 1fr auto 1fr;

    &::before, &::after {
        content: '';
        flex: none;
        height: var(--stripe-height);
        background: repeating-linear-gradient(
            135deg,
            var(--stripe-color) 0 var(--band-width),
            transparent var(--band-width) calc(var(--band-width) * 2)
        );
    }
`;