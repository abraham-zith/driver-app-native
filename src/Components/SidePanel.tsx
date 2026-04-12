// import React from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   Animated,
//   TouchableWithoutFeedback,
//   Dimensions,
// } from "react-native";

// const { width } = Dimensions.get("window");

// const SidePanel = ({ visible, onClose, children }: any) => {
//   const slideAnim = React.useRef(new Animated.Value(width)).current;

//   React.useEffect(() => {
//     if (visible) {
//       Animated.timing(slideAnim, {
//         toValue: 0,
//         duration: 250,
//         useNativeDriver: false,
//       }).start();
//     } else {
//       Animated.timing(slideAnim, {
//         toValue: width,
//         duration: 250,
//         useNativeDriver: false,
//       }).start();
//     }
//   }, [visible]);

//   return (
//     <View style={styles.container} pointerEvents={visible ? "auto" : "none"}>
//       {/* DARK BACKGROUND */}
//       <TouchableWithoutFeedback onPress={onClose}>
//         <View style={styles.overlay} />
//       </TouchableWithoutFeedback>

//       {/* RIGHT SLIDE PANEL */}
//       <Animated.View style={[styles.panel, { right: slideAnim }]}>
//         {children}
//       </Animated.View>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     ...StyleSheet.absoluteFillObject,
//   },
//   overlay: {
//     ...StyleSheet.absoluteFillObject,
//     backgroundColor: "rgba(0,0,0,0.4)",
//   },

//   panel: {
//     position: "absolute",
//     top: 0,
//     bottom: 0,
//     width: width * 0.75,
//     backgroundColor: "#ffffff",
//     padding: 20,
//     elevation: 10,
//   },
// });

// export default SidePanel;
