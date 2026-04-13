require("dotenv").config();
const express = require("express");
const Console = require("./ConsoleUtils");
const CryptoUtils = require("./CryptoUtils");
const SharedUtils = require("./SharedUtils");

const {
  BackendUtils,
  UserModel,
  UserController,
  RoundController,
  BattlePassController,
  EconomyController,
  AnalyticsController,
  FriendsController,
  NewsController,
  MissionsController,
  TournamentXController,
  MatchmakingController,
  TournamentController,
  SocialController,
  EventsController,
  authenticate,
  errorControll,
  sendShared,
  OnlineCheck,
  VerifyPhoton
} = require("./BackendUtils");

const app = express();
const Title = "StumbleCrowns";
const PORT = process.env.PORT || 10000; // Render preferisce la 10000

app.use(express.json());

// --- Rotte Pubbliche ---
app.get('/version/get', (req, res) => {
  const version = '0.1';
  const encrypted = CryptoUtils.Encrypt(version);
  res.json(encrypted);
});

app.get("/api/v1/ping", (req, res) => {
  res.status(200).send("OK");
});

// --- Middleware di Autenticazione ---
app.use(authenticate);

// --- Rotte Protette ---
app.post("/photon/auth", VerifyPhoton);
app.get("/onlinecheck", OnlineCheck);

app.get("/matchmaking/filter", MatchmakingController?.getMatchmakingFilter);

// User
app.post('/user/login', UserController?.login);
app.get('/user/config', sendShared);
app.get('/usersettings', UserController?.getSettings);
app.post('/user/updateusername', UserController?.updateUsername);
app.get('/user/deleteaccount', UserController?.deleteAccount);
app.post('/user/linkplatform', UserController?.linkPlatform);
app.post('/user/unlinkplatform', UserController?.unlinkPlatform);
app.post('/user/profile', UserController?.getProfile);
app.post('/user-equipped-cosmetics/update', UserController?.updateCosmetics);
app.post('/user/cosmetics/addskin', UserController?.addSkin);
app.post('/user/cosmetics/setequipped', UserController?.setEquippedCosmetic);

// Shared & News
app.get("/shared/:version/:type", sendShared);
app.get("/news/getall", NewsController?.GetNews);

// Friends
app.post('/friends/request/accept', FriendsController?.add);
app.delete('/friends/:UserId', FriendsController?.remove);
app.get('/friends', FriendsController?.list);
app.post('/friends/search', FriendsController?.search);
app.post('/friends/request', FriendsController?.request);
app.post('/friends/accept', FriendsController?.accept);
app.post('/friends/request/decline', FriendsController?.reject);
app.post('/friends/cancel', FriendsController?.cancel);
app.get('/friends/request', FriendsController?.pending);

// Social & Interactions
app.get('/social/interactions', SocialController?.getInteractions);

// Rounds
app.get('/round/finish/:round', RoundController?.finishRound);
app.post('/round/finish/v4/:round?', RoundController?.finishRoundV4);
app.post('/round/eventfinish/v4/:round?', RoundController?.finishRoundV4);
app.post('/round/customroundfinish/:country/:gameId/:userId', RoundController?.finishCustomRound);

app.post('/round/finish/v3/:country/:gameId/:userId', (req, res) => {
  req.params.round = req.body.Round;
  RoundController?.finishRoundV4(req, res);
});

// Battlepass
app.get('/battlepass', BattlePassController?.getBattlePass);
app.post('/battlepass/claimv3', BattlePassController?.claimReward);
app.post('/battlepass/purchase', BattlePassController?.purchaseBattlePass);
app.post('/battlepass/complete', BattlePassController?.completeBattlePass);

// Economy
app.get('/economy/purchase/:item', EconomyController?.purchase); 
app.get('/economy/purchasegasha/:itemId/:count', EconomyController?.purchaseGasha); 
app.get('/economy/purchaseluckyspin', EconomyController?.purchaseLuckySpin); 
app.get('/economy/luckyspin', EconomyController?.getLuckySpin);
app.post('/economy/:currencyType/give/:amount', EconomyController?.giveCurrency); 

// Missions
app.get('/missions', MissionsController?.getMissions);
app.post('/missions/:missionId/rewards/claim/v2', MissionsController?.claimMissionReward);
app.post('/missions/objective/:objectiveId/:milestoneId/rewards/claim/v2', MissionsController?.claimMilestoneReward);

// Tournaments
app.get("/tournamentx/active", TournamentXController?.getActive);
app.post("/tournamentx/:tournamentId/join", TournamentXController?.join);
app.post("/tournamentx/:tournamentId/leave", TournamentXController?.leave);
app.get("/api/v1/tournaments", TournamentController?.getActive);

// Analytics & Leaderboard
app.post('/analytics', AnalyticsController?.analytic);
app.get('/highscore/:type/list/', async (req, res, next) => {
  try {
    const { type } = req.params;
    const { start = 0, count = 100, country = 'global' } = req.query;
    const result = await UserModel.GetHighscore(type, country, parseInt(start), parseInt(count));
    res.json(result);
  } catch (err) { next(err); }
});

// Eventi
app.get("/game-events/me", EventsController?.getActive);

// Gestione Errori
app.use(errorControll);

app.listen(PORT, () => {
  const currentDate = new Date().toLocaleString().replace(",", " |");
  console.log(`[${Title}] | ${currentDate} | Server in ascolto sulla porta ${PORT}`);
});
