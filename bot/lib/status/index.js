import handleAutoMention from "./automention.js";
import handleAutoLike from "./autolike.js";
import handleAutoView from "./autoView.js";

async function handleStatus(
    socket,
    message
) {

    await handleAutoView(
        socket,
        message
    );

    await handleAutoLike(
        socket,
        message
    );

    await handleAutoMention(
        socket,
        message
    );

}

export default handleStatus;