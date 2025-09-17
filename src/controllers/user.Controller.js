const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

// Get user profile
const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.userId).select("-password");
        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ message: "User not found" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update user profile
const updateProfile = async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        if (user) {
            user.name = req.body.name || user.name;
            user.email = req.body.email || user.email;
            user.phone = req.body.phone || user.phone;

            if (req.body.password) {
                const salt = await bcrypt.genSalt(10);
                user.password = await bcrypt.hash(req.body.password, salt);
            }

            const updatedUser = await user.save();
            res.json({
                status: 200,
                message: "Profile updated successfully",
                user: updatedUser,
            });
        } else {
            res.status(404).json({ message: "User not found" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Forgot password (send reset token)
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Generate reset token
        const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: "15m",
        });

        // TODO: send token via email
        res.json({
            status: 200,
            message: "Password reset token generated",
            token: resetToken,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Reset password
const resetPassword = async (req, res) => {
    try {
        const { newPassword } = req.body;

        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        user.password = newPassword; // plain password
        await user.save(); // pre("save") hook will hash it

        res.json({ status: 200, message: "Password reset successful" });
    } catch (error) {
        res.status(500).json({ message: error.message });

    }
}

module.exports = {
    getProfile,
    updateProfile,
    forgotPassword,
    resetPassword,
};
