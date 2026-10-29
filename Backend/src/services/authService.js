import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';

export class AuthService {
  static async register({ name, email, password, phone = '' }) {
    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      throw new ApiError(409, 'An account with this email address already exists.');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
      phone: phone?.trim() || '',
      role: 'user'
    });

    const token = user.generateAuthToken();

    return {
      user: user.toJSON(),
      token
    };
  }

  static async login({ email, password }) {
    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      throw new ApiError(401, 'Invalid email or password.');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new ApiError(401, 'Invalid email or password.');
    }

    const token = user.generateAuthToken();

    return {
      user: user.toJSON(),
      token
    };
  }

  static async getMe(userId) {
    const user = await User.findById(userId).populate('selectedCity');
    if (!user) {
      throw new ApiError(404, 'User not found.');
    }
    return user.toJSON();
  }

  static async updateProfile(userId, { name, phone, selectedCity }) {
    const updateData = {};
    if (name) updateData.name = name.trim();
    if (phone !== undefined) updateData.phone = phone.trim();
    if (selectedCity) updateData.selectedCity = selectedCity;

    const user = await User.findByIdAndUpdate(userId, { $set: updateData }, { new: true }).populate(
      'selectedCity'
    );

    return user.toJSON();
  }

  static async changePassword(userId, currentPassword, newPassword) {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, 'User not found.');
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      throw new ApiError(400, 'Current password does not match.');
    }

    if (newPassword.length < 6) {
      throw new ApiError(400, 'New password must be at least 6 characters.');
    }

    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    await user.save();

    return { message: 'Password changed successfully.' };
  }
}
