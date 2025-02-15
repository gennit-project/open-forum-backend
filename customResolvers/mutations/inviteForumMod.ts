import type {
  ChannelUpdateInput,
  ChannelModel,
  UserUpdateInput,
  UserModel,
} from "../../ogm_types.js";

type Args = {
  inviteeUsername: string;
  channelUniqueName: string;
};

type Input = {
  Channel: ChannelModel;
  User: UserModel;
};

const getResolver = (input: Input) => {
  const { Channel, User } = input;
  return async (parent: any, args: Args, context: any, resolveInfo: any) => {
    const { channelUniqueName, inviteeUsername } = args;

    if (!channelUniqueName || !inviteeUsername) {
      throw new Error(
        "All arguments (channelUniqueName, username) are required"
      );
    }

    const notificationMessage = `
You have been invited to be an mod of the forum ${channelUniqueName}.
To accept it, go to [this page](${process.env.FRONTEND_URL}/forums/${channelUniqueName}/accept-invite).
    `;

    const channelUpdateInput: ChannelUpdateInput = {
      PendingModInvites: [
        {
          connect: [
            {
              where: {
                node: {
                  username: inviteeUsername,
                },
              },
            },
          ],
        },
      ],
    };

    const userUpdateNotificationInput: UserUpdateInput = {
      Notifications: [
        {
          create: [
            {
              node: {
                text: notificationMessage,
                read: false
              },
            },
          ],
        },
      ],
    };

    try {
      const channelUpdateResult = await Channel.update({
        where: {
          uniqueName: channelUniqueName,
        },
        update: channelUpdateInput,
      });
      if (!channelUpdateResult.channels[0]) {
        throw new Error("Could not invite user.");
      }
      const userUpdateResult = await User.update({
        where: {
          username: inviteeUsername,
        },
        update: userUpdateNotificationInput,
      })
      if (!userUpdateResult.users[0]) {
        throw new Error("Could not notify the user of the invite.");
      }
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  };
};

export default getResolver;
