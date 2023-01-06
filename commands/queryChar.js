const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { google } = require("googleapis");
const fetch = require("node-fetch");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ㅁ")
    .setDescription("닉네임을 검색합니다")
    .addStringOption((option) =>
      option
        .setName("닉네임")
        .setDescription("을 정확히 입력해 주세요 (대소문자구분)")
    ),
  async execute(interaction) {
    await interaction.deferReply();
    const inputName = interaction.options.getString("닉네임");
    const fetchedUserData = await fetchCharInfo(inputName);

    const auth = new google.auth.GoogleAuth({
      keyFile: "credentials.json",
      scopes: "https://www.googleapis.com/auth/spreadsheets",
    });
    const spreadsheetId = "1gYG9kbotJA1RHtjL3JenjWklBgXlJ1INeeW74J_rBgQ";
    const client = await auth.getClient();
    const googleSheets = google.sheets({ version: "v4", auth: client });
    const nameRow = await getRow("J:J");

    // nameRow 안의 공백을 제거하는 함수
    const checkIsOurCrew = nameRow.reduce(function (acc, cur) {
      return acc.concat(cur);
    });

    //'아만' 서버인 캐릭터 이름들 리스트만들기
    function filterUserDataByAman(UserData) {
      const result = UserData.filter(
        (UserData) => UserData.ServerName == "아만"
      );
      return result;
    }
    // 그 리스트의 이름과 스프레드시트 인덱스번호 저장 ex {name:여우가야옹,index:7}...
    function getIndexOfUserData(inputName) {
      const target = [`${inputName}`];
      const result = nameRow.findIndex((doll) => {
        return doll.some((item) => {
          return target.includes(item);
        });
      });
      return result;
    }

    // 닉네임이 유효한지 boolean으로 판별
    async function isValidInput(input) {
      const pattern = /[~!@#$%^&*()_+|<>?:{}]/;
      var isTrue;

      if (
        fetchedUserData !== null &&
        !pattern.test(input) &&
        checkIsOurCrew.indexOf(input) !== -1
      ) {
        isTrue = true;
      } else {
        isTrue = false;
      }
      return !!isTrue;
    }

    // 구글시트에서 인수 rng의 범위만큼 단일셀을 가져옴
    async function getRow(rng) {
      const row = await googleSheets.spreadsheets.values.get({
        auth,
        spreadsheetId,
        range: "체크!" + rng,
      });
      const value = row.data.values;
      return value;
    }
    // fetch api를 이용하여 인수(String)의 전투정보실 정보를 받아와 Array로 반환하는 함수
    async function fetchCharInfo(charName) {
      try {
        const url =
          "https://developer-lostark.game.onstove.com/characters/" +
          charName +
          "/siblings";
        const response = await fetch(url, {
          method: "GET",
          mode: "cors",
          cache: "no-cache",
          credentials: "same-origin",
          headers: {
            accept: "application/json",
            authorization:
              "bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsIng1dCI6IktYMk40TkRDSTJ5NTA5NWpjTWk5TllqY2lyZyIsImtpZCI6IktYMk40TkRDSTJ5NTA5NWpjTWk5TllqY2lyZyJ9.eyJpc3MiOiJodHRwczovL2x1ZHkuZ2FtZS5vbnN0b3ZlLmNvbSIsImF1ZCI6Imh0dHBzOi8vbHVkeS5nYW1lLm9uc3RvdmUuY29tL3Jlc291cmNlcyIsImNsaWVudF9pZCI6IjEwMDAwMDAwMDAwMTkwMDUifQ.Ra3MGPEnAqhAfT2F5bAJUIXGVmx8IIAw3Gn1dlWLgl7Kv0vkf6EODgl4e8q0URjzICDBKC2jpK8ccY3P8IVh8CJFxYZV4AyhIMZmFwe-7VNHlVo33g4ZOkUhGXuNoGgUhrgL2pyJARB2QY6p40dPImJq45VnVruaApkYaPANxQUv0mKR6o_uu1MNOEj660Iz_1oJqpI_Xu0Kk-LBm4pHFgnJ7jWgeKJ4jmnIBvs8NSJTKLt-_HVPOWZ_e5vAUc0KiJA6de6YQ3OCUHpSc0Q4dpw5TJzVp3dWMDFewq-sb3xcdn0jR9Bq-9YwVzIzlbwFMEZaL55O0E2CVjqwhhPx7A",
          },
          redirect: "follow",
          referrerPolicy: "no-referrer",
        });
        const data = await response.json();

        return data;
      } catch (e) {
        console.log(`Error 🙄::${e}`);
      }
    }

    function noticeByBOT(reasonOfError) {
      interaction.editReply(reasonOfError);
    }
    function setEmbed() {
      const embed = new EmbedBuilder()
        .setTimestamp()
        .setColor(0x0099ff)
        .setAuthor({
          name: "✔ LYCAN CALENDAR",
          url: "https://docs.google.com/spreadsheets/d/1gYG9kbotJA1RHtjL3JenjWklBgXlJ1INeeW74J_rBgQ/edit#gid=171582323",
        });

      return embed;
    }
    // 로아data에서 아만서버만 추출, 그중에서 sheet에 있는 캐릭터들만 정리하여 index순으로 정렬하는 함수
    async function processUserData() {
      const processedUserData = [];
      filterUserDataByAman(fetchedUserData).forEach((element) => {
        processedUserData.push({
          name: element.CharacterName,
          level: element.ItemAvgLevel,
          index: getIndexOfUserData(element.CharacterName) + 1,
        });
      });

      var UserDataSortedbyIndex = processedUserData
        .filter((UserData) => UserData.index > 0)
        .slice(0);
      UserDataSortedbyIndex.sort(function (a, b) {
        return a.index - b.index;
      });
      return UserDataSortedbyIndex;
    }
    async function checkBooleanCommander(arg) {
      const userData = arg;
      const arr = [];
      for (i = 0; i < userData.length; i++) {
        arr.push(userData[i].index);
      }
      let min = Math.min(...arr);
      let max = Math.max(...arr);
      const cells = await getRow("T" + min + ":" + "AD" + max);
      return cells;
    }
    function CommaderStatusStringlyfy(commander, boolean) {
      switch (boolean) {
        case "TRUE":
          return `${commander}✅ `;
        case "FALSE":
          return "";
        case undefined:
          return "";
        case "":
          return "";
      }
    }

    async function main() {
      if (await isValidInput(inputName)) {
        const userData = await processUserData();
        const commaderStatus = await checkBooleanCommander(userData);
        const embed = setEmbed();
        function grouperCheckedCommander(indexRow) {
          const indexCol = [0, 2, 4, 8, 10];
          const commaderName = [
            "발탄",
            "비아키스",
            "쿠크세이튼",
            "아브렐슈드",
            "일리아칸",
          ];
          userData[j].Checked = [];
          userData[j].Non_checked = [];

          for (i = 0; i < indexCol.length; i++) {
            const value = commaderStatus[indexRow][indexCol[i]];
            switch (value) {
              case "TRUE":
                userData[j].Checked.push({ [commaderName[i]]: value });
                break;
              case "FALSE":
                userData[j].Non_checked.push({ [commaderName[i]]: value });
                break;
              case undefined:
                break;
              case "":
                break;
            }
          }
        }
        function remainingCommanderCheck(userData) {
          const remainingArray = [];
          const arr = userData.Non_checked.reverse();

          switch (userData.Checked.length) {
            case 0:
              try {
                for (i = 0; i < 3; i++) {
                  remainingArray.push(Object.keys(arr[i]));
                }
              } catch (e) {
                console.log(e);
              }
              break;
            case 1:
              try {
                for (i = 0; i < 2; i++) {
                  remainingArray.push(Object.keys(arr[i]));
                }
              } catch (e) {
                console.log(e);
              }
              break;
            case 2:
              try {
                for (i = 0; i < 1; i++) {
                  remainingArray.push(Object.keys(arr[i]));
                }
              } catch (e) {
                console.log(e);
              }
              break;
          }
          return remainingArray.join();
        }

        for (j = 0; j < commaderStatus.length; j++) {
          grouperCheckedCommander(j);
          if (j == 0) {
            embed
              .setDescription(
                "```ansi" +
                  "\n" +
                  "[1;35m឵ " +
                  "Lv." +
                  userData[0].level +
                  "[0;35m឵ " +
                  "@아만" +
                  "[0m" +
                  "\r" +
                  "\u00a0" +
                  "[0;36m" +
                  CommaderStatusStringlyfy("발탄", commaderStatus[0][0]) +
                  CommaderStatusStringlyfy("비아키스", commaderStatus[0][2]) +
                  CommaderStatusStringlyfy("쿠크세이튼", commaderStatus[0][4]) +
                  CommaderStatusStringlyfy("아브렐슈드", commaderStatus[0][8]) +
                  CommaderStatusStringlyfy("일리아칸", commaderStatus[0][10]) +
                  "[0;36m" +
                  "[0m" +
                  "\r" +
                  "\u00a0" +
                  "-남은 군단장: " +
                  remainingCommanderCheck(userData[j]) +
                  "```"
              )
              .setTitle(userData[0].name)
              .setURL(
                `https://lostark.game.onstove.com/Profile/Character/${userData[0].name}`
              );
          } else {
            embed.addFields({
              name: "**" + userData[j].name + "**",
              value:
                "```ansi" +
                "\n" +
                "\u00a0" +
                "[1;0m" +
                "lv." +
                userData[j].level +
                "[1;0m" +
                "[0m" +
                "\r" +
                "\u00a0" +
                "[0;36m" +
                CommaderStatusStringlyfy("발탄", commaderStatus[j][0]) +
                CommaderStatusStringlyfy("비아키스", commaderStatus[j][2]) +
                CommaderStatusStringlyfy("쿠크세이튼", commaderStatus[j][4]) +
                CommaderStatusStringlyfy("아브렐슈드", commaderStatus[j][8]) +
                CommaderStatusStringlyfy("일리아칸", commaderStatus[j][10]) +
                "[0;36m" +
                "[0m" +
                "\r" +
                "\u00a0" +
                "-남은 군단장: " +
                remainingCommanderCheck(userData[j]) +
                "```",
            });
          }
        }
        await interaction.editReply({ embeds: [embed] });
      } else {
        return noticeByBOT(
          "```ansi" +
            "\n" +
            "검색한 닉네임" +
            "[1;35m឵ " +
            `[${inputName}]` +
            "[0m" +
            "이 유효한 닉네임이 아닌 것 같아 검색을 하지 않았어요. \n12글자 이하인지, 특수문자가 들어갔는지는 않았는지 확인해주세요." +
            "```"
        );
      }
    }

    main();
  },
};
