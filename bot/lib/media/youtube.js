import ytSearch from "yt-search";


export async function searchYouTube(query) {

    const result = await ytSearch(query);


    if (!result.videos.length) {

        throw new Error(
            "No results found."
        );

    }


    return result.videos[0];

}