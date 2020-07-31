// Watson Assistant API documentation:
// https://console.bluemix.net/apidocs/assistant

import Constants from "expo-constants";
import { GoogleSearch } from "./GoogleSearch";

MessageRequest = async (input, context = {}) => {
  let body = {
    alternate_intents: true,
    input: {
      text: input,
    },
  };
  if (context) {
    body.context = context;
  }

  const assistantRes = await fetch(
    Constants.manifest.extra.node_red.endpoints.assistant,
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: input.toLowerCase(),
        latitude: global.region.latitude,
        longitude: global.region.longitude,
        user: Constants.sessionId,
      }),
    }
  )
    .then((response) => response.json())
    .then((json) => {
      return json;
    })
    .catch((error) => {
      console.error(error);
    });

  let output = assistantRes.output.text.join(" ");

  // if Watson assistant have no result
  if (
    output.includes("I don't know the answer to that yet") ||
    output.includes("Did you mean") ||
    output.includes("You seem to be asking about") ||
    output.includes("I think you were asking about") ||
    output.includes("I could not find any thing") ||
    output.includes("What location (Country/Country Code/US State)")
  ) {
    let searchRes = await GoogleSearch(input);

    // console.log(JSON.stringify(searchRes));

    if (
      searchRes.searchInformation.totalResults !== undefined &&
      searchRes.searchInformation.totalResults !== "0"
    ) {
      let snippet = searchRes.items[0].snippet;

      // console.log(snippet);

      if (snippet.includes("...")) {
        if (!isNaN(Date.parse(snippet.split("...")[0]))) {
          snippet = snippet.split("...")[1];
        }
      }

      assistantRes.output.text[0] =
        snippet + " .Details can be found here.. " + searchRes.items[0].link;
    } else {
      assistantRes.output.text[0] = "I am sorry.. I couldn't get it.";
    }

    return assistantRes;
  } else {
    return assistantRes;
  }
};

module.exports = {
  MessageRequest,
};
