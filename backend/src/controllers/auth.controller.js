import cloudinary from '../lib/cloudinary.js';
import { generateToken } from '../lib/utils.js';
import User from '../models/user.models.js';
import bcrypt from 'bcryptjs';


export const signup= async (req,res) => {
    const { fullName, email, password } = req.body;
    try {
        if (!fullName || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }
        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters long" });
        }
        const user = await User.findOne({ email });
        if (user) return res.status(400).json({ message: "User already exists" });
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const newUser = new User({
            fullName,
            email,
            password: hashedPassword
        })
        if (newUser) {
            generateToken(newUser._id, res);
            await newUser.save();
            return res.status(201).json({ message: "User created successfully", user: {
                _id: newUser._id,
                fullName: newUser.fullName,
                email: newUser.email,
                profilePic: newUser.profilePic || null,
            } });
        }
        else {
            return res.status(500).json({ message: "User creation failed" });
        }
    }
    catch (error) {
        console.error("Error during signup:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export const login = async (req, res) => {
    const { email, password } = req.body;
    try {
    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
        }
    const user = await User.findOne({ email });
    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid password" });
    }
    generateToken(user._id, res);
    return res.status(200).json({
        message: "Login successful",
        user: {
            _id: user._id,
            fullName: user.fullName,
            email: user.email,
            profilePic: user.profilePic || null,
        }
    });
    }
    catch (error) {
        console.error("Error during login:", error);
        return res.status(500).json({ message: "Internal Server Error" });

}
}
export const logout = (req, res) => {
    try {
        res.clearCookie("jwt", "", {maxAge: 0});
        return res.status(200).json({ message: "Logout successful" });
    } catch (error) {
        console.error("Error during logout:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}

export const updateProfile = async (req, res) => {
    try {
        const {profilePic} = req.body;
        const userId = req.user._id; 
        
        if (!profilePic) {
            return res.status(400).json({ message: "Profile picture is required" });
        }

        // Additional validation for base64 image size
        // Base64 images are ~33% larger than original file size
        // So for 50KB original, base64 would be ~67KB
        const base64SizeBytes = (profilePic.length * 3) / 4;
        const maxOriginalSize = 100 * 1024; // 100KB
        const maxBase64Size = maxOriginalSize * 1.33; // Account for base64 encoding overhead
        
        if (base64SizeBytes > maxBase64Size) {
            return res.status(413).json({ 
                message: `Image file too large. Please select an image smaller than 100KB. Current size: ${(base64SizeBytes / 1024).toFixed(1)}KB` 
            });
        }
        
        const uploadResponse = await cloudinary.uploader.upload(profilePic)
        if (!uploadResponse || !uploadResponse.secure_url) {
            return res.status(500).json({ message: "Failed to upload profile picture" });
        }
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { profilePic: uploadResponse.secure_url },
            { new: true }
        );
        res.status(200).json(updatedUser)
    }
    catch (error) {
        console.error("Error during profile update:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}


export const checkAuth = (req, res) => {
    try {
        res.status(200).json({
            message: "User is authenticated",
            user: {
                _id: req.user._id,
                fullName: req.user.fullName,
                email: req.user.email,
                profilePic: req.user.profilePic,
            }
        });
    }
    catch (error) {
        console.error("Error during checkAuth:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}