MATCH (dc:DiscussionChannel { id: $discussionChannelId })-[:CONTAINS_COMMENT]->(c:Comment)
WHERE c.isRootComment = true

OPTIONAL MATCH (c)<-[:AUTHORED_COMMENT]-(author:User)
OPTIONAL MATCH (c)-[:IS_REPLY_TO]->(parent:Comment)
OPTIONAL MATCH (c)<-[:IS_REPLY_TO]-(child:Comment)
OPTIONAL MATCH (c)<-[:UPVOTED_COMMENT]-(upvoter:User)
OPTIONAL MATCH (c)<-[:HAS_FEEDBACK_COMMENT]-(feedbackComment:Comment)

WITH c, author, parent,
     COLLECT(DISTINCT upvoter{.*, createdAt: toString(upvoter.createdAt)}) AS UpvotedByUsers, 
     COLLECT(DISTINCT parent.id) AS parentIds,
     COLLECT(DISTINCT feedbackComment {id: feedbackComment.id}) AS FeedbackComments,
     COLLECT(DISTINCT CASE WHEN child IS NOT NULL THEN {id: child.id, text: child.text} ELSE null END) AS NonFilteredChildComments,
     // Compute the age in months from the createdAt timestamp.
     duration.between(c.createdAt, datetime()).months + 
     duration.between(c.createdAt, datetime()).days / 30.0 AS ageInMonths,
     CASE WHEN coalesce(c.weightedVotesCount, 0) < 0 THEN 0 ELSE coalesce(c.weightedVotesCount, 0) END AS weightedVotesCount

WITH c, author, parent, UpvotedByUsers, parentIds, weightedVotesCount, ageInMonths,
    [comment IN NonFilteredChildComments WHERE comment.id IS NOT NULL] AS ChildComments,
    FeedbackComments

WITH c, author, parent, UpvotedByUsers, parentIds, ChildComments, FeedbackComments, ageInMonths, weightedVotesCount,
    10000 * log10(weightedVotesCount + 1) / ((ageInMonths + 2) ^ 1.8) AS hotRank

RETURN {
    id: c.id,
    text: c.text,
    emoji: c.emoji,
    weightedVotesCount: c.weightedVotesCount,
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
    CommentAuthor: {
        username: author.username,
        displayName: author.displayName,
        profilePicURL: author.profilePicURL,
        discussionKarma: author.discussionKarma,
        commentKarma: author.commentKarma,
        createdAt: author.createdAt
    },
    ParentComment: CASE WHEN SIZE(parentIds) > 0 THEN {id: parentIds[0]} ELSE null END,
    UpvotedByUsers: UpvotedByUsers,
    UpvotedByUsersAggregate: {
        count: SIZE(UpvotedByUsers)
    },
    ChildComments: CASE WHEN SIZE(ChildComments) > 0 THEN ChildComments ELSE [] END,
    ChildCommentsAggregate: {
        count: SIZE(ChildComments)
    },
    FeedbackComments: FeedbackComments
} AS comment, weightedVotesCount, hotRank

ORDER BY 
    CASE WHEN $sortOption = "top" THEN weightedVotesCount END DESC,
    CASE WHEN $sortOption = "hot" THEN hotRank END DESC,
    c.createdAt DESC
SKIP toInteger($offset)
LIMIT toInteger($limit)
