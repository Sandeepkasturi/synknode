
# SynkNode Documentation

## Table of Contents
1. [Introduction](#introduction)
2. [Getting Started](#getting-started)
3. [How It Works](#how-it-works)
4. [Features](#features)
5. [User Guide](#user-guide)
   - [Sharing Files](#sharing-files)
   - [Receiving Files](#receiving-files)
   - [Directory Transfers](#directory-transfers)
6. [Technical Details](#technical-details)
7. [Troubleshooting](#troubleshooting)
8. [Security Considerations](#security-considerations)
9. [System Requirements](#system-requirements)

## Introduction
SynkNode is a peer-to-peer (P2P) file sharing web application that allows users to transfer files directly between devices without uploading them to a central server. This ensures faster transfers, enhanced privacy, and no file size limits imposed by cloud providers.

The application uses WebRTC technology through the PeerJS library to establish direct connections between devices, making it possible to share files across different networks, even through firewalls.

## Getting Started

### Quick Start
1. Open SynkNode in your web browser
2. To share files: 
   - Select the "Share File" tab
   - Upload files by dragging and dropping or clicking to browse
   - Share your generated token with the recipient
3. To receive files:
   - Select the "Receive File" tab
   - Enter the sender's token
   - Wait for the file transfer to complete

### Connection Requirements
- Both devices must have internet access
- Modern web browser that supports WebRTC (Chrome, Firefox, Edge, Safari)
- For large files, a stable internet connection is recommended

## How It Works
SynkNode establishes direct peer-to-peer connections between devices using the following process:

1. **Connection Establishment**: When you open the application, it connects to a STUN server to determine your network address.
2. **Peer ID Generation**: A unique 5-character token (Peer ID) is generated to identify your device.
3. **File Selection**: You select the files you want to share.
4. **Connection Request**: The recipient enters your token to request a connection.
5. **Permission**: You receive a permission request and can approve or deny the file transfer.
6. **Direct Transfer**: Files are chunked and transferred directly between devices without passing through a server.
7. **Completion**: Files are automatically saved to the recipient's device.

## Features

### Key Features
- **Direct P2P File Transfer**: Send files directly between devices
- **No File Upload to Servers**: Files never pass through a central server
- **Up to 2GB File Size**: Transfer files up to 2GB in size
- **Multiple File Support**: Send multiple files at once
- **Directory Transfer**: Transfer entire folder structures
- **Transfer Progress**: Real-time progress tracking
- **Permission System**: Approve or deny transfer requests
- **Image Previews**: Preview images before sending

### Privacy Features
- **No Account Required**: Use without registration
- **No File Storage**: Files aren't stored on any server
- **Encrypted Transfer**: Data is encrypted during transfer
- **Temporary Connection**: Connections exist only for the duration of the transfer

## User Guide

### Sharing Files

#### Basic File Sharing
1. Navigate to the "Share File" tab
2. Drag and drop files into the upload area, or click to browse
3. Once files are selected, a 5-character token will be displayed
4. Share this token with the recipient through any communication channel
5. When the recipient requests your files, you'll receive a permission prompt
6. Approve the request to begin the transfer

#### Selecting Multiple Files
- Drag multiple files at once into the upload area
- Hold Ctrl/Cmd while selecting to choose multiple files in the file browser

#### Sharing a Directory
1. Click the "Select Directory" button
2. Choose a directory from your device
3. All files within the directory (including subdirectories) will be uploaded
4. The directory structure will be preserved during transfer

### Receiving Files

#### Basic File Reception
1. Navigate to the "Receive File" tab
2. Enter the 5-character token provided by the sender
3. Click "Connect" to request the files
4. Wait for the sender to approve your request
5. The transfer will begin automatically
6. Files will be saved to your downloads folder or prompted for save location

#### Transfer Status
- **Pending**: Waiting for sender approval
- **Granted**: Permission granted, preparing transfer
- **Transferring**: Files are being transferred
- **Completed**: All files have been successfully transferred
- **Denied**: The sender denied your request
- **Error**: An error occurred during the transfer

### Directory Transfers
When receiving directories:
- The original directory structure is preserved
- You may need to grant additional permissions for directory downloads
- Some browsers will download files individually rather than as a directory

## Technical Details

### Technology Stack
- **WebRTC**: For peer-to-peer communication
- **PeerJS**: WebRTC library for simplified P2P connections
- **React**: Frontend framework
- **TypeScript**: Type-safe JavaScript
- **Tailwind CSS**: For styling

### Performance Considerations
- **Chunked Transfers**: Files are sent in 64KB chunks to improve reliability
- **Connection Reliability**: STUN servers help establish connections through NATs and firewalls
- **Multiple Transfer Modes**: Optimized for different file types and sizes

### Known Limitations
- **Size Limit**: Files larger than 2GB may encounter issues
- **Browser Support**: WebRTC support varies across browsers
- **Network Restrictions**: Some corporate networks may block WebRTC connections
- **Connection Issues**: NAT traversal can sometimes fail in complex network environments

## Troubleshooting

### Common Issues

#### "Failed to Connect"
- Ensure both devices have internet access
- Check that the token was entered correctly
- Try refreshing the page and generating a new token
- Some networks (especially corporate networks) may block WebRTC connections

#### "Permission Denied"
- The sender actively denied your request
- Ask them to approve the transfer request

#### "Transfer Error"
- Connection may have been interrupted
- Large files might timeout on slower connections
- Try with smaller files or a more stable connection

#### "File Not Downloading"
- Check browser download settings
- Ensure you have sufficient storage space
- Some browsers may block multiple downloads

### Tips for Successful Transfers
- Use a stable internet connection
- Keep both devices powered and connected throughout the transfer
- For large files, consider breaking them into smaller archives
- Keep the browser tab active during transfer

## Security Considerations

### Secure Usage Practices
- Only share tokens with intended recipients
- Be cautious when receiving files from unknown sources
- Verify files with antivirus software after download
- Use secure channels to share tokens

### Privacy Protections
- No logs of transfers are kept
- No user accounts or identifying information is required
- Connections are encrypted using WebRTC's built-in encryption

## System Requirements

### Minimum Requirements
- **Browser**: Chrome 80+, Firefox 75+, Edge 80+, Safari 13+
- **Operating System**: Any OS supporting modern browsers
- **Internet**: Stable internet connection
- **Storage**: Sufficient free space for received files

### Recommended
- **Browser**: Latest version of Chrome or Firefox
- **Internet**: Broadband connection (10+ Mbps)
- **RAM**: 4GB+
- **CPU**: Dual-core processor or better
