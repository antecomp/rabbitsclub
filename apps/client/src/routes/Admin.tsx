import { createSignal } from "solid-js"
import { BE } from "../api";

export default function Admin() {
    const [inviteCode, setInviteCode] = createSignal("");
    const sendInvite = (e: SubmitEvent) => {
        e.preventDefault();
        if(!inviteCode()) return;
        BE.admin.invite.post({code: inviteCode()});
        setInviteCode("");
    }

    return <div>
        <header>Admin Dashboard!!</header>
        <hr />
        <form onsubmit={sendInvite}>
            <input 
                value={inviteCode()}
                onInput={e => setInviteCode(e.target.value)}
                placeholder="Invite Code"
            />
            <button type="submit">Send</button>
        </form>
    </div>
}