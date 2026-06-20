import { render } from "solid-js/web"
import { Route, Router } from "@solidjs/router"
import Login from "./routes/Login"
import Register from "./routes/Register"
import Chat from "./routes/Chat"
import { AdminRoute, GuestRoute, ProtectedRoute } from "./components/ProtectedRoute"
import Admin from "./routes/Admin"
import Landing from "./routes/Landing"
import './style/index.css'
import About from "./routes/About"
import Settings from "./routes/Settings"
import { PreferencesProvider } from "./context/Preferences"
import Avatar from "./routes/Avatar"

render(
    () => (
        <PreferencesProvider>
            <Router>
                <Route path="/" component={() => (
                    <Landing />
                )} />
                <Route path="/login" component={() => (
                    <GuestRoute><Login /></GuestRoute>
                )} />
                <Route path="/register" component={() => (
                    <GuestRoute><Register /></GuestRoute>
                )} />
                <Route path="/chat" component={() => (
                    <ProtectedRoute><Chat /></ProtectedRoute>
                )} />
                <Route path="/settings" component={() => (
                    <ProtectedRoute><Settings /></ProtectedRoute>
                )} />
                <Route path="/admin" component={() => (
                    <AdminRoute><Admin /></AdminRoute>
                )} />
                <Route path="/about" component={About} />
                <Route path="/avatar" component={Avatar} />
            </Router>
        </PreferencesProvider>
    ),
    document.getElementById("root")!
)
