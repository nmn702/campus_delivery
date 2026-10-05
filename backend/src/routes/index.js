import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { getMe, updateMe } from '../controllers/userController.js';
import { getStores } from '../controllers/storeController.js';
import { createRunnerSession, updateRunnerSession, deleteRunnerSession, getRunners, getMySession, deleteMySessions } from '../controllers/runnerController.js';
import { createRequest, getRequest, acceptRequest, cancelRequest, completeRequest, getHistory, getPendingRequests } from '../controllers/requestController.js';
import { requesterConfirmPayment, runnerConfirmPayment, submitCost } from '../controllers/paymentController.js';
import { submitRating } from '../controllers/ratingController.js';

const router = express.Router();

router.use(requireAuth); // All routes require auth for MVP

// User
router.get('/me', getMe);
router.patch('/me', updateMe);

// Stores
router.get('/stores', getStores);

// Runner
router.get('/runner/sessions/me', getMySession);
router.delete('/runner/sessions/me', deleteMySessions);
router.post('/runner/sessions', createRunnerSession);
router.patch('/runner/sessions/:id', updateRunnerSession);
router.delete('/runner/sessions/:id', deleteRunnerSession);
router.get('/runners', getRunners);

// Requests
router.get('/requests', getPendingRequests);
router.post('/requests', createRequest);
router.get('/requests/history', getHistory);
router.get('/requests/:id', getRequest);
router.post('/requests/:id/accept', acceptRequest);
router.post('/requests/:id/cancel', cancelRequest);
router.post('/requests/:id/complete', completeRequest);

// Payment
router.post('/requests/:id/cost', submitCost);
router.post('/requests/:id/payment/requester-confirm', requesterConfirmPayment);
router.post('/requests/:id/payment/runner-confirm', runnerConfirmPayment);

// Rating
router.post('/requests/:id/rating', submitRating);

export default router;
