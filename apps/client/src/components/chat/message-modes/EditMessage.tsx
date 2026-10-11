import './mode-styles.css';
import { MessageActionComponent } from "./MessageModes";

const EditMessage: MessageActionComponent = (props) => {
    return (
        <div class="bubble edit-msg">
            <div class="header">
                <span>EDIT</span>
            </div>
        </div>
    )
}

export default EditMessage;