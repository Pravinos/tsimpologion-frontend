// Public routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::get('/food-spots', [FoodSpotController::class, 'index']);
Route::get('/food-spots/{food_spot}/rating', [ReviewController::class, 'averageRating']);
Route::get('/images/{model_type}/{id}', [ImageController::class, 'viewAll']);
Route::get('/images/{model_type}/{id}/{image_id}', [ImageController::class, 'viewOne']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);

    // User routes
    Route::apiResource('users', UserController::class);

    // Food spot routes
    Route::apiResource('food-spots', FoodSpotController::class)->except(['index']);
    Route::put('/food-spots/{id}/restore', [FoodSpotController::class, 'restore']);
    Route::delete('/food-spots/{id}/force', [FoodSpotController::class, 'forceDelete']);

    // Review routes
    Route::apiResource('food-spots.reviews', ReviewController::class);
    Route::put('/food-spots/{food_spot}/reviews/{review}/moderate', [ReviewController::class, 'moderate']);

    // Image routes
    Route::post('/images/{modelType}/{id}', [ImageController::class, 'upload']);
    Route::delete('/images/{model_type}/{id}/{image_id}', [ImageController::class, 'delete']);
});


--- 

## API Endpoints Summary

### Authentication
| Method | Endpoint         | Description                   |
|--------|------------------|-------------------------------|
| POST   | /api/register    | Register a new user           |
| POST   | /api/login       | Log in and retrieve an auth token |
| POST   | /api/logout      | Log out (invalidate token)    |

### User Resources
| Method | Endpoint         | Description                   |
|--------|------------------|-------------------------------|
| GET    | /api/users       | Retrieve a list of users (access controlled by roles) |
| GET    | /api/users/{id}  | Retrieve user details         |
| PUT    | /api/users/{id}  | Update user information (admin or self-update only) |
| DELETE | /api/users/{id}  | Delete a user record (admin or self-delete) |

### Food Spot Resources
| Method   | Endpoint                  | Description                   |
|----------|---------------------------|-------------------------------|
| GET      | /api/food-spots           | Public listing of all food spots |
| POST     | /api/food-spots           | Create a new food spot (protected, authentication required) |
| GET      | /api/food-spots/{id}      | Retrieve detailed food spot information |
| PUT/PATCH| /api/food-spots/{id}      | Update a food spot (admins and spot owners only) |
| DELETE   | /api/food-spots/{id}      | Soft delete a food spot (protected, authentication required) |
| PUT      | /api/food-spots/{id}/restore | Restore a soft-deleted food spot (protected, authentication required) |
| DELETE   | /api/food-spots/{id}/force | Permanently delete a food spot (protected, authentication required) |
| GET      | /api/food-spots/{id}/rating | Get average rating for a food spot |

### Review Resources
| Method | Endpoint                           | Description                   |
|--------|------------------------------------|-------------------------------|
| GET    | /api/food-spots/{id}/reviews       | List all reviews for a food spot |
| GET    | /api/food-spots/{id}/reviews/{review_id} | Get a specific review   |
| POST   | /api/food-spots/{id}/reviews       | Add a review to a food spot (authenticated) |
| PUT    | /api/food-spots/{id}/reviews/{review_id} | Update a review (owner only) |
| DELETE | /api/food-spots/{id}/reviews/{review_id} | Delete a review (owner or admin) |
| PUT    | /api/food-spots/{id}/reviews/{review_id}/moderate | Moderate a review (admin only) |