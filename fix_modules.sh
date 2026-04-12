#!/bin/bash

# Function to safely patch manifests (remove package=)
patch_manifest() {
    local file=$1
    local package=$2
    if [ -f "$file" ]; then
        if grep -q "package=\"$package\"" "$file"; then
            echo "Patching manifest: $file"
            sed -i '' "s/package=\"$package\"//g" "$file"
        else
            echo "Manifest already patched or package missing: $file"
        fi
    else
        echo "Error: Manifest not found: $file"
    fi
}

# Function to safely inject namespace into build.gradle
inject_namespace() {
    local file=$1
    local namespace=$2
    if [ -f "$file" ]; then
        if grep -q "namespace \"$namespace\"" "$file"; then
            echo "Namespace already present in: $file"
        else
            echo "Injecting namespace into: $file"
            # Insert namespace after 'android {'
            sed -i '' "/android {/a\\
    namespace \"$namespace\"" "$file"
        fi
    else
        echo "Error: build.gradle not found: $file"
    fi
}

echo "Starting module fixes for AGP 8.8 compatibility..."

# Geolocation
patch_manifest "node_modules/react-native-geolocation-service/android/src/main/AndroidManifest.xml" "com.agontuk.RNFusedLocation"
inject_namespace "node_modules/react-native-geolocation-service/android/build.gradle" "com.agontuk.RNFusedLocation"

# Razorpay
patch_manifest "node_modules/react-native-razorpay/android/src/main/AndroidManifest.xml" "com.razorpay.rn"
inject_namespace "node_modules/react-native-razorpay/android/build.gradle" "com.razorpay.rn"

# Sound Player
patch_manifest "node_modules/react-native-sound-player/android/src/main/AndroidManifest.xml" "com.johnsonsu.rnsoundplayer"
inject_namespace "node_modules/react-native-sound-player/android/build.gradle" "com.johnsonsu.rnsoundplayer"

# Image Crop Picker (also needs namespace)
# Note: Manually checked package name for crop picker
patch_manifest "node_modules/react-native-image-crop-picker/android/src/main/AndroidManifest.xml" "com.reactnative.ivpusic.imagepicker"
inject_namespace "node_modules/react-native-image-crop-picker/android/build.gradle" "com.reactnative.ivpusic.imagepicker"

# Linear Gradient
patch_manifest "node_modules/react-native-linear-gradient/android/src/main/AndroidManifest.xml" "com.BV.LinearGradient"
inject_namespace "node_modules/react-native-linear-gradient/android/build.gradle" "com.BV.LinearGradient"

# React Native Config
patch_manifest "node_modules/react-native-config/android/src/main/AndroidManifest.xml" "com.lugg.RNCConfig"
inject_namespace "node_modules/react-native-config/android/build.gradle" "com.lugg.RNCConfig"

# Date Picker
patch_manifest "node_modules/react-native-date-picker/android/src/main/AndroidManifest.xml" "com.henninghall.date_picker"
inject_namespace "node_modules/react-native-date-picker/android/build.gradle" "com.henninghall.date_picker"

# Device Info
patch_manifest "node_modules/react-native-device-info/android/src/main/AndroidManifest.xml" "com.learnium.RNDeviceInfo"
inject_namespace "node_modules/react-native-device-info/android/build.gradle" "com.learnium.RNDeviceInfo"

# Get Random Values
patch_manifest "node_modules/react-native-get-random-values/android/src/main/AndroidManifest.xml" "org.linusu"
inject_namespace "node_modules/react-native-get-random-values/android/build.gradle" "org.linusu"

# Keychain
patch_manifest "node_modules/react-native-keychain/android/src/main/AndroidManifest.xml" "com.oblador.keychain"
inject_namespace "node_modules/react-native-keychain/android/build.gradle" "com.oblador.keychain"

# Localize
patch_manifest "node_modules/react-native-localize/android/src/main/AndroidManifest.xml" "com.zoontek.rnlocalize"
inject_namespace "node_modules/react-native-localize/android/build.gradle" "com.zoontek.rnlocalize"

# Permissions
patch_manifest "node_modules/react-native-permissions/android/src/main/AndroidManifest.xml" "com.zoontek.rnpermissions"
inject_namespace "node_modules/react-native-permissions/android/build.gradle" "com.zoontek.rnpermissions"

# Print
patch_manifest "node_modules/react-native-print/android/src/main/AndroidManifest.xml" "com.christopherdro.RNPrint"
inject_namespace "node_modules/react-native-print/android/build.gradle" "com.christopherdro.RNPrint"

# Safe Area Context
patch_manifest "node_modules/react-native-safe-area-context/android/src/main/AndroidManifest.xml" "com.th3rdwave.safeareacontext"
inject_namespace "node_modules/react-native-safe-area-context/android/build.gradle" "com.th3rdwave.safeareacontext"

# Vector Icons
patch_manifest "node_modules/react-native-vector-icons/android/src/main/AndroidManifest.xml" "com.oblador.vectoricons"
inject_namespace "node_modules/react-native-vector-icons/android/build.gradle" "com.oblador.vectoricons"

# Calendar Events
patch_manifest "node_modules/react-native-calendar-events/android/src/main/AndroidManifest.xml" "com.calendarevents"
inject_namespace "node_modules/react-native-calendar-events/android/build.gradle" "com.calendarevents"

# Netinfo
patch_manifest "node_modules/@react-native-community/netinfo/android/src/main/AndroidManifest.xml" "com.reactnativecommunity.netinfo"
inject_namespace "node_modules/@react-native-community/netinfo/android/build.gradle" "com.reactnativecommunity.netinfo"

# Background Actions
patch_manifest "node_modules/react-native-background-actions/android/src/main/AndroidManifest.xml" "com.asterinet.react.bgactions"
inject_namespace "node_modules/react-native-background-actions/android/build.gradle" "com.asterinet.react.bgactions"

# TTS
patch_manifest "node_modules/react-native-tts/android/src/main/AndroidManifest.xml" "net.no_mad.tts"
inject_namespace "node_modules/react-native-tts/android/build.gradle" "net.no_mad.tts"

echo "Module fixes applied."
