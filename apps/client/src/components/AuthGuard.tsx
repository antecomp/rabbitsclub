import { onAuthFailure } from "@/api/auth"
import { refetchUser } from "@/api/user";
import { useNavigate } from "@solidjs/router"
import { onCleanup } from "solid-js"

export default function AuthGuard() {
    const navigate = useNavigate();

    // prevent duplicate handling
    let handling = false;

    const deleteHandler = onAuthFailure((code) => {
        if (handling) return;
        handling = true;

        void Promise.resolve(refetchUser()).finally(() => {
            navigate("/logged-out", { state: { reason: code }, replace: true });
            handling = false;
        })
    })

    onCleanup(deleteHandler);

    return null
}
