const { OGM } = require("@neo4j/graphql-ogm");
const typeDefs = require("./typeDefs");
const GraphQLJSON = require('graphql-type-json');
const createDiscussionWithChannelConnections = require("./customResolvers/mutations/createDiscussionWithChannelConnections");
const updateDiscussionWithChannelConnections = require("./customResolvers/mutations/updateDiscussionWithChannelConnections");

const createEventWithChannelConnections = require("./customResolvers/mutations/createEventWithChannelConnections");
const updateEventWithChannelConnections = require("./customResolvers/mutations/updateEventWithChannelConnections");

const getSiteWideDiscussionList = require("./customResolvers/queries/getSiteWideDiscussionList");
const getCommentSection = require("./customResolvers/queries/getCommentSection");
const getDiscussionsInChannel = require("./customResolvers/queries/getDiscussionsInChannel");

const addEmojiToComment = require("./customResolvers/mutations/addEmojiToComment");
const removeEmojiFromComment = require("./customResolvers/mutations/removeEmojiFromComment");
const addEmojiToDiscussionChannel = require("./customResolvers/mutations/addEmojiToDiscussionChannel");
const removeEmojiFromDiscussionChannel = require("./customResolvers/mutations/removeEmojiFromDiscussionChannel");

const upvoteComment = require("./customResolvers/mutations/upvoteComment");
const undoUpvoteComment = require("./customResolvers/mutations/undoUpvoteComment");
const upvoteDiscussionChannel = require("./customResolvers/mutations/upvoteDiscussionChannel");
const undoUpvoteDiscussionChannel = require("./customResolvers/mutations/undoUpvoteDiscussionChannel");

module.exports = function (driver) {
  const ogm = new OGM({
    typeDefs,
    driver,
  });

  const Discussion = ogm.model("Discussion");
  const DiscussionChannel = ogm.model("DiscussionChannel");
  const Event = ogm.model("Event");
  const Comment = ogm.model("Comment");
  const User = ogm.model("User")

  const resolvers = {
    JSON: GraphQLJSON,
    CommentAuthor: {
      __resolveType(obj, context, info) {
        if(obj.username) {
          return 'User';
        }
      },
    },
    Query: {
      getSiteWideDiscussionList: getSiteWideDiscussionList({
        Discussion,
        driver,
      }),
      getCommentSection: getCommentSection({
        driver,
        DiscussionChannel,
        Comment,
      }),
      getDiscussionsInChannel: getDiscussionsInChannel({
        driver,
        DiscussionChannel,
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
      }),
      removeEmojiFromComment: removeEmojiFromComment({
        Comment,
      }),
      addEmojiToDiscussionChannel: addEmojiToDiscussionChannel({
        DiscussionChannel,
      }),
      removeEmojiFromDiscussionChannel: removeEmojiFromDiscussionChannel({
        DiscussionChannel,
      }),
      upvoteComment:  upvoteComment({
        Comment,
        User,
        driver,
      }),
      undoUpvoteComment: undoUpvoteComment({
        Comment,
        User,
        driver,
      }),
      upvoteDiscussionChannel: upvoteDiscussionChannel({
        DiscussionChannel,
        User,
        driver,
      }),
      undoUpvoteDiscussionChannel: undoUpvoteDiscussionChannel({
        DiscussionChannel,
        User,
        driver,
      }),
    },
  };
  return {
    resolvers,
    ogm,
  };
};
