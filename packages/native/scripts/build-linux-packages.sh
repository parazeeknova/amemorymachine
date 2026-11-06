#!/bin/bash
set -e

# Setup directories
REPO_ROOT=$(cd "$(dirname "$0")/../../.." && pwd)
NATIVE_DIR="$REPO_ROOT/packages/native"
ARTIFACTS_DIR="$NATIVE_DIR/artifacts"

mkdir -p "$ARTIFACTS_DIR"

# Discover build directory dynamically
BUILD_DIR=$(ls -d "$NATIVE_DIR/build/stable-linux-x64/Amemorymachine" 2>/dev/null || ls -d "$NATIVE_DIR/build/stable-linux-x64/amemorymachine" 2>/dev/null || echo "")

if [ -z "$BUILD_DIR" ] || [ ! -d "$BUILD_DIR" ]; then
  echo "Error: Build directory not found in packages/native/build/stable-linux-x64/Amemorymachine"
  exit 1
fi

VERSION=$(jq -r '.version' "$REPO_ROOT/package.json")

# 1. Build Deb and RPM using FPM if fpm is available
if command -v fpm &> /dev/null; then
  echo "Building DEB and RPM packages..."
  # Debian package
  fpm -s dir -t deb -n amemorymachine -v "$VERSION" \
    --prefix /opt/amemorymachine \
    --force \
    -d "libwebkit2gtk-4.1-0" -d "libgtk-3-0" -d "libsoup-3.0-0" -d "libayatana-appindicator3-1" \
    -p "$ARTIFACTS_DIR/amemorymachine_${VERSION}_amd64.deb" \
    "$BUILD_DIR/"=/opt/amemorymachine

  # RPM package
  fpm -s dir -t rpm -n amemorymachine -v "$VERSION" \
    --prefix /opt/amemorymachine \
    --force \
    -d "webkit2gtk4.1" -d "gtk3" -d "libsoup3" -d "libayatana-appindicator3" \
    -p "$ARTIFACTS_DIR/amemorymachine-${VERSION}-1.x86_64.rpm" \
    "$BUILD_DIR/"=/opt/amemorymachine
else
  echo "fpm not installed, skipping DEB/RPM packaging."
fi

# 2. Build AppImage using appimagetool
echo "Building AppImage..."
APPDIR="$NATIVE_DIR/build/AppDir"
rm -rf "$APPDIR"
mkdir -p "$APPDIR/usr/bin"
mkdir -p "$APPDIR/usr/share/icons/hicolor/256x256/apps"

# Copy files
cp -r "$BUILD_DIR/"* "$APPDIR/usr/bin/"
cp "$REPO_ROOT/packages/weby/public/amemorymachine.png" "$APPDIR/amemorymachine.png"
cp "$REPO_ROOT/packages/weby/public/amemorymachine.png" "$APPDIR/usr/share/icons/hicolor/256x256/apps/amemorymachine.png"

# AppRun script (sets flags and starts the app)
cat << 'EOF' > "$APPDIR/AppRun"
#!/bin/sh
SELF=$(readlink -f "$0")
HERE=$(dirname "$SELF")
export WEBKIT_DISABLE_SANDBOX_THIS_IS_DANGEROUS=1
exec "$HERE/usr/bin/Amemorymachine" "$@"
EOF
chmod +x "$APPDIR/AppRun"

# Desktop entry
cat << EOF > "$APPDIR/amemorymachine.desktop"
[Desktop Entry]
Name=Amemorymachine
Exec=Amemorymachine
Icon=amemorymachine
Type=Application
Categories=Utility;
Terminal=false
Comment=Self-hosted markdown editor with second-brain capabilities
EOF

# Download appimagetool if not present
APPIMAGETOOL="$NATIVE_DIR/build/appimagetool"
if [ ! -f "$APPIMAGETOOL" ]; then
  curl -L -o "$APPIMAGETOOL" "https://github.com/AppImage/AppImageKit/releases/download/continuous/appimagetool-x86_64.AppImage"
  chmod +x "$APPIMAGETOOL"
fi

# Run appimagetool (extract first to bypass FUSE requirements in CI container)
export ARCH=x86_64
cd "$NATIVE_DIR/build"
./appimagetool --appimage-extract
cd "$REPO_ROOT"
"$NATIVE_DIR/build/squashfs-root/AppRun" "$APPDIR" "$ARTIFACTS_DIR/Amemorymachine-${VERSION}-x86_64.AppImage"

echo "Packaging complete!"
