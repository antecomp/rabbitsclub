import { useNavigate } from "@solidjs/router";
import { AuthForm, Divider, Subtitle, Title } from "../../styled/shared.styles";
import Footer from "@/components/Footer";

export default function AdminIndex() {
    const navigate = useNavigate();

    return <>
        <Title>Admin</Title>
        <Subtitle>System setting dashboard</Subtitle>
        <Divider />
        <AuthForm>
        <button type="button" onClick={() => navigate("/admin/invites")}>[ INVITES ]</button>
        </AuthForm>
        <Footer>I trust you know what you're doing...</Footer>
    </>
}
