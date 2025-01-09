type Input = {
  driver: any;
};

const DEFAULT_LIMIT = "25";
const DEFAULT_OFFSET = "0";

const getSortedChannelsResolver = (input: Input) => {
  const { driver } = input;

  return async (_parent: any, args: any, _context: any) => {
    const limit = args.limit || DEFAULT_LIMIT;
    const offset = args.offset || DEFAULT_OFFSET;
    const tags = args.tags || [];
    const searchInput = args.searchInput || "";
    const session = driver.session();

    try {
      const result = await session.run(
        `
        // Match channels that match the search input
        MATCH (c:Channel)
        WHERE $searchInput = "" 
          OR toLower(c.uniqueName) CONTAINS toLower($searchInput)
          OR toLower(c.description) CONTAINS toLower($searchInput)
        
        // Optional match to tags for filtering
        OPTIONAL MATCH (c)-[:HAS_TAG]->(t:Tag)
        WITH c, COLLECT(DISTINCT t) AS tags
        WHERE SIZE($tags) = 0 OR ANY(tag IN tags WHERE tag.text IN $tags)
        
        // Count valid DiscussionChannels
        CALL {
          WITH c
          MATCH (c)<-[:POSTED_IN_CHANNEL]-(dc:DiscussionChannel)
          WHERE EXISTS((dc)-[:POSTED_IN_CHANNEL]->(:Discussion))
          RETURN COUNT(DISTINCT dc) AS validDiscussionChannelsCount
        }
        
        // Count EventChannels
        CALL {
          WITH c
          MATCH (c)<-[:POSTED_IN_CHANNEL]-(ec:EventChannel)
          WHERE EXISTS((ec)-[:POSTED_IN_CHANNEL]->(:Event))
          RETURN COUNT(DISTINCT ec) AS eventChannelsCount
        }
        
        // Collect tags again for the final output
        WITH c, tags, validDiscussionChannelsCount, eventChannelsCount
        
        // Order and paginate
        ORDER BY validDiscussionChannelsCount DESC
        SKIP toInteger($offset)
        LIMIT toInteger($limit)
        
        // Return the results
        RETURN {
          uniqueName: c.uniqueName,
          displayName: c.displayName,
          channelIconURL: c.channelIconURL,
          description: c.description,
          Tags: [tag IN tags | { text: tag.text }],
          EventChannelsAggregate: { count: eventChannelsCount },
          DiscussionChannelsAggregate: { count: validDiscussionChannelsCount }
        } AS channel
        `,
        {
          limit,
          offset,
          tags,
          searchInput,
        }
      );

      const channels = result.records.map((record: any) =>
        record.get("channel")
      );
      return channels;
    } catch (error) {
      console.error("Error fetching sorted channels:", error);
      throw new Error("Failed to fetch sorted channels");
    } finally {
      await session.close();
    }
  };
};

export default getSortedChannelsResolver;
