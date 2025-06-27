# Tsimpologion 🍽️

A modern React Native app (built with [Expo](https://expo.dev)) for discovering and reviewing food spots. 

## Features

## Features

- 🔐 **User Authentication**: Register, log in, log out, and manage authentication state securely.
- 👤 **Profile Management**: Edit your profile, change your password, upload an avatar, and manage user details.
- 🍴 **Food Spot Discovery**: Browse, filter, and sort food spots by category, rating, and location.
- 🗺️ **Food Spot Details**: View address, business hours, contact info, social links, and more for each spot.
- ⭐ **Community Reviews**: Add, edit, and delete reviews with ratings, comments, and images.
- ❤️ **Review Likes**: Like and unlike reviews, see like counts, and sort reviews by most liked.
- 🖼️ **Image Uploads**: Upload images for your profile, food spots, and reviews, with support for multiple images and image deletion.
- 🕒 **Business Hours**: View and edit business hours for each food spot with a modern UI.
- 💬 **Social Links**: Add and display social media links for food spots.
- 📱 **Modern UI**: Clean, responsive design with custom components, skeleton loaders, and animated transitions.
- ⚡ **Fast Data Fetching**: Powered by React Query for caching, optimistic updates, and performance.
- 🗂️ **File-based Routing**: Easy navigation using Expo Router and stack/tab navigation.
- 🔍 **Search**: Search for food spots by name.
- 📍 **Location Support**: Display and manage city/address for food spots.
- 🏆 **Favorites**: Mark food spots as favorites and manage your favorite list.
- 🖼️ **Community Photos**: View all community-uploaded photos for a food spot in a carousel.
- 🛡️ **Error Handling**: User-friendly error and loading states throughout the app.
- 📦 **TypeScript Support**: Strong typing for safer and more maintainable code.
- 🧪 **Component Reusability**: Modular components for reviews, food spots, UI elements, and more.

## Architecture

This React Native app communicates with a [Laravel](https://laravel.com/) backend via a RESTful API for authentication, data storage, and business logic. Make sure the backend is running and accessible for full functionality.

You can find the backend [here](https://github.com/Pravinos/tsimpologion-backend).

## Getting Started

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Start the app**

   ```bash
   npx expo start
   ```

   Then choose to open in a development build, Android emulator, iOS simulator, or [Expo Go](https://expo.dev/go).

3. **Develop**

   Edit files in the `app` directory. Routing is file-based ([docs](https://docs.expo.dev/router/introduction/)).

## 🚀 Test the App Instantly with Expo Go

You can try out Tsimpologion right now on your mobile device!

1. **Install Expo Go:**  
   Download the [Expo Go app](https://expo.dev/client) from the [App Store (iOS)](https://apps.apple.com/app/expo-go/id982107779) or [Google Play (Android)](https://play.google.com/store/apps/details?id=host.exp.exponent).

2. **Scan the QR Code Below:**  
   Open Expo Go and use its built-in QR code scanner to scan this code:

   ![Scan this QR code with Expo Go](src/assets/expo_qr.png)

3. **Open the App:**  
   The app will load instantly, using the latest published update!


## Learn More

- [Expo documentation](https://docs.expo.dev/)
- [React Native documentation](https://reactnative.dev/)
- [Expo Router](https://docs.expo.dev/router/introduction/)

## Community

- [Expo on GitHub](https://github.com/expo/expo)
- [Expo Discord](https://chat.expo.dev)