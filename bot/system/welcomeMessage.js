function cleanText(value) {

    if (!value) {
        return "";
    }

    return String(value)
        .replace(/\r/g, "")
        .trim();

}


function getParticipantJid(participant) {

    if (!participant) {
        return "";
    }

    if (typeof participant === "string") {
        return participant;
    }

    return (
        participant.id ||
        participant.jid ||
        participant.phoneNumber ||
        participant.lid ||
        ""
    );

}


function getParticipantName(participant, jid) {

    if (participant && typeof participant === "object") {

        const name =
            participant.notify ||
            participant.name ||
            participant.pushName ||
            participant.verifiedName;

        if (name) {
            return String(name).trim();
        }

    }

    if (jid) {

        return jid
            .split("@")[0]
            .split(":")[0];

    }

    return "Member";

}


function getGroupRules(metadata) {

    const description =
        metadata?.desc ||
        metadata?.description ||
        "";

    return cleanText(description);

}


export function createWelcomeMessage({
    botName,
    groupName,
    metadata,
    participant
}) {

    const jid =
        getParticipantJid(participant);

    const name =
        getParticipantName(
            participant,
            jid
        );

    const rules =
        getGroupRules(metadata);

    const memberCount =
        Array.isArray(metadata?.participants)
            ? metadata.participants.length
            : 0;

    const mention =
        jid
            ? `@${jid.split("@")[0].split(":")[0]}`
            : name;


    let message =
`╭━━━〔 👋 WELCOME 〕━━━╮
┃
┃ 👋 Hey ${mention}!
┃
┃ 🎉 Welcome to
┃ 📌 ${groupName || "the group"}
┃
┃ ❤️ We're glad to have you here.
┃
┣━━━〔 👤 MEMBER INFO 〕━━━
┃
┃ 👤 Member: ${name}
┃ 👥 Members: ${memberCount}
┃ 🤖 Bot: ${botName || "JLEY-XMD"}
┃
╰━━━━━━━━━━━━━━━━━━━━╯`;


    if (rules) {

        message +=
`

╭━━━〔 📜 GROUP RULES 〕━━━╮
┃
${rules
    .split("\n")
    .map(line => `┃ ${line}`)
    .join("\n")}
╰━━━━━━━━━━━━━━━━━━━━╯`;

    }


    message +=
`

╭━━━〔 🚀 ENJOY YOUR STAY 〕━━━╮
┃
┃ Feel free to introduce yourself
┃ and enjoy the group.
┃
┃ ❤️ Have a great time!
┃
╰━━━━━━━━━━━━━━━━━━━━╯`;


    return {

        text: message,

        mentions: jid
            ? [jid]
            : []

    };

}


export default {
    createWelcomeMessage
};