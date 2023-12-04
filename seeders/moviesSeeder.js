const Movie = require('../models/MoviesModel');
require('dotenv').config({ path: '../.env' });
const { connectDb } = require('../config/db');
const mongoose = require('mongoose');

const apiKey = "b6b677eb7d4ec17f700e3d4dfc31d005";
const corsProxy = "https://corsproxy.io/?";
var pages;
async function fetchAndStoreContent(apiUrl, contentCategory) {
    try {
        const contentResponse = await fetch(apiUrl);
        const contentData = await contentResponse.json();
        const contentToInsert = [];
        const processedTitles = new Set();
        // pages = contentData.total_pages
        pages = 1

        for (const contentItem of contentData.results) {
            const imdbResponse = await fetch(`${corsProxy}https://v3.sg.media-imdb.com/suggestion/x/${encodeURIComponent(contentItem.title || contentItem.name)}.json`);
            const imdbData = await imdbResponse.json();


            for (const data of imdbData.d) {
                if (data?.id === "/emmys") {
                    continue;
                }

                const newContent = {
                    title: contentItem.name || contentItem.title,
                    imageUrl: data?.i?.imageUrl,
                    id: data?.id,
                    qid: data?.qid,
                    seasons: []
                };
                newContent.videoUrl = `https://embed.smashystream.com/playere.php?imdb=${newContent.id}`;

                const contentDetailsResponse = await fetch(`https://api.themoviedb.org/3/find/${encodeURIComponent(newContent.id)}?api_key=${apiKey}&language=en-US&external_source=imdb_id`);
                const contentDetailsData = await contentDetailsResponse.json();
                var seriesid

                // console.log(contentDetailsData[`${contentCategory}_results`][0].media_type)
                if (contentDetailsData[`${contentCategory}_results`][0] && contentDetailsData[`${contentCategory}_results`][0].media_type === contentCategory) {
                    // console.log(contentDetailsData[`${contentCategory}_results`])
                    // if (contentDetailsData[`${contentCategory}_results`]) {
                    const contentDetails = contentDetailsData[`${contentCategory}_results`][0];
                    newContent.overview = contentDetails?.overview;
                    newContent.releaseDate = contentDetails?.release_date;
                    newContent.adult = contentDetails?.adult;
                    newContent.genreIds = contentDetails?.genre_ids;
                    newContent.videoUrl = `https://embed.smashystream.com/playere.php?imdb=${newContent.id}`;

                    // console.log(contentDetails)
                    seriesid = contentDetailsData[`${contentCategory}_results`][0].id
                    // }

                    if (newContent.qid === "tvSeries" && contentCategory === 'tv') {
                        const seriesDataResponse = await fetch(`https://api.themoviedb.org/3/tv/${seriesid}?api_key=${apiKey}&language=en-US`);
                        const seriesData = await seriesDataResponse.json();

                        // console.log(seriesData)

                        for (const season of seriesData.seasons) {
                            const episodesDataResponse = await fetch(`https://api.themoviedb.org/3/tv/${seriesid}/season/${season.season_number}?api_key=${apiKey}&language=en-US`);
                            const episodesData = await episodesDataResponse.json();

                            // console.log(episodesData)
                            const episodes = [];
                            for (const episode of episodesData.episodes) {
                                episodes.push({
                                    episodeNumber: episode?.episode_number,
                                    name: episode?.name,
                                    overview: episode?.overview,
                                    // imageUrl: episode?.still_path, // You can update this to get episode images if available.
                                    videoUrl: `https://embed.smashystream.com/playere.php?imdb=${newContent.id}&season=${season.season_number}&episode=${encodeURIComponent(episode.episode_number)}`
                                });
                            }

                            newContent.seasons.push({
                                seasonNumber: season.season_number,
                                name: season.name,
                                episodes: episodes
                            });
                            // console.log(newContent)
                        }
                    }
                }

                if (newContent.qid === "tvSeries" || newContent.qid === "movie") {
                    contentToInsert.push(newContent);
                    processedTitles.add(newContent.title);
                }
            }
        }

        await Movie.insertMany(contentToInsert);

        console.log(`${contentCategory}s fetched and stored successfully.`);
    } catch (error) {
        console.error('Error:', error);
    }
}


connectDb()
    .then(async () => {
        // await Movie.deleteMany({});
        for (let page = 1; page <= pages; page++) {
            if (page % 2 === 1) {
                const tvSeriesUrl = `https://api.themoviedb.org/3/discover/tv?api_key=${apiKey}&page=${page}`;
                await fetchAndStoreContent(tvSeriesUrl, 'tv');
            } else {
                const moviesUrl = `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&page=${page}`;
                await fetchAndStoreContent(moviesUrl, 'movie');
            }
        }
    })
    .catch((err) => {
        console.error('Error connecting to the database:', err);
    });
