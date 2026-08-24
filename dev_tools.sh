#!/usr/bin/env bash
# Pro-Dev Redmi Note 7 Control Script
DEVICE_IP="192.168.0.115:5555"
ADB="/Users/appworx/Library/Android/sdk/platform-tools/adb"

ensure_connected() {
  $ADB connect $DEVICE_IP >/dev/null 2>&1
}

case "$1" in
  bounds-on)
    ensure_connected
    $ADB -s $DEVICE_IP shell setprop debug.layout true
    $ADB -s $DEVICE_IP shell service call activity 1599295570 >/dev/null 2>&1
    echo "✅ Layout Bounds: ON"
    ;;
  bounds-off)
    ensure_connected
    $ADB -s $DEVICE_IP shell setprop debug.layout false
    $ADB -s $DEVICE_IP shell service call activity 1599295570 >/dev/null 2>&1
    echo "❌ Layout Bounds: OFF"
    ;;
  taps-on)
    ensure_connected
    $ADB -s $DEVICE_IP shell settings put system show_touches 1
    echo "✅ Show Taps: ON"
    ;;
  taps-off)
    ensure_connected
    $ADB -s $DEVICE_IP shell settings put system show_touches 0
    echo "❌ Show Taps: OFF"
    ;;
  logs)
    ensure_connected
    echo "📜 Streaming Logcat..."
    $ADB -s $DEVICE_IP logcat -v time *:E
    ;;
  shot)
    ensure_connected
    FILE="screenshot_$(date +%s).png"
    $ADB -s $DEVICE_IP exec-out screencap -p > "$FILE"
    echo "📸 Saved screenshot to $FILE"
    ;;
  rec)
    ensure_connected
    echo "🎥 Recording screen... Press Ctrl+C to stop."
    $ADB -s $DEVICE_IP shell screenrecord /sdcard/rec.mp4
    $ADB -s $DEVICE_IP pull /sdcard/rec.mp4 ./recording.mp4
    echo "🎥 Saved recording to recording.mp4"
    ;;
  anim-fast)
    ensure_connected
    $ADB -s $DEVICE_IP shell "settings put global window_animation_scale 0.5 && settings put global transition_animation_scale 0.5 && settings put global animator_duration_scale 0.5"
    echo "⚡ Animation speed set to 0.5x"
    ;;
  anim-off)
    ensure_connected
    $ADB -s $DEVICE_IP shell "settings put global window_animation_scale 0 && settings put global transition_animation_scale 0 && settings put global animator_duration_scale 0"
    echo "⚡ Animations OFF"
    ;;
  reboot)
    ensure_connected
    $ADB -s $DEVICE_IP reboot
    echo "🔄 Rebooting device..."
    ;;
  dev-menu)
    ensure_connected
    $ADB -s $DEVICE_IP shell am start -a android.settings.APPLICATION_DEVELOPMENT_SETTINGS
    echo "🛠️ Opened Developer Options on phone screen"
    ;;
  *)
    echo "📱 Redmi Note 7 Pro-Dev Controller"
    echo "Usage: ./dev_tools.sh [command]"
    echo ""
    echo "Commands:"
    echo "  bounds-on   : Enable inspectable UI Layout Bounds on screen"
    echo "  bounds-off  : Disable Layout Bounds"
    echo "  taps-on     : Show visual touch indicators on taps"
    echo "  taps-off    : Hide touch indicators"
    echo "  logs        : Stream live crash/error logs (logcat)"
    echo "  shot        : Take instant screenshot to Mac"
    echo "  rec         : Record video of phone screen to Mac"
    echo "  anim-fast   : Set animation speeds to 0.5x"
    echo "  anim-off    : Turn off animations completely"
    echo "  dev-menu    : Open Developer Options screen on phone"
    echo "  reboot      : Reboot the phone over Wi-Fi"
    ;;
esac
