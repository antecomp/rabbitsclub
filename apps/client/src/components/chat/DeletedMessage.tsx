import { Match, Switch } from "solid-js";
import { MessageProps } from "./Message";

export default function DeletedMessage(props: MessageProps) {
    return (
        <div class='deleted-message' classList={{'outgoing': props.isOwn, 'incoming': !props.isOwn}}>
            <Switch>
                <Match when={props.deleted_kind == 'moderator'}>
                    MESSAGE REMOVED BY MODERATOR
                    {props.deleted_reason ? `: ${props.deleted_reason}` : '.'}
                </Match>
                <Match when={props.deleted_kind == 'user'}>
                    MESSAGE DELETED
                </Match>
            </Switch>
        </div>
    )
}