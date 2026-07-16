export function containsLink(text){

    if(!text) return false;


    const urlRegex =
        /(https?:\/\/|www\.|wa\.me\/|t\.me\/)[^\s]+/i;


    return urlRegex.test(text);

}