import { getSiteWideDiscussionsQuery } from "../cypher/cypherQueries.js";
import { timeFrameOptions } from "./utils.js";
var timeFrameOptionKeys;
(function (timeFrameOptionKeys) {
    timeFrameOptionKeys["year"] = "year";
    timeFrameOptionKeys["month"] = "month";
    timeFrameOptionKeys["week"] = "week";
    timeFrameOptionKeys["day"] = "day";
})(timeFrameOptionKeys || (timeFrameOptionKeys = {}));
const getResolver = (input) => {
    const { driver, Discussion } = input;
    return async (parent, args, context, info) => {
        const { searchInput, selectedChannels, selectedTags, options } = args;
        const { offset, limit, resultsOrder, sort, timeFrame } = options || {};
        const session = driver.session();
        try {
            const filters = [];
            if (searchInput) {
                filters.push({
                    OR: [
                        {
                            title_CONTAINS: searchInput,
                        },
                        {
                            body_CONTAINS: searchInput,
                        },
                    ],
                });
            }
            if ((selectedTags === null || selectedTags === void 0 ? void 0 : selectedTags.length) > 0) {
                filters.push({
                    Tags: {
                        text_IN: selectedTags,
                    },
                });
            }
            if ((selectedChannels === null || selectedChannels === void 0 ? void 0 : selectedChannels.length) > 0) {
                filters.push({
                    DiscussionChannels_SOME: {
                        channelUniqueName_IN: selectedChannels,
                    },
                });
            }
            // We use the OGM for counting the results, but for sorting them
            // we use our own fancy custom cypher query because the order is complicated.
            const aggregateDiscussionCountResult = await Discussion.aggregate({
                where: {
                    AND: filters,
                },
                aggregate: {
                    count: true,
                },
            });
            const count = (aggregateDiscussionCountResult === null || aggregateDiscussionCountResult === void 0 ? void 0 : aggregateDiscussionCountResult.count) || 0;
            if (count === 0) {
                return {
                    discussions: [],
                    aggregateDiscussionCount: 0,
                };
            }
            switch (sort) {
                case "new":
                    let newDiscussionResult = await session.run(getSiteWideDiscussionsQuery, {
                        searchInput,
                        selectedChannels,
                        selectedTags,
                        offset,
                        limit,
                        resultsOrder,
                        startOfTimeFrame: null,
                        sortOption: "new",
                    });
                    const newDiscussions = newDiscussionResult.records.map((record) => {
                        return record.get("discussion");
                    });
                    return {
                        discussions: newDiscussions,
                        aggregateDiscussionCount: count,
                    };
                case "top":
                    // if sort is "top", get the Discussions sorted by the sum of the
                    // weightedVotesCounts of the related DiscussionChannels.
                    // Treat a null weightedVotesCount as 0.
                    let selectedTimeFrame = timeFrameOptions.year.start;
                    if (timeFrameOptions[timeFrame]) {
                        selectedTimeFrame = timeFrameOptions[timeFrame].start;
                    }
                    const topDiscussionsResult = await session.run(getSiteWideDiscussionsQuery, {
                        searchInput,
                        selectedChannels,
                        selectedTags,
                        offset,
                        limit,
                        resultsOrder,
                        startOfTimeFrame: selectedTimeFrame,
                        sortOption: "top",
                    });
                    const discussions = topDiscussionsResult.records.map((record) => {
                        return record.get("discussion");
                    });
                    return {
                        discussions,
                        aggregateDiscussionCount: count,
                    };
                default:
                    // By default, and if sort is "hot", get the DiscussionChannels sorted by hot,
                    // which takes into account both weightedVotesCount and createdAt.
                    const hotDiscussionsResult = await session.run(getSiteWideDiscussionsQuery, {
                        searchInput,
                        selectedChannels,
                        selectedTags,
                        offset,
                        limit,
                        resultsOrder,
                        startOfTimeFrame: null,
                        sortOption: "hot",
                    });
                    const hotDiscussions = hotDiscussionsResult.records.map((record) => {
                        return record.get("discussion");
                    });
                    return {
                        discussions: hotDiscussions,
                        aggregateDiscussionCount: count,
                    };
            }
        }
        catch (error) {
            console.error("Error getting discussions:", error);
            throw new Error(`Failed to fetch discussions. ${error.message}`);
        }
        finally {
            session.close();
        }
    };
};
export default getResolver;
