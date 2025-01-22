import type { ChannelUpdateInput, ChannelModel } from "../../ts_emitted/ogm-types";

type Args = {
  modDisplayName: string;
  channelUniqueName: string;
};

type Input = {
  Channel: ChannelModel;
};

const getResolver = (input: Input) => {
  const { Channel } = input;
  return async (parent: any, args: Args, context: any, resolveInfo: any) => {
    const { channelUniqueName, modDisplayName } = args;

    if (!channelUniqueName || !modDisplayName) {
      throw new Error(
        "All arguments (channelUniqueName, inviteeUsername) are required"
      );
    }

    const channelUpdateInput: ChannelUpdateInput = {
      Moderators: [
        {
          disconnect: [
            {
              where: {
                node: {
                  displayName: modDisplayName,
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
