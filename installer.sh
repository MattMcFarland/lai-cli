#!/bin/bash

# Function to detect OS and architecture
detect_platform() {
    local os=$(uname -s)
    local arch=$(uname -m)

    case "$os" in
        Darwin) os="darwin" ;;
        Linux) os="linux" ;;
        *) echo "Unsupported OS: $os"; exit 1 ;;
    esac

    case "$arch" in
        arm64) arch="arm64" ;;
        x86_64) arch="x64" ;;
        arm*) arch="arm" ;;
        *) echo "Unsupported architecture: $arch"; exit 1 ;;
    esac

    echo "${os}-${arch}"
}

# Define variables
PLATFORM=$(detect_platform)
RELEASE_VERSION="1.0.0"
RELEASE_URL="https://github.com/MattMcFarland/lai-cli/releases/download/$RELEASE_VERSION/lai-v$RELEASE_VERSION-294ef68-$PLATFORM.tar.gz"
INSTALL_DIR="/usr/local/bin"
TEMP_DIR=$(mktemp -d)

# Function for error handling
error_exit()
{
    echo "Error: $1"
    exit 1
}

# Downloading the release
echo "Downloading Lai from $RELEASE_URL"
curl -L $RELEASE_URL -o "$TEMP_DIR/lai.tar.gz" || error_exit "Failed to download file."

# Extracting the files
echo "Extracting the files..."
tar -xzf "$TEMP_DIR/lai.tar.gz" -C $TEMP_DIR || error_exit "Failed to extract files."

# Moving the executable to the installation directory
echo "Installing Lai..."
mv "$TEMP_DIR/lai" $INSTALL_DIR || error_exit "Failed to move files to $INSTALL_DIR."

# Giving execution permissions
chmod +x "$INSTALL_DIR/lai" || error_exit "Failed to set execution permissions."

# Cleaning up
rm -rf $TEMP_DIR
echo "Installation completed successfully!"