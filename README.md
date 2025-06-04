# Tsimpologion 🍽️

A modern React Native app (built with [Expo](https://expo.dev)) for discovering and reviewing food spots. 

## Features

- 🔐 **User Authentication**: Register, log in, and log out securely.
- 👤 **Profile Management**: Edit your profile, change your password, and upload an avatar.
- 🍴 **Food Spot Discovery**: Browse, filter, and sort food spots by category and rating.
- 🗺️ **Food Spot Details**: View address, business hours, contact info, social links, and more.
- ⭐ **Community Reviews**: Add, edit, and delete reviews with ratings and images.
- 🖼️ **Image Uploads**: Upload images for your profile and reviews.
- ⚡ **Fast Data Fetching**: Powered by React Query for caching and performance.
- 🗂️ **File-based Routing**: Easy navigation using Expo Router.
- 🎨 **Modern UI**: Clean, responsive design with custom components.

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

## Learn More

- [Expo documentation](https://docs.expo.dev/)
- [React Native documentation](https://reactnative.dev/)
- [Expo Router](https://docs.expo.dev/router/introduction/)

## Community

- [Expo on GitHub](https://github.com/expo/expo)
- [Expo Discord](https://chat.expo.dev)