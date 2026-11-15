# HOUSEBETS requirements audit

Method: every PASS below was produced by an automated run in real headless Chromium against the production build (`next build` then `next start`). Code was not used as evidence. Date of run: matches the simulation clock of that session.

Legend: PASS = verified working in browser. FAIL = not implemented or broken. UNVERIFIED = cannot be established from available evidence.

## Browser-verified checks (59 run, 59 PASS)

### Routes - Routes
- PASS: / loads
- PASS: /live loads
- PASS: /football loads
- PASS: /match/arsbha loads
- PASS: /bets loads
- PASS: /community loads
- PASS: /creators loads
- PASS: /creators/deepcurrent loads
- PASS: /leaderboard loads
- PASS: /challenges loads

### Sports home (15) - Home
- PASS: Live now section with live matches
- PASS: Starting soon section
- PASS: Featured matches carousel
- PASS: Favourite competitions/teams chips shown
- PASS: Match rows show crests (image or fallback), score, clock and 1X2 + extra market columns
- PASS: Community Pulse section

### Sports home (15) - Search
- PASS: search by team: "arsenal"
- PASS: search by player (fictional): "brandt"
- PASS: search by competition: "serie"
- PASS: search by market: "total goals"

### Live (10) - Live
- PASS: live count + live rows
- PASS: sport filter (Football) present
- PASS: competition filter shows only the chosen competition
- PASS: live search + empty state with Starting soon
- PASS: row links to match page
- PASS: suspended state visible (demo control)

### Football (10) - Football
- PASS: five named competitions
- PASS: follow competition toggles
- PASS: expand/collapse competition
- PASS: competition filter
- PASS: columns 1 X 2 1X 12 X2 O/U aligned header

### Match page (20) - Match
- PASS: scoreboard: competition, teams, score, clock, LIVE
- PASS: follow team + favourite match controls
- PASS: six market tabs with all required markets
- PASS: decimal odds format
- PASS: community thesis module + composer
- PASS: match events + statistics (Overview)

### Bet slip + My bets (20) - Betslip
- PASS: floating bottom-right panel with Betslip and Bet history tabs
- PASS: stake validation message
- PASS: USDT labels and return calc

### Bet slip + My bets (20) - My Bets
- PASS: bet history tab inside slip lists open and settled bets
- PASS: Open/Won/Lost/Cashed Out/Cancelled/Refunded tabs + date filters
- PASS: settled bets listed (Won filter)
- PASS: no cash out action on My Bets

### Bet slip + My bets (20) - Wallet
- PASS: wallet pill + dialog with balance, active stakes, transactions

### Housebets identity (15) - Social
- PASS: X connect dialog is clearly simulated
- PASS: X connected state + profile
- PASS: X dialog shows sample profile + Disconnect
- PASS: X disconnect works
- PASS: shareable branded ticket card (fixture, selection, odds, stake, return, status)

### Interaction states / rules (10) - Rules
- PASS: singles only: no accumulator/multi/bet builder/boost/free bet wording
- PASS: no emoji in rendered text
- PASS: demo/USDT labelling visible (wallet, slip)
- PASS: no console/page errors across audit

### Housebets identity (15) - Shell
- PASS: sidebar navigation works

### Mobile 390px - Mobile
- PASS: bottom navigation with 5 destinations
- PASS: bottom betslip bar appears after selecting odds
- PASS: bottom sheet opens with selection
- PASS: no horizontal overflow

## Verified earlier in this build with the betting suite (31 checks, all PASS)
- PASS: stake deduction exactly once; persistence across refresh with versioned storage; simulation continues after refresh; live clock and score progress; odds react to a goal; cash out offered, value updates, credits wallet once, locks bet, duplicate refused; My Bets has no cash out; settlement credits a win once and a loss nothing; void refunds once; no duplicate ledger entries after repeated ticks, boots and refreshes; red live indicator; matches simulate independently; extra time and penalties only in knockout fixtures; odds-changed blocks placement until accepted; failed placement creates no ticket and retry succeeds; corrupt and old-version storage recover.

## Layout checks
- PASS: all 11 routes at 1440, 1280, 768 and 390 px with no horizontal overflow and no console errors.

## UNVERIFIED (cannot be established here)
- UNVERIFIED: real club crests loading from crests.football-data.org. The test environment has no internet, so only the shield fallback was seen (and verified to replace broken images). Fix: open the deployed site once and confirm crests load; if the CDN is blocked, no code change is needed because the fallback is in place.
- UNVERIFIED: public Vercel deployment. Not deployed from this environment. Fix: run `npm install`, `npm run build`, then deploy; check the site opens without authentication.
- UNVERIFIED: Safari, Firefox and real touch devices. Only Chromium was used.
- UNVERIFIED: lint. No ESLint config exists in the project; TypeScript (`tsc --noEmit`) passes.

## Known gaps and deliberate deviations
- Deviation: the original brief put a Cash Out tab inside My Bets. By later instruction, cash out lives only in the Betslip (Your active bets) and My Bets shows history only. My Bets keeps a Cashed Out filter for history.
- Limitation: the fictional goalscorer names are the same list for every fixture, so player search returns the same name once per match.
- Limitation: only Football is functional. Basketball, Tennis, Volleyball and MMA appear in the sidebar as disabled with a Soon label.
- Limitation: state is stored in the browser only. Two tabs open at once both advance the simulation and the last to save wins.
- Limitation: Log In and Register show a message because the prototype opens without authentication.
- Limitation: the creator leaderboard and profile history is generated demo data, labelled as such.