import { styled } from "solid-styled-components";
import { MessageActionComponent } from "./MessageModes"
import { api } from "@/api/backend";

const DeleteConfirmationMenu = styled('div')`
    width: 100%;

    button { font-size: 12px; }

    text-align: right;
`

const DeleteConfirmationMessage = styled('i')`
    font-size: 8px;
    font-style: italic;
    text-align: right;
    width: 100%;
    display: block;
`

const DeleteMessage: MessageActionComponent = (props) => {
    const deleteMessage = () => {
        api.messages({id: props.id}).delete(); 
        props.closeSelf()
    };

    return (
        <div class="bubble delete-msg">
            <div class="header">
                <span>DELETE</span>
            </div>
            <span 
                style={{
                    "text-decoration": 'line-through',
                    "color": '#910000'
                }}>
                    {props.content}
                </span>
                <br/>
                <DeleteConfirmationMessage>This action cannot be undone.</DeleteConfirmationMessage>
                <DeleteConfirmationMenu>
                    <button onClick={props.closeSelf}>[ CANCEL ]</button>
                    <button onClick={deleteMessage}>[ DELETE ]</button>
                </DeleteConfirmationMenu>
        </div>
    )
}

export default DeleteMessage;