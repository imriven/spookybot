import ZwiftAccount from "zwift-mobile-api";
import config from "../config/appConfig.js";

export default function ZwiftClient() {
  return new ZwiftAccount(`${config.zwiftUsername}`, `${config.zwiftPassword}`);
}

export async function zwiftTimer(zwiftClient, discordClient, state) {
  const profile = await zwiftClient.getProfile(config.zwiftId).profile()

  if (profile.currentActivityId) {
    console.log(profile)
    if (state.currentActivityId === profile.currentActivityId) {
      return;
    }
    console.log(profile.currentActivityId)
    state.currentActivityId = profile.currentActivityId;
    zwiftClient.getActivity((config.zwiftId)).getActivity(profile.currentActivityId).then(activity => {
      discordClient.channels.fetch(config.discordZwiftChannelId).then(channel => {
        channel.send(`Christina is working out on zwift in ${worldMap[activity.worldID].name} ${worldMap[activity.worldID].url}`)
      })
    })

  } else {
    if (state.currentActivityId != null) {
      const channel = await discordClient.channels.fetch(config.discordZwiftChannelId)
      await channel.send("Christina stopped working out on zwift")
      state.currentActivityId = null;
    }
  }

}