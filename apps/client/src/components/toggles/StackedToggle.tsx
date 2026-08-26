import { createSignal, For } from "solid-js";
import { styled } from "solid-styled-components";

const StackedToggleContainer = styled('div')`
    display: flex;
    flex-direction: "column";
    gap: 2;

    button {
        font-size: 12px;
        color: #888;
        font-weight: 400;
    }

    button.active {
        color: ink;
        font-weight: 700;
    }
`
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
 * @param caption Caption to show below the toggle list
 * @param initialIndex Initial selected item index (defaults to the first one)
 * @returns [the toggle component, the signal accessor, the signal setter]
 */
export default function createStackedToggle<T extends string[]>(
    options: T,
    initialIndex: number
) {
    const [value, setValue] = createSignal<T[number]>(
        options[
        initialIndex !== undefined
            ? initialIndex % options.length
            : 0
        ]
    );

    const toggle = (
        <StackedToggleContainer>
            <For each={options}>
                {option => {
                    const active = option === value();

                    return (
                        <button
                            classList={{active}}
                        >
                            [ {option} ]
                        </button>
                    )
                }}
            </For>
        </StackedToggleContainer>
    );

    return [toggle, value, setValue];
}