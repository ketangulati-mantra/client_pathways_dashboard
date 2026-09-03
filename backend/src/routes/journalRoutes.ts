import { Router } from 'express';
import {
  createJournalEntry,
  getUserJournalEntries,
  getJournalEntryById,
  updateJournalEntry,
  deleteJournalEntry,
  searchJournalEntries,
  getJournalEcosystemData
} from '../controllers/journalController.js';

const router = Router();

router.post('/entries', createJournalEntry);
router.get('/entries', getUserJournalEntries);
router.get('/ecosystem-data', getJournalEcosystemData);
router.get('/search', searchJournalEntries);
router.get('/entries/:id', getJournalEntryById);
router.put('/entries/:id', updateJournalEntry);
router.delete('/entries/:id', deleteJournalEntry);

export default router;
