import { render } from "solid-js/web"
import { Navigate, Route, Router } from "@solidjs/router"
import Login from "./routes/Login"
import Chat from "./routes/Chat"
import { AdminRoute, GuestRoute, ProtectedRoute } from "./components/ProtectedRoute"
import Admin from "./routes/Admin"
import './style/index.css'

render(
    () => <Router>
        {/* TODO: Make "DEFAULT PAGE" const, or other handler to redirect accordingly... */}
        <Route path="/" component={() => <Navigate href="/login" />} />
        <Route path="/login" component={() => (
            <GuestRoute><Login /></GuestRoute>
        )} />
        <Route path="/chat" component={() => (
            <ProtectedRoute><Chat /></ProtectedRoute>
        )} />
        <Route path="/admin" component={() => (
            <AdminRoute><Admin /></AdminRoute>
        )} />
    </Router>,
    document.getElementById("root")!
)