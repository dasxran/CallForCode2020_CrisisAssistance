import React from "react";
import {
  Dimensions,
  Image,
  TouchableOpacity,
  StyleSheet,
  Text,
  TouchableHighlight,
  View,
} from "react-native";
import { Asset } from "expo-asset";
import { Audio } from "expo-av";
import * as FileSystem from "expo-file-system";
import * as Font from "expo-font";
import * as Permissions from "expo-permissions";
import * as Speech from "expo-speech";
import Constants from "expo-constants";
import { BarIndicator, DotIndicator } from "react-native-indicators";
import { MaterialIcons } from "@expo/vector-icons";
import { GoogleSearch } from "./GoogleSearch";
import DialogInput from "react-native-dialog-input";

const BACKGROUND_COLOR = "#FFF8ED";
const LIVE_COLOR = "#FF0000";
const DISABLED_OPACITY = 0.3;

export default class Record extends React.Component {
  constructor(props) {
    super(props);
    this.recording = null;
    this.sound = null;
    this.isSeeking = false;
    this.shouldPlayAtEndOfSeek = false;
    this.state = {
      haveRecordingPermissions: false,
      isLoading: false,
      isPlaybackAllowed: false,
      muted: false,
      soundPosition: null,
      soundDuration: null,
      recordingDuration: null,
      shouldPlay: false,
      isPlaying: false,
      isRecording: false,
      fontLoaded: false,
      shouldCorrectPitch: true,
      volume: 1.0,
      rate: 1.0,
      isSearching: false,
      isDialogVisible: false,
      strDialogInput: "",
      isBotSpeaking: false,
    };
    this.recordingSettings = JSON.parse(
      JSON.stringify(Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY)
    );
    // // UNCOMMENT THIS TO TEST maxFileSize:
    // this.recordingSettings.android['maxFileSize'] = 12000;
  }

  componentDidMount() {
    (async () => {
      await Font.loadAsync({
        "cutive-mono-regular": require("../../assets/fonts/CutiveMono-Regular.ttf"),
      });
      this.setState({ fontLoaded: true });
    })();
    this._getAudioPermissions();
  }

  _getAudioPermissions = async () => {
    const response = await Permissions.getAsync(Permissions.AUDIO_RECORDING);
    this.setState({
      haveRecordingPermissions: response.status === "granted",
    });
  };

  _updateScreenForSoundStatus = (status) => {
    if (status.isLoaded) {
      this.setState({
        soundDuration: status.durationMillis,
        soundPosition: status.positionMillis,
        shouldPlay: status.shouldPlay,
        isPlaying: status.isPlaying,
        rate: status.rate,
        muted: status.isMuted,
        volume: status.volume,
        shouldCorrectPitch: status.shouldCorrectPitch,
        isPlaybackAllowed: true,
      });
    } else {
      this.setState({
        soundDuration: null,
        soundPosition: null,
        isPlaybackAllowed: false,
      });
      if (status.error) {
        console.log(`FATAL PLAYER ERROR: ${status.error}`);
      }
    }
  };

  _updateScreenForRecordingStatus = (status) => {
    if (status.canRecord) {
      this.setState({
        isRecording: status.isRecording,
        recordingDuration: status.durationMillis,
      });
    } else if (status.isDoneRecording) {
      this.setState({
        isRecording: false,
        recordingDuration: status.durationMillis,
      });
      if (!this.state.isLoading) {
        this._stopRecordingAndEnablePlayback();
      }
    }
  };

