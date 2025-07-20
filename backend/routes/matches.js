import express from 'express';
import { query, param } from 'express-validator';
import sportmonksService from '../../services/sportmonksService.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { validationResult } from 'express-validator';

const router = express.Router();

/**
 * Validazioni per i parametri delle richieste
 */
const validateMatchId = [
  param('matchId')
    .isInt({ min: 1 })
    .withMessage('ID partita deve essere un numero intero positivo')
];

const validateMatchQuery = [
  query('league_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('ID campionato deve essere un numero intero positivo'),
  query('season_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('ID stagione deve essere un numero intero positivo'),
  query('team_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('ID squadra deve essere un numero intero positivo'),
  query('date')
    .optional()
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage('Data deve essere in formato YYYY-MM-DD'),
  query('date_from')
    .optional()
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage('Data deve essere in formato YYYY-MM-DD'),
  query('date_to')
    .optional()
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage('Data deve essere in formato YYYY-MM-DD')
];

/**
 * @route   GET /api/matches
 * @desc    Ottiene la lista delle partite
 * @access  Public
 */
router.get('/', 
  validateMatchQuery,
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Parametri non validi',
        details: errors.array()
      });
    }

    const { league_id, season_id, team_id, date, date_from, date_to } = req.query;
    
    const filters = {};
    if (league_id) filters.league_id = league_id;
    if (season_id) filters.season_id = season_id;
    if (team_id) filters.team_id = team_id;
    if (date) filters.date = date;
    if (date_from) filters.date_from = date_from;
    if (date_to) filters.date_to = date_to;

    const data = await sportmonksService.getFixtures(filters);
    
    res.json({
      success: true,
      data: data.data || [],
      pagination: data.pagination || null,
      timestamp: new Date().toISOString()
    });
  })
);

/**
 * @route   GET /api/matches/live
 * @desc    Ottiene le partite in diretta
 * @access  Public
 */
router.get('/live',
  asyncHandler(async (req, res) => {
    const data = await sportmonksService.getLiveScores();
    
    res.json({
      success: true,
      data: data.data || [],
      timestamp: new Date().toISOString()
    });
  })
);

/**
 * @route   GET /api/matches/upcoming
 * @desc    Ottiene le partite in programma
 * @access  Public
 */
router.get('/upcoming',
  asyncHandler(async (req, res) => {
    const data = await sportmonksService.getUpcomingFixtures();
    
    res.json({
      success: true,
      data: data.data || [],
      timestamp: new Date().toISOString()
    });
  })
);

/**
 * @route   GET /api/matches/recent
 * @desc    Ottiene le partite recenti
 * @access  Public
 */
router.get('/recent',
  asyncHandler(async (req, res) => {
    const data = await sportmonksService.getRecentFixtures();
    
    res.json({
      success: true,
      data: data.data || [],
      timestamp: new Date().toISOString()
    });
  })
);

/**
 * @route   GET /api/matches/:matchId
 * @desc    Ottiene i dettagli di una partita specifica
 * @access  Public
 */
router.get('/:matchId',
  validateMatchId,
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Parametri non validi',
        details: errors.array()
      });
    }

    const { matchId } = req.params;
    const data = await sportmonksService.getFixture(matchId);
    
    res.json({
      success: true,
      data: data.data || null,
      timestamp: new Date().toISOString()
    });
  })
);

/**
 * @route   GET /api/matches/:matchId/statistics
 * @desc    Ottiene le statistiche di una partita
 * @access  Public
 */
router.get('/:matchId/statistics',
  validateMatchId,
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Parametri non validi',
        details: errors.array()
      });
    }

    const { matchId } = req.params;
    const data = await sportmonksService.getFixtureStatistics(matchId);
    
    res.json({
      success: true,
      data: data.data || null,
      timestamp: new Date().toISOString()
    });
  })
);

export default router;