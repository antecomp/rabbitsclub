import { createSignal, For } from 'solid-js';
import { styled } from 'solid-styled-components';

const StackedToggleContainer = styled('div')`
    display: flex;
    flex-direction: column;
    gap: 2px;
    align-items: flex-start;
    width: fit-content;

    button {
        color: #888;
    }

    button.active {
        /* font-weight: bold; */
        color: black;
    }
`;
/**
 * Vertical stacked set of radio options. E.g
 * 
 *  [ OPTION A]
 * 
 *  [ OPTION B]
 * 
 *  [ OPTION C]
 * 
 * Returns the component for the toggle + accessors/setters for its selection state (string)
 * @param options List of options to toggle between
 * @param initialIndex Initial selected item index (defaults to the first one)
 * @returns [the toggle component, the signal accessor, the signal setter]
 */
export default function createStackedToggle<
    const T extends readonly [string, ...string[]] // prevent []
>(
    options: T,
    initialIndex = 0
) {
    const [value, setValue] = createSignal<T[number]>(
        options[initialIndex % options.length]
    );

    const toggle = (
        <StackedToggleContainer>
            <For each={options}>
                {option => {
                    return (
                        <button
                            classList={{ active: option === value() }}
                            onClick={() => setValue(() => option)}
                        >
                            ( {option} )
                        </button>
                    );
                }}
            </For>
        </StackedToggleContainer>
    );

    return [toggle, value, setValue] as const;
}