  async _stopPlaybackAndBeginRecording() {
    this.setState({
      isLoading: true,
    });
    if (this.sound !== null) {
      await this.sound.unloadAsync();
      this.sound.setOnPlaybackStatusUpdate(null);
      this.sound = null;
    }
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
      interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
      playThroughEarpieceAndroid: false,
      staysActiveInBackground: true,
    });
    if (this.recording !== null) {
      this.recording.setOnRecordingStatusUpdate(null);
      this.recording = null;
    }

    const recording = new Audio.Recording();
    await recording.prepareToRecordAsync(this.recordingSettings);
    recording.setOnRecordingStatusUpdate(this._updateScreenForRecordingStatus);

    this.recording = recording;
    await this.recording.startAsync(); // Will call this._updateScreenForRecordingStatus to update the screen.
    this.setState({
      isLoading: false,
    });
  }

  async _stopRecordingAndEnablePlayback() {
    this.setState({
      isLoading: true,
      isSearching: true,
    });
    try {
      await this.recording.stopAndUnloadAsync();
    } catch (error) {
      // Do nothing -- we are already unloaded.
    }
    const info = await FileSystem.getInfoAsync(this.recording.getURI());
    // console.log(`FILE INFO: ${JSON.stringify(info)}`);

    try {
      const uri = info.uri;
      const formData = new FormData();
      formData.append("file", {
        uri,
        type: "audio/m4a",
        name: "voice",
      });
      formData.append("latitude", global.region.latitude);
      formData.append("longitude", global.region.longitude);
      formData.append("user", Constants.sessionId);

      const response = await fetch(
        Constants.manifest.extra.node_red.endpoints.audio_upload,
        {
          method: "POST",
          body: formData,
        }
      );
      const assistantRes = await response.json();
      // console.log(assistantRes);

      let output = assistantRes.output.text.join(" ");
      if (
        output.includes("I don't know the answer to that yet") ||
        output.includes("Did you mean") ||
        output.includes("You seem to be asking about") ||
        output.includes("I think you were asking about") ||
        output.includes("I could not find any thing") ||
        output.includes("What location (Country/Country Code/US State)")
      ) {
        let searchRes = await GoogleSearch(assistantRes.input.text);

        if (searchRes.searchInformation.totalResults != "0") {
          let snippet = searchRes.items[0].snippet;

          if (snippet.includes("...")) {
            if (!isNaN(Date.parse(snippet.split("...")[0]))) {
              snippet = snippet.split("...")[1];
            }
          }

          assistantRes.output.text[0] =
            snippet +
            " .Details can be found here.. " +
            searchRes.items[0].link;
        } else {
          assistantRes.output.text[0] = "I am sorry.. I couldn't get it.";
        }
      }

      this.addMessage(assistantRes);
    } catch (error) {
      console.log("There was an error", error);
    }

    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
      playsInSilentModeIOS: true,
      playsInSilentLockedModeIOS: true,
      shouldDuckAndroid: true,
      interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
      playThroughEarpieceAndroid: false,
      staysActiveInBackground: true,
    });
    const { sound, status } = await this.recording.createNewLoadedSoundAsync(
      {
        isLooping: true,
        isMuted: this.state.muted,
        volume: this.state.volume,
        rate: this.state.rate,
        shouldCorrectPitch: this.state.shouldCorrectPitch,
      },
      this._updateScreenForSoundStatus
    );
    this.sound = sound;
    this.setState({
      isLoading: false,
      isSearching: false,
    });
  }

  addMessage = (response) => {
    // console.log(response);
    let message = [
      {
        _id: Math.round(Math.random() * 1000000).toString(),
        text: response.output.text.join(" "),
        createdAt: new Date(),
        user: {
          _id: "2",
          name: "Crisis Assistant",
        },
      },
      {
        _id: Math.round(Math.random() * 1000000).toString(),
        text: response.input.text,
        createdAt: new Date(Date.now() + 300),
        user: {
          _id: "1",
        },
      },
    ];
    // console.log(message);
    this.speak(response.output.text.join(" "));
    this.props.handleStateChange(message);
  };

  _onRecordPressed = () => {
    if (this.state.isRecording) {
      this._stopRecordingAndEnablePlayback();
    } else {
      this._stopPlaybackAndBeginRecording();
    }
  };

  _getMMSSFromMillis(millis) {
    const totalSeconds = millis / 1000;
    const seconds = Math.floor(totalSeconds % 60);
    const minutes = Math.floor(totalSeconds / 60);

    const padWithZero = (number) => {
      const string = number.toString();
      if (number < 10) {
        return "0" + string;
      }
      return string;
    };
    return padWithZero(minutes) + ":" + padWithZero(seconds);
  }

  _getRecordingTimestamp() {
    if (this.state.recordingDuration != null) {
      return `${this._getMMSSFromMillis(this.state.recordingDuration)}`;
    }
    return `${this._getMMSSFromMillis(0)}`;
  }

  speak(thingToSay) {
    const start = () => {
      this.setState({ isBotSpeaking: true });
    };
    const complete = () => {
      this.state.isBotSpeaking ? this.setState({ isBotSpeaking: false }) : null;
    };

    Speech.speak(thingToSay, {
      onStart: start,
      onDone: complete,
      onStopped: complete,
      onError: complete,
    });
  }

  speakStop() {
    Speech.stop();
  }

  panicAlert = () => {
    this.setState({ isDialogVisible: true });
  };

  sendPanicInput = async (input) => {
    this.setState({ isDialogVisible: false });

    const assistantRes = await fetch(
      "https://node-red-crisis-assistant.eu-gb.mybluemix.net/panic/",
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: input,
          latitude: global.region.latitude,
          longitude: global.region.longitude,
          address: global.region.address,
        }),
      }
    )
      .then((response) => {
        return response;
      })
      .catch((error) => {
        console.error(error);
      });
  };

  render() {
    // console.log("isBotSpeaking:", this.state.isBotSpeaking);
    // console.log("isRecording:", this.state.isRecording);
    // console.log("isSearching:", this.state.isSearching);
    // console.log("=============================");

    if (!this.state.fontLoaded) {
      return <View style={styles.emptyContainer} />;
    }

    let indicator;

    if (this.state.isRecording) {
      indicator = <BarIndicator color="royalblue" count={5} size={25} />;
    } else if (this.state.isSearching) {
      indicator = <DotIndicator color="royalblue" count={5} size={10} />;
    } else if (this.state.isBotSpeaking) {
      indicator = (
        <TouchableOpacity
          style={{ alignItems: "center", left: 30 }}
          onPress={this.speakStop}
        >
          <MaterialIcons name="volume-off" size={36} color="royalblue" />
        </TouchableOpacity>
      );
    } else {
      indicator = (
        <TouchableOpacity
          style={{ alignItems: "center", left: 20 }}
          onPress={this.panicAlert}
        >
          <Image
            style={styles.image}
            source={require("../../assets/images/panic.png")}
          />
        </TouchableOpacity>
      );
    }

    if (!this.state.haveRecordingPermissions) {
      return (
        <View style={styles.container}>
          <View />
          <Text
            style={[
              styles.noPermissionsText,
              { fontFamily: "cutive-mono-regular" },
            ]}
          >
            Audio support: You must enable audio recording permissions in order
            to use this feature.
          </Text>
          <View />
        </View>
      );
    }

    const PanicInputBox = () => {
      return (
        <DialogInput
          isDialogVisible={this.state.isDialogVisible}
          title={"Crisis Assistant"}
          message={"Please enter your emergency type."}
          submitInput={(inputText) => {
            this.sendPanicInput(inputText);
          }}
          closeDialog={() => {
            this.setState({ isDialogVisible: false });
          }}
        ></DialogInput>
      );
    };

    return (
      <View style={styles.container}>
        <View
          style={[
            styles.halfScreenContainer,
            {
              opacity: this.state.isLoading ? DISABLED_OPACITY : 1.0,
            },
          ]}
        >
          <View style={styles.recordingContainer}>
            <PanicInputBox />
            <TouchableHighlight
              underlayColor={BACKGROUND_COLOR}
              style={styles.wrapper}
              onPress={this._onRecordPressed}
              disabled={this.state.isLoading}
            >
              <Image
                style={styles.image}
                source={require("../../assets/images/recording.png")}
              />
            </TouchableHighlight>
            <View style={styles.liveText}>
              <Text
                style={{ fontFamily: "cutive-mono-regular", color: LIVE_COLOR }}
              >
                {/* {this.state.isRecording ? "Recording... " : ""} */}
                {this._getRecordingTimestamp()}
              </Text>
            </View>
            <View style={{ flex: 1 }}>{indicator}</View>
          </View>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  emptyContainer: {
    alignSelf: "stretch",
    backgroundColor: BACKGROUND_COLOR,
  },
  container: {
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "center",
    alignSelf: "stretch",
    backgroundColor: BACKGROUND_COLOR,
    height: 80,
  },
  noPermissionsText: {
    textAlign: "center",
  },
  wrapper: { flex: 1 },
  halfScreenContainer: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "center",
    alignSelf: "stretch",
    paddingHorizontal: 20,
  },
  recordingContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
    alignSelf: "stretch",
  },
  liveText: {
    flex: 1,
    alignItems: "center",
  },
  image: {
    backgroundColor: BACKGROUND_COLOR,
    height: 64,
    width: 64,
  },
});
