import { render } from "solid-js/web"
import { Route, Router, type RouteSectionProps } from "@solidjs/router"
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
import Avatar from "@/routes/Avatar"
import AdminIndex from "./routes/admin/AdminIndex"
import AdminInvites from "./routes/admin/AdminInvites"
import Invite from "./routes/Invite"
import AuthGuard from "./components/AuthGuard"
import LoggedOut from "./routes/LoggedOut"

function AppRoot(props: RouteSectionProps) {
    return (
        <>
            <AuthGuard />
            {props.children}
        </>
    )
}

render(
    () => (
        <PreferencesProvider>
            <Router root={AppRoot}>
                <Route path="/" component={() => (
                    <Landing />
                )} />
                <Route path="/login" component={() => (
                    <GuestRoute><Login /></GuestRoute>
                )} />
                <Route path="/register" component={() => (
                    <GuestRoute><Register /></GuestRoute>
                )} />
                <Route path="/invite/:code" component={() => (
                    <GuestRoute><Invite /></GuestRoute>
                )} />
                <Route path="/chat" component={() => (
                    <ProtectedRoute><Chat /></ProtectedRoute>
                )} />
                <Route path="/settings" component={() => (
                    <ProtectedRoute><Settings /></ProtectedRoute>
                )} />
                <Route path="/admin" component={(props) => (
                    <AdminRoute><Admin>{props.children}</Admin></AdminRoute>
                )}>
                    <Route path="/" component={AdminIndex} />
                    <Route path="/invites" component={AdminInvites} />
                </Route>
                <Route path="/about" component={About} />
                <Route path="/avatar" component={() => (
                    <Avatar />
                )} />
                <Route path="/logged-out" component={LoggedOut}/>
            </Router>
        </PreferencesProvider>
    ),
    document.getElementById("root")!
)
