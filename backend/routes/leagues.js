import express from 'express';
import { query, param } from 'express-validator';
import leagueController from '../../controllers/leagueController.js';

const router = express.Router();

/**
 * Validazioni per i parametri delle richieste
 */
const validateLeagueId = [
  param('leagueId')
    .isInt({ min: 1 })
    .withMessage('ID campionato deve essere un numero intero positivo')
];

const validateLeagueQuery = [
  query('country')
    .optional()
    .isLength({ min: 2, max: 50 })
    .withMessage('Paese deve essere tra 2 e 50 caratteri'),
  query('season')
    .optional()
    .matches(/^\d{4}$/)
    .withMessage('Stagione deve essere un anno a 4 cifre'),
  query('type')
    .optional()
    .isIn(['league', 'cup', 'playoffs'])
    .withMessage('Tipo deve essere: league, cup o playoffs')
];

const validateFixtureQuery = [
  query('season')
    .optional()
    .matches(/^\d{4}$/)
    .withMessage('Stagione deve essere un anno a 4 cifre'),
  query('date')
    .optional()
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage('Data deve essere in formato YYYY-MM-DD'),
  query('status')
    .optional()
    .isIn(['scheduled', 'live', 'finished', 'cancelled'])
    .withMessage('Status deve essere: scheduled, live, finished o cancelled')
];

/**
 * @route   GET /api/leagues
 * @desc    Ottiene la lista di tutti i campionati
 * @access  Public
 */
router.get('/', 
  validateLeagueQuery,
  leagueController.getLeagues
);

/**
 * @route   GET /api/leagues/popular
 * @desc    Ottiene i campionati più popolari
 * @access  Public
 */
router.get('/popular', 
  leagueController.getPopularLeagues
);

/**
 * @route   GET /api/leagues/:leagueId
 * @desc    Ottiene i dettagli di un campionato specifico
 * @access  Public
 */
router.get('/:leagueId', 
  validateLeagueId,
  leagueController.getLeagueById
);

/**
 * @route   GET /api/leagues/:leagueId/statistics
 * @desc    Ottiene le statistiche di un campionato
 * @access  Public
 */
/*
router.get('/:leagueId/statistics', 
  validateLeagueId,
  leagueController.getLeagueStatistics
);
*/
export default router;