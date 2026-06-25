import { useNavigate } from "@solidjs/router";
import { createEffect, ParentProps, Show } from "solid-js";
import { user } from "../api/user";

export function ProtectedRoute(props: ParentProps) {
    const navigate = useNavigate();

    createEffect(() => {
        if (user.loading) return;
        if (!user()) navigate("/", { replace: true })
    });

    return <Show when={!user.loading}>{props.children}</Show>
}

export function GuestRoute(props: ParentProps) {
    const navigate = useNavigate()

    createEffect(() => {
        if (user.loading) return
        if (user()) navigate("/", { replace: true })
    })

    return <Show when={!user.loading}>{props.children}</Show>
}

export function AdminRoute(props: ParentProps) {
    const navigate = useNavigate();

    createEffect(() => {
        if (user.loading) return;
        if (!user()?.is_admin) navigate("/", { replace: true })
    });

    return <Show when={!user.loading}>{props.children}</Show>
}
