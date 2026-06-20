import { useNavigate } from "@solidjs/router";
import { createEffect, ParentProps } from "solid-js";
import { user } from "../api/user";

export function ProtectedRoute(props: ParentProps) {
    const navigate = useNavigate();

    createEffect(() => {
        if (user.loading) return;
        if (!user()) navigate("/", { replace: true })
    });

    return <>{props.children}</>
}

export function GuestRoute(props: ParentProps) {
    const navigate = useNavigate()

    createEffect(() => {
        if (user.loading) return
        if (user()) navigate("/chat", { replace: true })
    })

    return <>{props.children}</>
}

export function AdminRoute(props: ParentProps) {
    const navigate = useNavigate();

    createEffect(() => {
        if (user.loading) return;
        if (!user()?.is_admin) navigate("/", { replace: true })
    });

    return <>{props.children}</>
}
