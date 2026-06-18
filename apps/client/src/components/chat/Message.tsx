import { styled } from "solid-styled-components"
import pfp_placeholder from '../../assets/placeholder.png';
const MessageContainer = styled("div")`
    display: grid;
    grid-template-columns: 40px auto;
`

const PfpContainer = styled("div")`
    img {
        display: block;
        width: 100%;
    }
`

const MessageBody = styled("div")`
    
`

const TimestampContainer = styled("div")`
    
`

const MessageContent = styled("div")`
    
`

export default function Message(props: {
    username: string,
    content: string,
    created_at: string
}) {
    return (
        <MessageContainer>
            <PfpContainer>
                <img src={pfp_placeholder} />
            </PfpContainer>
            <MessageBody>
                <TimestampContainer>{props.created_at}</TimestampContainer>
                <MessageContent>{props.username}:{props.content}</MessageContent>
            </MessageBody>
        </MessageContainer>
    )
}