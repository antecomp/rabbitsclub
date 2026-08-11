import { AnchorProps, A } from '@solidjs/router';
import { splitProps } from 'solid-js';

export default function Link(props: AnchorProps) {
    const [local, rest] = splitProps(props, ['class']);

    return <A 
        {...rest} 
        class={`link-button${local.class ? ` ${local.class}` : ''}`}
    />;
}