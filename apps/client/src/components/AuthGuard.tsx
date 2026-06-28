import { onAuthFailure } from "@/api/auth"
import { useNavigate } from "@solidjs/router"
import { onCleanup } from "solid-js"

export default function AuthGuard() {
    const navigate = useNavigate()

    const deleteHandler = onAuthFailure((code) => {
        navigate("/logged-out", { state: { reason: code }, replace: true })
    })

    onCleanup(deleteHandler);

    return null
}
