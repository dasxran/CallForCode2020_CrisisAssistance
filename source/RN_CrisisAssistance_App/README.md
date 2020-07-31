# Crisis Assistant BOT - React Native app

Open the `App.js` file to start from. You can preview the changes directly on your phone or tablet by clicking the **Run** button or use the simulator by clicking **Tap to Play**. When you're done, click **Save** and share the link!

When you're ready to see everything that React provides (or if you want to use your own editor) you can **Export** your project and use it with [react-cli](https://reactnative.dev/docs/getting-started).

Google Cloud Service API Keys can be updated in the app.json config file.

```	
    "android": {
      ...
      "config": {
        "googleMaps": {
          "apiKey": "***************************************"
        }
      }
    },
    "extra": {
      ...
      "google": {
        ...
        "cse_engineID": "*********************************",
        "cse_apiKey": "***************************************"
      }
    }
```	
	
*API Keys can be generated from [Google Developer console](https://console.developers.google.com/apis)


IBM Cloud Service endpoints can be updated in the app.json config file.

```	
    "extra": {
      "node_red": {
        "endpoints": {
          "assistant": "https://node-red-crisis-assistant.eu-gb.mybluemix.net/assistant/",
          "audio_upload": "https://node-red-crisis-assistant.eu-gb.mybluemix.net/upload_post",
          "marker_count": "https://node-red-crisis-assistant.eu-gb.mybluemix.net/marker_count"
        }
      },
      ...
    }
```	

This app has an APK with version code 2 that requests the following permission(s): android.permission.LOCATION, android.permission.RECORD_AUDIO. Apps using these permissions in an APK are required to have a privacy policy set and it is available [here](https://www.privacypolicygenerator.info/live.php?token=FvSONgO5i3JOPbBvpdsLvhDq4DSD8X3R).
