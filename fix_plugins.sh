#!/bin/bash
# Fix all third-party libraries that try to apply 'com.facebook.react' plugin
# This plugin is only available to the :app project in RN 0.76.9.
# Libraries don't need it - they compile against react-native:+ from maven.

set -e

cd "$(dirname "$0")"

echo "=== Fixing all libraries that apply com.facebook.react ==="

# List of all affected build.gradle files
FILES=(
  "node_modules/lottie-react-native/android/build.gradle"
  "node_modules/react-native-config/android/build.gradle"
  "node_modules/react-native-gesture-handler/android/build.gradle"
  "node_modules/react-native-haptic-feedback/android/build.gradle"
  "node_modules/react-native-keychain/android/build.gradle"
  "node_modules/react-native-localize/android/build.gradle"
  "node_modules/react-native-maps/android/build.gradle"
  "node_modules/react-native-permissions/android/build.gradle"
  "node_modules/react-native-reanimated/android/build.gradle"
  "node_modules/react-native-safe-area-context/android/build.gradle"
  "node_modules/react-native-screens/android/build.gradle"
  "node_modules/react-native-svg/android/build.gradle"
  "node_modules/react-native-vector-icons/android/build.gradle"
  "node_modules/react-native-vision-camera/android/build.gradle"
  "node_modules/react-native-worklets-core/android/build.gradle"
  "node_modules/@react-native-async-storage/async-storage/android/build.gradle"
  "node_modules/@react-native-clipboard/clipboard/android/build.gradle"
  "node_modules/@react-native-community/blur/android/build.gradle"
  "node_modules/@react-native-community/datetimepicker/android/build.gradle"
  "node_modules/@react-native-community/netinfo/android/build.gradle"
)

for f in "${FILES[@]}"; do
  if [ -f "$f" ]; then
    echo "Fixing: $f"
    
    # Step 1: Comment out any line that applies the react plugin (handles both quoted styles)
    # Only comment out lines that aren't already commented
    sed -i '' '/^[[:space:]]*apply plugin.*com\.facebook\.react/s/^/\/\/ DISABLED: /' "$f"
    
    # Step 2: Comment out standalone react { ... } blocks (the codegen config)
    # These blocks only work when the plugin is applied
    # Use a perl one-liner for multi-line matching
    perl -i -0pe 's/(^|\n)([ \t]*)(react\s*\{[^}]*\})/\1\2\/\/ DISABLED REACT BLOCK:\n\2\/\/ $3/gms' "$f"
    
  else
    echo "SKIP (not found): $f"
  fi
done

echo ""
echo "=== Done! All libraries patched. ==="
echo ""
echo "Verify with:"
echo "  grep -rn 'apply plugin.*com.facebook.react' node_modules/*/android/build.gradle node_modules/@*/*/android/build.gradle 2>/dev/null | grep -v '// '"
