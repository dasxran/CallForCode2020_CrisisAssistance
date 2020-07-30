// Google Custom Search API documentation:
// https://developers.google.com/custom-search/docs/tutorial/introduction

import Constants from "expo-constants";

GoogleSearch = async (input) => {
  let encodedValue = encodeURIComponent(input);
  if (
    global.region.place[0].country &&
    (input.includes("my location") ||
      input.includes("my place") ||
      input.includes("near me") ||
      input.includes("around me") ||
      input.includes("nearby"))
  ) {
    input = input.replace("my location", "");
    input = input.replace("my place", "");
    input = input.replace("near me", "");
    input = input.replace("around me", "");
    input = input.replace("nearby", "");

    encodedValue = encodeURIComponent(
      input +
        " " +
        global.region.place[0].city +
        " " +
        global.region.place[0].region
      // + " " +
      // global.region.place[0].name
    );
  }

  // console.log(decodeURIComponent(encodedValue));

  let googleCustomSearchParams =
    "&cr=country" +
    global.region.place[0].isoCountryCode +
    "&gl=" +
    global.region.place[0].isoCountryCode.toLowerCase() +
    "&cx=" +
    Constants.manifest.extra.google.cse_engineID +
    "&key=" +
    Constants.manifest.android.config.googleMaps.apiKey +
    "&q=" +
    encodedValue;

  const searchRes = await fetch(
    Constants.manifest.extra.google.endpoints.custom_search +
      googleCustomSearchParams
  )
    .then((response) => response.json())
    .then((json) => {
      return json;
    })
    .catch((error) => {
      console.error(error);
    });

  return searchRes;
};

module.exports = {
  GoogleSearch,
};
