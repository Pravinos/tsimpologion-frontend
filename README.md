
# Tsimpologion 🍽️

Discover and review food spots with a modern React Native app built using [Expo](https://expo.dev).

## Features

- **User Authentication**: Register, log in, log out, and manage your account securely
- **Profile Management**: Edit your profile, change password, upload avatar
- **Food Spot Discovery**: Browse, filter, and sort by category, rating, and location
- **Food Spot Details**: View address, business hours, contact info, social links
- **Community Reviews**: Add, edit, and delete reviews with ratings, comments, and images
- **Review Likes**: Like/unlike reviews, see like counts, sort by most liked
- **Image Uploads**: Upload images for profiles, food spots, and reviews
- **Business Hours**: Modern UI for viewing and editing business hours
- **Social Links**: Add and display social media links for food spots
- **Modern UI**: Clean, responsive design with custom components and animations
- **Fast Data Fetching**: Powered by React Query for caching and performance
- **File-based Routing**: Easy navigation using Expo Router
- **Search**: Search for food spots by name
- **Location Support**: Display and manage city/address
- **Favorites**: Mark and manage favorite food spots
- **Community Photos**: View all community-uploaded photos in a carousel
- **Error Handling**: User-friendly error and loading states
- **TypeScript Support**: Strong typing for maintainable code


## Tech Stack

**Frontend:**
- Expo (React Native framework)
- React Native
- TypeScript
- React Query
- Expo Router
- EAS (Expo Application Services)

**Backend:**
- [Laravel](https://laravel.com/) (RESTful API, authentication, business logic)

---

## Screens Preview

Key screens in Tsimpologion:

- **Login**: Authentication for new and returning users
- **Home**: Discover trending food spots and categories
- **Food Spot Detail**: View details, business hours, reviews, and photos
- **Profile**: Manage your info, avatar, and password
- **Filter Modal**: Filter and sort food spots
- **Reviews**: Community reviews and ratings

Screenshots:

| Login | Home | Food Spot |
|:-----:|:-----:|:---------:|
| <img src="src/assets/README/IMG_4036.PNG" alt="Login" width="180"/> | <img src="src/assets/README/IMG_4031.PNG" alt="Home" width="180"/> | <img src="src/assets/README/IMG_4032.PNG" alt="Detail" width="180"/> |

| Reviews | Filter | Profile |
|:-------:|:------:|:-------:|
| <img src="src/assets/README/IMG_4035.PNG" alt="Reviews" width="180"/> | <img src="src/assets/README/IMG_4034.PNG" alt="Filter" width="180"/> | <img src="src/assets/README/IMG_4033.PNG" alt="Profile" width="180"/> |

## Architecture

Frontend communicates with a [Laravel](https://laravel.com/) backend via RESTful API for authentication, data storage, and business logic. Ensure the backend is running and accessible for full functionality.

Backend repo: [tsimpologion-backend](https://github.com/Pravinos/tsimpologion-backend)

## Getting Started

1. **Install dependencies**
   ```bash
   npm install
   ```
2. **Start the app**
   - Development:  `$env:NODE_ENV="development"; npx expo start --clear`
   - Production:   `$env:NODE_ENV="production"; npx expo start --clear`
   - Default:      `npx expo start`
   Then choose to open in a development build, Android emulator, iOS simulator, or [Expo Go](https://expo.dev/go).
3. **Environment Configuration**
   - `.env.development` for development API endpoints
   - `.env.production` for production API endpoints
   Setting `NODE_ENV` loads the corresponding environment file automatically.
4. **Production Updates**
   ```bash
   eas update --branch main
   ```
5. **Develop**
   Edit files in the `app` directory. Routing is file-based ([Expo Router docs](https://docs.expo.dev/router/introduction/)).

## Learn More

- [Expo documentation](https://docs.expo.dev/)
- [React Native documentation](https://reactnative.dev/)
- [Expo Router](https://docs.expo.dev/router/introduction/)


## Community

- [Expo on GitHub](https://github.com/expo/expo)
- [Expo Discord](https://chat.expo.dev)

## Contact
Built by Thomas Pravinos.  
Reach me at: tpravinos99@gmail.com or [GitHub](https://github.com/Pravinos).