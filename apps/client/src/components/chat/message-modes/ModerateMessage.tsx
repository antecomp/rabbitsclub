import createFlatToggle from "@/components/toggles/FlatToggle";
import { MessageActionComponent } from "./MessageModes";
import { styled } from "solid-styled-components";
import Link from "@/components/Link";

const ModerateConfirmationMenu = styled('div')`
    display: flex;
    align-items: center;
    transform: translateY(10px);

    button { font-size: 12px; }
`

const ModerateMessage: MessageActionComponent = (props) => {

    const [actionToggler, currentAction] = createFlatToggle(['WARN', 'DELETE']);

    return (
        <div class='bubble mod-msg'>
            <div class='header'>
                <span>MODERATE</span>
            </div>
            {actionToggler}
            MODERATE MESSAGE BODY
            <ModerateConfirmationMenu>
                {/* TODO: Get message to have sender id so we can plug it in here. */}
                <Link href={`/manage/user/${1}`}></Link>
                <button type="button" onClick={props.closeSelf}>[ CANCEL ]</button>
                <button type="submit">[ APPLY ]</button>
            </ModerateConfirmationMenu>
        </div>
    )
}

export default ModerateMessage;