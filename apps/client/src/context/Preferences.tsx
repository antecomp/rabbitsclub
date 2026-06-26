import { createContext, createEffect, ParentProps, useContext } from "solid-js";
import { createStore, SetStoreFunction } from "solid-js/store";

const STORAGE_KEY = "rabbitclub.preferences";

export type Preferences = {
    incomingOnRight: boolean;
};

const defaultPreferences: Preferences = {
    incomingOnRight: true,
};

type PreferencesContextValue = {
    preferences: Preferences;
    setPreferences: SetStoreFunction<Preferences>;
};

const PreferencesContext = createContext<PreferencesContextValue>();

function loadPreferences(): Preferences {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) return defaultPreferences;

        return {
            ...defaultPreferences,
            ...JSON.parse(stored),
        };
    } catch {
        return defaultPreferences;
    }
}

/**
 * Provides persisted UI preferences to the client application.
 *
 * Preferences are stored in localStorage whenever Solid observes a change to
 * the preferences store.
 */
export function PreferencesProvider(props: ParentProps) {
    const [preferences, setPreferences] = createStore<Preferences>(loadPreferences());

    createEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
    });

    return (
        <PreferencesContext.Provider value={{ preferences, setPreferences }}>
            {props.children}
        </PreferencesContext.Provider>
    );
}

/**
 * Returns the active preferences store and setter.
 *
 * Must be called from a descendant of {@link PreferencesProvider}.
 */
export function usePreferences() {
    const context = useContext(PreferencesContext);
    if (!context) throw new Error("usePreferences must be used within PreferencesProvider");
    return context;
}
