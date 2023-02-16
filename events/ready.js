const { Events } = require("discord.js");
const { google } = require("googleapis");

module.exports = {
  name: Events.ClientReady,
  once: true,
  async execute(client) {
    console.log(`Ready! Logged in as ${client.user.tag}`);
    client.user.setActivity("[테스트]");

    const Guilds = client.guilds.cache.map((guild) => guild);
    // console.log(Guilds);

    async function fetchMembers() {
      const a = await Guilds[0].members.fetch().catch(console.error);
      const b = a.filter((u) => u.user.bot == false);
      return b;
    }
    const user = await fetchMembers();
    const userIds = user.map((u) => u.id);
    const userNickname = user.map((u) => u.nickname);
    const userName = user.map((u) => u.user.username);
    const userDiscriminator = user.map((u) => u.user.discriminator);
    const userList = [];

    for (let i = 0; i < userIds.length; i++) {
      userList.push({
        id: userIds[i],
        nickname: userNickname[i],
        username: userName[i] + "#" + userDiscriminator[i],
      });
    }
    const auth = new google.auth.GoogleAuth({
      keyFile: "credentials.json",
      scopes: "https://www.googleapis.com/auth/spreadsheets",
    });
    const spreadsheetId = "1orKyVU_49p3Tz-FbEHzp5CoigyAGx1xnFCe13EfCRmk";
    const SheetClient = await auth.getClient();
    const googleSheets = google.sheets({ version: "v4", auth: SheetClient });
    const row = await googleSheets.spreadsheets.values.update({
      auth,
      spreadsheetId,
      range: "시트1!" + "A1",
      resource: { values: "asdsddddd" },
    });
    const value = row.data.values;
    console.log(value);
  },
};
