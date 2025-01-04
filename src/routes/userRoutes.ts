import { Router } from 'express';
import { registerUser, loginUser } from '../controllers/userController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.get('/profile', authenticateToken, (req, res) => {
  const user = req.user;
  res.status(200).json({
    message: 'User profile fetched successfully!',
    user,
  });
});

// Registration route
router.post('/register', registerUser);

// Login route
router.post('/login', loginUser);

export default router;
