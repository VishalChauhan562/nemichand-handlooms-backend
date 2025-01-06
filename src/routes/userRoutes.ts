import { Router } from 'express';
import { registerUser, loginUser, logoutUser, getProfile } from '../controllers/userController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.get('/profile', authenticateToken, getProfile);

// Registration route
router.post('/register', registerUser);

// Login route
router.post('/login', loginUser);

// Lout 
router.post('/logout', logoutUser);

export default router;
