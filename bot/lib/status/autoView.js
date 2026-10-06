import automationStore from "../../system/automationStore.js";
import { isStatus } from "./helpers.js";

async function handleAutoView(socket, message) {

    try {

        if (!isStatus(message)) {
            return;
        }

        const key = message?.key;

        if (!key?.id) {
            console.log("[AUTOVIEW] Status has no message ID.");
            return;
        }

        if (key.remoteJid !== "status@broadcast") {
            return;
        }

        /*
         * The setting belongs to this bot deployment.
         */
        const botIdentity =
            socket?.user?.lid ||
            socket?.user?.id ||
            null;

        if (!botIdentity) {
            console.log(
                "[AUTOVIEW] Unable to identify bot."
            );
            return;
        }

        const settings =
            automationStore.get(botIdentity);

        if (!settings?.autoview) {
            return;
        }

        /*
         * IMPORTANT:
         *
         * Keep the ORIGINAL status participant.
         *
         * For LID-based accounts WhatsApp may require
         * the original LID participant for the read receipt.
         */
        const participant =
            key?.participant ||
            message?.participant ||
            key?.participantPn ||
            null;

        if (!participant) {
            console.log(
                "[AUTOVIEW] No status participant found."
            );
            return;
        }

        const statusId = key.id;

        console.log(
            "[AUTOVIEW] Viewing status:",
            {
                statusId,
                participant,
                participantPn:
                    key?.participantPn
            }
        );

        /*
         * METHOD A
         *
         * This is the important ALSON-style method.
         *
         * sendReceipt() sends the actual WhatsApp
         * status read receipt.
         */
        if (
            typeof socket.sendReceipt ===
            "function"
        ) {

            try {

                await socket.sendReceipt(
                    "status@broadcast",
                    participant,
                    [statusId],
                    "read"
                );

                console.log(
                    "[AUTOVIEW] ✅ Status viewed via sendReceipt."
                );

                return;

            } catch (error) {

                console.log(
                    "[AUTOVIEW] sendReceipt failed:",
                    error?.message ||
                    error
                );

            }

        }

        /*
         * METHOD B
         *
         * Baileys fallback.
         */
        try {

            await socket.readMessages([
                {
                    remoteJid:
                        "status@broadcast",

                    id:
                        statusId,

                    participant:
                        participant,

                    fromMe:
                        false
                }
            ]);

            console.log(
                "[AUTOVIEW] ✅ Status viewed via readMessages."
            );

            return;

        } catch (error) {

            console.log(
                "[AUTOVIEW] readMessages failed:",
                error?.message ||
                error
            );

        }

        /*
         * METHOD C
         *
         * Older/newer Baileys builds may expose
         * sendReadReceipt().
         */
        if (
            typeof socket.sendReadReceipt ===
            "function"
        ) {

            try {

                await socket.sendReadReceipt(
                    "status@broadcast",
                    participant,
                    [statusId]
                );

                console.log(
                    "[AUTOVIEW] ✅ Status viewed via sendReadReceipt."
                );

                return;

            } catch (error) {

                console.log(
                    "[AUTOVIEW] sendReadReceipt failed:",
                    error?.message ||
                    error
                );

            }

        }

        console.error(
            "[AUTOVIEW] ❌ All status-view methods failed."
        );

    } catch (error) {

        console.error(
            "[AUTOVIEW] Handler error:",
            error?.message ||
            error
        );

    }

}

export default handleAutoView;