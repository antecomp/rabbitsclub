import { useNavigate } from "@solidjs/router";
import { createEffect, ParentProps } from "solid-js";
import { user } from "../store";

export function ProtectedRoute(props: ParentProps) {
    const navigate = useNavigate();

    createEffect(() => {
        if (user.loading) return;
        if (!user()) navigate("/login", { replace: true })
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