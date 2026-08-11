import { AuthForm, Divider, Subtitle, Title } from '../../styled/shared.styles';
import Footer from '@/components/Footer';
import Link from '@/components/Link';

export default function ManageIndex() {

    return <>
        <Title>Manage</Title>
        <Subtitle>System setting dashboard</Subtitle>
        <Divider />
        <AuthForm>
            <Link href="/manage/invites">[ INVITES ]</Link>
            <Link href="/">[ BACK ]</Link>
        </AuthForm>
        <Footer>I trust you know what you're doing...</Footer>
    </>;
}
