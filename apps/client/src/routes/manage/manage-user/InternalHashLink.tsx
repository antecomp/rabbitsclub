import Link from '@/components/Link';
import { useNavigate } from '@solidjs/router';
import type { ParentProps } from 'solid-js';

export function InternalHashLink(props: ParentProps<{ href: string; }>) {
    const navigate = useNavigate();

    return (
        <Link href={props.href} onClick={event => {
            event.preventDefault();
            navigate(props.href);
        }}>
            {props.children}
        </Link>
    );
}
