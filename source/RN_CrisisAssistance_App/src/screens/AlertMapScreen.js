import React, { Component } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Animated,
  Image,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import * as Location from "expo-location";
import MapView from "react-native-maps";
import { WaveIndicator } from "react-native-indicators";
import Constants from "expo-constants";
import { WebView } from "react-native-webview";

const Images = [
  { uri: "https://i.imgur.com/QNOlZae.jpg" },
  { uri: "https://i.imgur.com/xxusoiW.jpg" },
  { uri: "https://i.imgur.com/MtimT8f.jpg" },
  { uri: "https://i.imgur.com/GZBAvHM.jpg" },
];

const { width, height } = Dimensions.get("window");
const ASPECT_RATIO = width / height;

const LATITUDE_DELTA = 0.05;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

const CARD_HEIGHT = height / 4;
const CARD_WIDTH = CARD_HEIGHT - 50;

export default class screens extends Component {
  constructor(props) {
    super(props);
    this.state = {
      haveLocationPermissions: false,
      location: null,
      tracksViewChanges: true,
      width: width,
      index: 0,
      animationCards: new Animated.Value(0),
      loading: false,
      animationPopView: new Animated.Value(0),
      popupurl: "",
      cards: [
        {
          title: "Pandemic",
          description: "Influenza, Plague",
          image: Images[0],
          url: "http://tpj.mypressonline.com/pandem.htm",
          color: "rgba(130,4,150, 0.3)",
        },
        {
          title: "Earthquake",
          description: "Landslides, Avalanches",
          image: Images[1],
          url: "https://earthquaketrack.com/",
          color: "rgba(250, 67, 0, 0.6)",
        },
        {
          title: "Storm",
          description: "Cyclone, Tornado",
          image: Images[2],
          url: "https://www.cyclocane.com/",
          color: "rgba(117, 138, 122, 0.7)",
        },
        {
          title: "Flood",
          description: "TSUNAMI, Rain",
          image: Images[3],
          url: "http://globalfloodmap.org/",
          color: "rgba(0, 75, 250, 0.5)",
        },
      ],
      markers: [],
      marker: {
        CRISISTYPE: "",
        COUNT: 0,
        COLOR: "",
      },
      region: {
        latitude: 0.0,
        longitude: 0.0,
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA,
      },
    };
    // this.onPress = this.onPress.bind(this);
  }

  componentDidMount() {
    this._getLocationPermissions();

    this.state.animationCards.addListener(({ value }) => {
      let index = Math.floor(value / CARD_WIDTH + 0.3); // animate 30% away from landing on the next item
      if (index >= this.state.cards.length) {
        index = this.state.cards.length - 1;
      }
      if (index <= 0) {
        index = 0;
      }

      if (this.state.index !== index) {
        this.updateMarker(index);
        this.setState({ index });
      }
    });
  }

  _getLocationPermissions = async () => {
    let { status } = await Location.getPermissionsAsync();
    this.setState({
      haveLocationPermissions: status === "granted",
    });
    if (status !== "granted") {
      console.log("Permission to access location was denied");
    } else {
      let location = await Location.getCurrentPositionAsync({
        enableHighAccuracy: true,
      });
      // console.log(JSON.stringify(location));

      let region = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA,
      };

      this.setState({
        location,
        region,
      });

      const place = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      global.region = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        place: place,
        address: place[0].city + ", " + place[0].region + ", " + place[0].name,
      };

