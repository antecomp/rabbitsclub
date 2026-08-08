import { useNavigate } from "@solidjs/router";
import { AuthForm, Divider, Subtitle, Title } from "../../styled/shared.styles";
import Footer from "@/components/Footer";

export default function ManageIndex() {
    const navigate = useNavigate();

    return <>
        <Title>Manage</Title>
        <Subtitle>System setting dashboard</Subtitle>
        <Divider />
        <AuthForm>
        <button type="button" onClick={() => navigate("/manage/invites")}>[ INVITES ]</button>
        <button type="button" onClick={() => navigate("/")}>[ BACK ]</button>
        </AuthForm>
        <Footer>I trust you know what you're doing...</Footer>
    </>
}
