import * as React from "react";
import { NavigationContainer } from "@react-navigation/native";
// import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import ChatScreen from "./src/screens/ChatScreen";
import AlertMapScreen from "./src/screens/AlertMapScreen";
import * as Permissions from "expo-permissions";

const Tab = createMaterialTopTabNavigator();

global.region = {
  latitude: 0,
  longitude: 0,
  address: "",
  place: [{ isoCountryCode: "US", country: null }],
};

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isoCountryCode: "US",
    };
  }

  componentDidMount() {
    this.interval = setInterval(() => {
      this.setState({
        isoCountryCode: global.region.place[0].isoCountryCode,
      });
    }, 3000);

    this._askForAllPermissions();
  }

  _askForAllPermissions = async () => {
    const { status } = await Permissions.askAsync(
      Permissions.LOCATION,
      Permissions.AUDIO_RECORDING,
      Permissions.NOTIFICATIONS
    );
    if (status !== "granted") {
      alert("Ok! You have not enabled all required permissions");
    }
  };

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  render() {
    return (
      <NavigationContainer>
        <Tab.Navigator
          initialRouteName="ChatPage"
          tabBarOptions={{
            activeTintColor: "#e91e63",
            showIcon: true,
          }}
        >
          <Tab.Screen
            name="ChatPage"
            component={ChatScreen}
            options={{
              tabBarLabel:
                "Crisis Assistant (" + this.state.isoCountryCode + ")",
              tabBarIcon: ({ color, size }) => (
                <MaterialCommunityIcons
                  name="home-assistant"
                  color={color}
                  size={24}
                />
              ),
            }}
          />
          <Tab.Screen
            name="AlertMapPage"
            component={AlertMapScreen}
            options={{
              tabBarLabel: "Crisis Alert Map",
              tabBarIcon: ({ color, size }) => (
                <MaterialCommunityIcons
                  name="map-marker-radius"
                  color={color}
                  size={24}
                />
              ),
            }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    );
  }
}
