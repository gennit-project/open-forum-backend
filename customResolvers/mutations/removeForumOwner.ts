import type { ChannelUpdateInput, ChannelModel } from "../../ogm_types.js";

type Args = {
  username: string;
  channelUniqueName: string;
};

type Input = {
  Channel: ChannelModel;
};

const getResolver = (input: Input) => {
  const { Channel } = input;
  return async (parent: any, args: Args, context: any, resolveInfo: any) => {
    const { channelUniqueName, username } = args;

    if (!channelUniqueName || !username) {
      throw new Error(
        "All arguments (channelUniqueName, username) are required"
      );
    }

    const channelUpdateInput: ChannelUpdateInput = {
      Admins: [
        {
          disconnect: [
            {
              where: {
                node: {
                  username: username,
                },
              },
            },
          ],
        },
      ],
    };

    try {
      const result = await Channel.update({
        where: {
          uniqueName: channelUniqueName,
        },
        update: channelUpdateInput,
      });
      if (!result.channels[0]) {
        throw new Error("Channel not found");
      }
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  };
};

export default getResolver;
