import React from "react";
import { StyleSheet, View, Text, Image } from "react-native";
import { GiftedChat, Bubble, Send } from "react-native-gifted-chat";
import { MessageRequest } from "../component/Assistant";
import BotIcon from "../component/BotIcon";
import ExpoRecord from "../component/ExpoRecord";
import * as Notifications from "expo-notifications";

export default class ChatScreen extends React.Component {
  constructor(props) {
    super(props);
    this.handleStateChange = this.handleStateChange.bind(this);

    this.state = {
      messages: [],
      conversationID: null,
      context: null,
      typingText: null,
      haveNotificationPermissions: false,
    };
  }

  handleStateChange(message) {
    let messages = this.state.messages;
    this.setState({ messages: GiftedChat.append(messages, message) });
    // console.log(this.state.messages);
  }

  componentDidMount() {
    this._getNotificationPermissions();
    this.setState({
      messages: [
        {
          _id: Math.round(Math.random() * 1000000).toString(),
          text:
            "Hello, I’m the Crisis Assistant Bot ready to answer your questions. How can I help you?",
          createdAt: new Date(),
          system: true,
        },
      ],
    });
  }

  _getNotificationPermissions = async () => {
    let { status } = await Notifications.getPermissionsAsync({});
    this.setState({
      haveNotificationPermissions: status === "granted",
    });
    if (status !== "granted") {
      console.log("Notifications access was denied");
    } else {
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: true,
        }),
      });
    }
  };

  sendNotificationAlert = (n, x) => {
    if (this.state.haveNotificationPermissions) {
      Notifications.scheduleNotificationAsync({
        content: {
          title: "Crisis Assistant Alert !!",
          body: `We have noticed ${n} search requests related to ${x} from your region.
Stay Alert and stay safe!`,
        },
        trigger: null,
      });
    }
  };

  componentWillUnmount() {
    // this.sendNotificationAlert(5, "nothing");
  }

  render() {
    return (
      <>
        <ExpoRecord handleStateChange={this.handleStateChange} />
        <GiftedChat
          placeholder="Send your message to Crisis Assistant..."
          messages={this.state.messages}
          onSend={(messages) => this.onSend(messages)}
          renderAvatar={this.renderAvatar}
          user={{
            _id: "1",
          }}
          renderBubble={this.renderBubble}
          renderFooter={this.renderFooter}
          renderSend={this.renderSend}
        />
      </>
    );
  }

  renderSend(props) {
    return (
      <Send {...props}>
        <View style={{ marginRight: 8, marginBottom: 0 }}>
          <Image
            source={require("../../assets/images/send.png")}
            resizeMode={"center"}
            style={styles.image}
          />
        </View>
      </Send>
    );
  }

  onSend = (message = []) => {
    this.setState(
      (previousState) => ({
        messages: GiftedChat.append(previousState.messages, message),
        typingText: "Assistant is typing...",
      }),
      () => {
        this.getMessage(message[0].text.replace(/[\n\r]+/g, " "));
      }
    );
  };

  getMessage = async (text) => {
    let response = await MessageRequest(text, this.state.context);
    this.setState({
      context: response.context,
    });
    let message = {
      _id: Math.round(Math.random() * 1000000).toString(),
      text: response.output.text.join(" "),
      createdAt: new Date(),
      user: {
        _id: "2",
        name: "Crisis Assistant",
      },
    };
    this.setState((previousState) => ({
      messages: GiftedChat.append(previousState.messages, message),
      typingText: null,
    }));
  };

  renderAvatar = () => {
    return <BotIcon />;
  };

  renderBubble = (props) => {
    return (
      <Bubble
        {...props}
        wrapperStyle={{
          left: {
            backgroundColor: "#8bf7a6",
          },
        }}
      />
    );
  };

  renderFooter = (props) => {
    if (this.state.typingText) {
      return (
        <View style={styles.footerContainer}>
          <Text style={styles.footerText}>{this.state.typingText}</Text>
        </View>
      );
    }
    return null;
  };
}

const styles = StyleSheet.create({
  footerContainer: {
    marginTop: 5,
    marginLeft: 10,
    marginRight: 10,
    marginBottom: 10,
  },
  image: {
    height: 44,
    width: 44,
  },
  footerText: {
    fontSize: 14,
    color: "#aaa",
  },
  header: {
    height: 64,
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
  },
  listViewStyle: {
    flex: 1,
    marginBottom: 0,
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  contentContainerStyle: {
    paddingTop: 24,
  },
});
