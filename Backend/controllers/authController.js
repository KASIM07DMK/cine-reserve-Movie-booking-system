import { AuthService } from '../src/services/authService.js';
import { ApiResponse } from '../src/utils/ApiResponse.js';
import { asyncHandler } from '../src/utils/asyncHandler.js';
import { config } from '../config/env.js';

export const register = asyncHandler(async (req, res) => {
  const result = await AuthService.register(req.body);

  // Set HTTP-only cookie
  res.cookie('token', result.token, {
    httpOnly: true,
    secure: config.env === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000
  });

  return res.status(201).json(new ApiResponse(201, result, 'Registration successful.'));
});

export const login = asyncHandler(async (req, res) => {
  const result = await AuthService.login(req.body);

  res.cookie('token', result.token, {
    httpOnly: true,
    secure: config.env === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000
  });

  return res.status(200).json(new ApiResponse(200, result, 'Login successful.'));
});

export const logout = asyncHandler(async (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: config.env === 'production',
    sameSite: 'lax'
  });

  return res.status(200).json(new ApiResponse(200, null, 'Logged out successfully.'));
});

export const getMe = asyncHandler(async (req, res) => {
  const user = await AuthService.getMe(req.user._id);
  return res.status(200).json(new ApiResponse(200, user, 'User profile fetched.'));
});

export const updateProfile = asyncHandler(async (req, res) => {
  const user = await AuthService.updateProfile(req.user._id, req.body);
  return res.status(200).json(new ApiResponse(200, user, 'Profile updated successfully.'));
});

export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const result = await AuthService.changePassword(req.user._id, currentPassword, newPassword);
  return res.status(200).json(new ApiResponse(200, result, 'Password updated successfully.'));
});
