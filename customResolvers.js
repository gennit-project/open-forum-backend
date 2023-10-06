const { OGM } = require("@neo4j/graphql-ogm");
const typeDefs = require("./typeDefs");
const GraphQLJSON = require('graphql-type-json');
const createDiscussionWithChannelConnections = require("./customResolvers/mutations/createDiscussionWithChannelConnections");
const updateDiscussionWithChannelConnections = require("./customResolvers/mutations/updateDiscussionWithChannelConnections");
const updateDiscussionChannelUpvoteCount = require("./customResolvers/mutations/updateDiscussionChannelUpvoteCount");

const createEventWithChannelConnections = require("./customResolvers/mutations/createEventWithChannelConnections");
const updateEventWithChannelConnections = require("./customResolvers/mutations/updateEventWithChannelConnections");

const getSiteWideDiscussionList = require("./customResolvers/queries/getSiteWideDiscussionList");

const addEmojiToComment = require("./customResolvers/mutations/addEmojiToComment");
const removeEmojiFromComment = require("./customResolvers/mutations/removeEmojiFromComment");
const addEmojiToDiscussionChannel = require("./customResolvers/mutations/addEmojiToDiscussionChannel");
const removeEmojiFromDiscussionChannel = require("./customResolvers/mutations/removeEmojiFromDiscussionChannel");

module.exports = function (driver) {
  const ogm = new OGM({
    typeDefs,
    driver,
  });

  const Discussion = ogm.model("Discussion");
  const DiscussionChannel = ogm.model("DiscussionChannel");
  const Event = ogm.model("Event");
  const Comment = ogm.model("Comment");

  const resolvers = {
    JSON: GraphQLJSON,
    Query: {
      getSiteWideDiscussionList: getSiteWideDiscussionList({
        Discussion,
        driver,
      }),
    },
    Mutation: {
      createDiscussionWithChannelConnections:
        createDiscussionWithChannelConnections({
          Discussion,
          driver,
        }),
      updateDiscussionWithChannelConnections:
        updateDiscussionWithChannelConnections({
          Discussion,
          driver,
        }),
      updateDiscussionChannelUpvoteCount: updateDiscussionChannelUpvoteCount({
        DiscussionChannel,
        driver,
      }),
      createEventWithChannelConnections: createEventWithChannelConnections({
        Event,
        driver,
      }),
      updateEventWithChannelConnections: updateEventWithChannelConnections({
        Event,
        driver,
      }),
      addEmojiToComment: addEmojiToComment({
        Comment,
        driver,
      }),
      removeEmojiFromComment: removeEmojiFromComment({
        Comment,
        driver,
      }),
      addEmojiToDiscussionChannel: addEmojiToDiscussionChannel({
        DiscussionChannel,
        driver,
      }),
      removeEmojiFromDiscussionChannel: removeEmojiFromDiscussionChannel({
        DiscussionChannel,
        driver,
      }),
    },
  };
  return {
    resolvers,
    ogm,
  };
};
