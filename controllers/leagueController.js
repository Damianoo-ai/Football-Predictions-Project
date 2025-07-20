import { asyncHandler } from '../backend/middleware/errorHandler.js';
import { validationResult } from 'express-validator';
import axios from 'axios';
import enviroment from '../config/environment.js';

const API_TOKEN = enviroment.api.sportmonks.apiKey;
const BASE_URL = enviroment.api.sportmonks.baseUrl;

class LeagueController {
  // GET /api/leagues
  getLeagues = asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Parametri non validi',
        details: errors.array()
      });
    }

    try {
      const response = await axios.get(`${BASE_URL}/leagues`, {
        params: {
          api_token: API_TOKEN,
          ...req.query
        }
      });

      res.json({
        success: true,
        data: response.data.data || [],
        pagination: response.data.pagination || null,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Errore nel recupero dei campionati',
        details: error.message
      });
    }
  });

  // GET /api/leagues/:leagueId/fixtures
  getLeagueFixtures = asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Parametri non validi',
        details: errors.array()
      });
    }

    const { leagueId } = req.params;
    const { season = '2024', date, status } = req.query;

    try {
      const response = await axios.get(`${BASE_URL}/fixtures`, {
        params: {
          api_token: API_TOKEN,
          leagues: leagueId,
          season,
          ...(date && { date }),
          ...(status && { status })
        }
      });

      res.json({
        success: true,
        data: response.data.data || [],
        pagination: response.data.pagination || null,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Errore nel recupero delle partite del campionato',
        details: error.message
      });
    }
  });
 getLeagueById = asyncHandler(async (req, res) => {
    const leagueId = parseInt(req.params.leagueId);

    try {
        const response = await axios.get(`${BASE_URL}/leagues`, {
            params: { api_token: API_TOKEN }
        });

        const league = response.data.data.find(l => l.id === leagueId);
        if (!league) {
            return res.status(404).json({
                success: false,
                error: 'Campionato non trovato'
            });
        }

        res.json({
            success: true,
            data: league,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Errore nel recupero del campionato',
            details: error.message
        });
    }
});


  // GET /api/leagues/:leagueId/statistics
  getLeagueStatistics = asyncHandler(async (req, res) => {
    const { leagueId } = req.params;
    const { season = '2024' } = req.query;

    const mockStats = {
      league_id: leagueId,
      season: season,
      total_matches: 380,
      completed_matches: 156,
      total_goals: 423,
      average_goals_per_match: 2.71,
      total_cards: 1245,
      average_cards_per_match: 7.98,
      top_scorers: [
        { team: 'AC Milan', goals: 45 },
        { team: 'Inter', goals: 42 },
        { team: 'Napoli', goals: 41 }
      ]
    };

    res.json({
      success: true,
      data: mockStats,
      timestamp: new Date().toISOString()
    });
  });

  // GET /api/leagues/popular
  getPopularLeagues = asyncHandler(async (req, res) => {
    const popularLeagues = [
      { id: 564, name: 'Serie A', country: 'Italy', code: 'SA' },
      { id: 564, name: 'Premier League', country: 'England', code: 'PL' },
      { id: 564, name: 'La Liga', country: 'Spain', code: 'PD' },
      { id: 564, name: 'Bundesliga', country: 'Germany', code: 'BL1' },
      { id: 564, name: 'Ligue 1', country: 'France', code: 'FL1' },
      { id: 564, name: 'Champions League', country: 'Europe', code: 'CL' }
    ];

    res.json({
      success: true,
      data: popularLeagues,
      timestamp: new Date().toISOString()
    });
  });
}

export default new LeagueController();