      // console.log("place", place);
      this.fetchMarkerCounts(region);
    }
  };

  onRegionChangeComplete = (region) => {
    if (
      region.latitude.toFixed(6) === this.state.region.latitude.toFixed(6) &&
      region.longitude.toFixed(6) === this.state.region.longitude.toFixed(6)
    ) {
      return;
    }
    // console.log(JSON.stringify(region));
    this.fetchMarkerCounts(region);
  };

  async fetchMarkerCounts(region) {
    this.setState({ region, loading: true, tracksViewChanges: false });

    const getBoundingBox = (region) => {
      return {
        northLat: region.latitude + region.latitudeDelta / 2, // northLat - max lat
        southLat: region.latitude - region.latitudeDelta / 2, // southLat - min lat
        eastLng: region.longitude + region.longitudeDelta / 2, // eastLng - max lng
        westLng: region.longitude - region.longitudeDelta / 2, // westLng - min lng
      };
    };

    // let coordinate = {
    //   latitude: getBoundingBox(this.state.region)[0],
    //   longitude: getBoundingBox(this.state.region)[2],
    // };

    const markerCountRes = await fetch(
      Constants.manifest.extra.node_red.endpoints.marker_count,
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          boundary: getBoundingBox(region),
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

    this.setState({
      markers: markerCountRes,
      loading: false,
      tracksViewChanges: true,
    });
    this.updateMarker(this.state.index);
  }

  updateMarker = (index) => {
    let crisistype = this.state.cards[index].title.toLowerCase();
    let crisiscolor = this.state.cards[index].color.toLowerCase();

    let zeroDataMarker = {
      CRISISTYPE: crisistype,
      COUNT: 0,
      COLOR: "",
    };

    let isFound = false;
    for (let i = 0; i < this.state.markers.length; i++) {
      if (this.state.markers[i].CRISISTYPE === crisistype) {
        let marker = this.state.markers[i];
        marker["COLOR"] = crisiscolor;
        this.setState({ marker });
        isFound = true;
        break;
      }
    }

    if (!isFound) {
      this.setState({ marker: zeroDataMarker });
    }
  };

  componentWillUnmount() {
    this.state.animationCards.removeAllListeners();
  }

  handleOpen = (popupurl) => {
    this.showSpinner();
    this.setState({ popupurl });
    Animated.timing(this.state.animationPopView, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  handleClose = () => {
    Animated.timing(this.state.animationPopView, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  showSpinner() {
    this.setState({ loading: true });
    this.stopTrackingViewChanges();
  }

  hideSpinner() {
    this.setState({ loading: false });
    this.startTrackingViewChanges();
  }

  stopTrackingViewChanges = () => {
    this.setState({
      tracksViewChanges: false,
    });
  };

  startTrackingViewChanges = () => {
    this.setState({
      tracksViewChanges: true,
    });
  };

  render() {
    // console.log("index: ", this.state.index);
    // console.log("marker: ", JSON.stringify(this.state.marker));
    // console.log("markers: ", JSON.stringify(this.state.markers));

    const backdrop = {
      transform: [
        {
          translateY: this.state.animationPopView.interpolate({
            inputRange: [0, 0.01],
            outputRange: [height, 0],
            extrapolate: "clamp",
          }),
        },
      ],
      opacity: this.state.animationPopView.interpolate({
        inputRange: [0.01, 0.5],
        outputRange: [0, 1],
        extrapolate: "clamp",
      }),
    };

    const slideUp = {
      transform: [
        {
          translateY: this.state.animationPopView.interpolate({
            inputRange: [0.01, 1],
            outputRange: [0, -1 * height],
            extrapolate: "clamp",
          }),
        },
      ],
    };

    const CrisisWaveIndicator = () => {
      return (
        <WaveIndicator
          color={this.state.marker.COLOR}
          count={Math.ceil(Math.pow(this.state.marker.COUNT, 0.4))}
          size={Math.pow(this.state.marker.COUNT, 2)}
          waveFactor={0.4}
        />
      );
    };

    return (
      <View style={styles.container}>
        {this.state.loading ? (
          <View style={styles.loading}>
            <ActivityIndicator size="large" />
          </View>
        ) : null}
        <MapView
          initialRegion={this.state.region}
          region={this.state.region}
          onRegionChangeComplete={this.onRegionChangeComplete.bind(this)}
          showsUserLocation={true}
          showsMyLocationButton={true}
          style={{ flex: 1, width: this.state.width }}
          onMapReady={() => {
            this.setState({ width: width - 1 });
          }}
        >
          <MapView.Marker
            coordinate={this.state.region}
            title={this.state.marker.CRISISTYPE}
            description={
              "Number of conversation identified: " + this.state.marker.COUNT
            }
            onRegionChangeComplete={this.onRegionChangeComplete.bind(this)}
            tracksViewChanges={this.state.tracksViewChanges}
          >
            <CrisisWaveIndicator />
          </MapView.Marker>
        </MapView>
        <Animated.ScrollView
          horizontal
          scrollEventThrottle={1}
          showsHorizontalScrollIndicator={false}
          snapToInterval={CARD_WIDTH + 20}
          style={styles.scrollView}
          contentContainerStyle={styles.endPadding}
          onScroll={Animated.event(
            [
              {
                nativeEvent: {
                  contentOffset: {
                    x: this.state.animationCards,
                  },
                },
              },
            ],
            { useNativeDriver: true }
          )}
        >
          {this.state.cards.map((card, index) => (
            <TouchableOpacity
              style={styles.card}
              key={index}
              // onPress={this.handleOpen}
              onPress={() => this.handleOpen(card.url)}
            >
              <Image
                source={card.image}
                style={styles.cardImage}
                resizeMode="cover"
              />
              <View style={styles.textContent}>
                <Text numberOfLines={1} style={styles.cardtitle}>
                  {card.title}
                </Text>
                <Text numberOfLines={1} style={styles.cardDescription}>
                  {card.description}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </Animated.ScrollView>
        <Animated.View
          style={[StyleSheet.absoluteFill, styles.cover, backdrop]}
        >
          <View style={[styles.sheet]}>
            <Animated.View style={[styles.popup, slideUp]}>
              <TouchableOpacity onPress={this.handleClose}>
                <Text>Close</Text>
              </TouchableOpacity>
              <WebView
                source={{
                  uri: this.state.popupurl,
                }}
                style={{ width: width * 0.9 }}
                onLoadStart={() => this.showSpinner()}
                onLoad={() => this.hideSpinner()}
              />
            </Animated.View>
          </View>
        </Animated.View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  cover: {
    backgroundColor: "rgba(0,0,0,.5)",
  },
  sheet: {
    position: "absolute",
    top: height,
    left: 0,
    right: 0,
    height: "100%",
    justifyContent: "flex-end",
  },
  popup: {
    backgroundColor: "#FFF",
    marginHorizontal: 10,
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
    minHeight: height * 0.8,
    alignItems: "center",
    justifyContent: "center",
  },
  scrollView: {
    position: "absolute",
    bottom: 30,
    left: 0,
    right: 0,
    paddingVertical: 10,
  },
  endPadding: {
    paddingRight: width - CARD_WIDTH,
  },
  card: {
    padding: 10,
    elevation: 2,
    backgroundColor: "#FFF",
    marginHorizontal: 10,
    shadowColor: "#000",
    shadowRadius: 5,
    shadowOpacity: 0.3,
    shadowOffset: { x: 2, y: -2 },
    height: CARD_HEIGHT,
    width: CARD_WIDTH,
    overflow: "hidden",
  },
  cardImage: {
    flex: 3,
    width: "100%",
    height: "100%",
    alignSelf: "center",
  },
  textContent: {
    flex: 1,
  },
  cardtitle: {
    fontSize: 12,
    marginTop: 5,
    fontWeight: "bold",
  },
  cardDescription: {
    fontSize: 12,
    color: "#444",
  },
  text: {
    color: "rgb(130,4,150)",
    fontWeight: "normal",
  },
  loading: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    elevation: 3,
    opacity: 0.5,
  },
});
