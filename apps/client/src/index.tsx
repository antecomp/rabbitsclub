import { render } from "solid-js/web"
import { Navigate, Route, Router } from "@solidjs/router"
import Login from "./routes/Login"
import Chat from "./routes/Chat"

render(
    () => <Router>
        {/* TODO: Make "DEFAULT PAGE" const, or other handler to redirect accordingly... */}
        <Route path="/" component={() => <Navigate href="/login"/>} />
        <Route path="/login" component={Login} />
        <Route path="/chat" component={Chat} />
    </Router>,
    document.getElementById("root")!
)