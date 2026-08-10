/*
|--------------------------------------------------------------------------
| Authentication Service
|--------------------------------------------------------------------------
| Business Logic
|--------------------------------------------------------------------------
*/

class AuthService {

    async register(data) {

        return {
            success: true,
            message: "Register service working",
            data
        };

    }

    async login(data) {

        return {
            success: true,
            message: "Login service working",
            data
        };

    }

    async profile(userId) {

        return {
            success: true,
            message: "Profile service working",
            userId
        };

    }

    async updateProfile(userId, data) {

        return {
            success: true,
            message: "Update Profile service working",
            userId,
            data
        };

    }

    async changePassword(userId, data) {

        return {
            success: true,
            message: "Change Password service working",
            userId
        };

    }

}

export default new AuthService();