import { user } from "../store";

export default function Chat() {
    return (
        <div>
            <h1>Chat</h1>
            {user()?.username}
        </div>
    )
}