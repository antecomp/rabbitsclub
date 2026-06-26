import { useNavigate } from "@solidjs/router";
import { createEffect, ParentProps, Show } from "solid-js";
import { user } from "../api/user";

/** Renders children only for authenticated users, redirecting guests home after the global user resource resolves. */
export function ProtectedRoute(props: ParentProps) {
    const navigate = useNavigate();

    createEffect(() => {
        if (user.loading) return;
        if (!user()) navigate("/", { replace: true })
    });

    return <Show when={!user.loading}>{props.children}</Show>
}

/** Renders children only for guests, redirecting authenticated users home. */
export function GuestRoute(props: ParentProps) {
    const navigate = useNavigate()

    createEffect(() => {
        if (user.loading) return
        if (user()) navigate("/", { replace: true })
    })

    return <Show when={!user.loading}>{props.children}</Show>
}

/** Renders children only for authenticated admin users. */
export function AdminRoute(props: ParentProps) {
    const navigate = useNavigate();

    createEffect(() => {
        if (user.loading) return;
        if (!user()?.is_admin) navigate("/", { replace: true })
    });

    return <Show when={!user.loading}>{props.children}</Show>
}
