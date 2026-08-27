import { createSignal, For } from 'solid-js';
import { styled } from 'solid-styled-components';

const ToggleContainer = styled('div')`
    gap: 2px;
    align-items: flex-start;
    width: fit-content;
    position: relative;

    button {
        color: #888;
    }

    span {
        color: #555;
    }

    button.active,
    button.active:hover,
    button.active:focus {
        color: black;
    }

    &:after {
        content: attr(data-caption);
        position: absolute;
        bottom: 0;
        right: 0;
        transform: translateY(100%);
        font-size: 12px;
        color: #888;
    }
`;
/**
 * Horizontal stacked set of radio options. E.g
 * 
 * [ OPTION A / OPTION B / OPTION C ]
 * 
 * Returns the component for the toggle + accessors/setters for its selection state (string)
 * @param options List of options to toggle between
 * @param caption Caption to show below the toggle list
 * @param initialIndex Initial selected item index (defaults to the first one)
 * @returns [the toggle component, the signal accessor, the signal setter]
 */
export default function createFlatToggle<
    const T extends readonly [string, ...string[]] // prevent []
>(
    options: T,
    caption = '',
    initialIndex = 0
) {
    const [value, setValue] = createSignal<T[number]>(
        options[initialIndex % options.length]
    );

    const toggle = (
        <ToggleContainer
            class='toggle-container flat-toggle-container'
            data-caption={caption}
        >
            [&nbsp;
            <For each={options}>
                {(option, i) => {
                    return (<>
                        <button
                            classList={{ active: option === value() }}
                            onClick={e => {e.preventDefault(); setValue(() => option);}}
                        >
                            {option}
                        </button>
                        <span>
                            {i() >= options.length - 1 ? '' : ' / '}
                        </span>
                    </>);
                }}
            </For>
            &nbsp;]
        </ToggleContainer>
    );

    return [toggle, value, setValue] as const;
}