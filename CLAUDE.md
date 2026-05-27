# AI Investment Intelligence Platform — CLAUDE.md

## Project Identity

This project is a production-grade AI-powered investment intelligence platform focused on:

* Crypto markets
* Philippine stock market
* Multi-timeframe analysis
* Decision-support intelligence
* Portfolio intelligence
* Explainable AI analysis

The platform is NOT a guaranteed prediction system and MUST NEVER market itself as one.

The platform exists to:

* aggregate signals
* summarize market conditions
* explain probabilities
* assist decision-making
* reduce emotional trading
* provide structured investment intelligence

---

# Core Architecture Principles

## 1. Modular Architecture

Strict modular service architecture.

Never create:

* giant files
* giant components
* tightly coupled services

All features must be:

* reusable
* isolated
* scalable
* testable

---

## 2. Separation of Concerns

Frontend:

* UI only
* presentation logic
* client state

Backend:

* business logic
* analysis engines
* AI orchestration
* APIs
* calculations

Database:

* persistence only

AI Layer:

* summarization
* reasoning
* explanation
* probability interpretation

Never mix responsibilities.

---

## 3. AI Safety Rules

The AI system must NEVER:

* guarantee profits
* claim certainty
* promise future price accuracy
* create scam-like messaging
* use hype language

The AI system SHOULD:

* explain probabilities
* explain risks
* summarize indicators
* explain scenarios
* provide confidence levels
* encourage disciplined investing

Bad Example:
"BTC will definitely pump tomorrow."

Good Example:
"Current indicators suggest moderate bullish continuation probability, though volatility risk remains elevated."

---

# Supported Markets

## Crypto

* Binance
* Coins.ph referenced pricing
* CoinGecko-supported assets

## Philippine Stocks

* PSE-listed companies
* PSE-related data providers

---

# Supported Timeframes

* 4H
* 1D
* 1W
* 1M
* 1Y

---

# Main System Modules

## Technical Analysis Engine

Must support:

* RSI
* MACD
* EMA/SMA
* Bollinger Bands
* Volume analysis
* Trend structure
* Support/resistance
* Liquidity zones

---

## Fundamental Analysis Engine

Crypto:

* market cap
* tokenomics
* unlock schedules
* ecosystem growth
* GitHub activity
* whale activity

Stocks:

* earnings
* growth metrics
* sector analysis
* institutional activity

---

## Sentiment Engine

Analyze:

* Reddit
* Twitter/X
* News
* Fear & Greed Index
* PH market sentiment

---

## AI Recommendation Engine

Outputs:

* Buy
* Accumulate
* Hold
* Reduce Exposure
* Take Partial Profit
* Avoid Entry

Must include:

* confidence score
* risk level
* scenario analysis

---

## Portfolio Intelligence

Must support:

* holdings tracking
* allocation analysis
* diversification score
* risk exposure
* suggested max allocation
* position sizing

---

## Backtesting Engine

Must support:

* historical testing
* signal validation
* strategy simulations
* historical probabilities

---

## Alerts Engine

Must support:

* breakout alerts
* oversold alerts
* whale alerts
* support/resistance breaks
* volatility spikes

---

# Tech Stack Rules

## Frontend

Required:

* Next.js
* TypeScript
* TailwindCSS
* shadcn/ui

Use:

* reusable components
* clean UI
* responsive layouts
* dark/light mode

Avoid:

* messy component logic
* duplicated UI logic

---

## Backend

Required:

* Python
* FastAPI
* AsyncIO
* WebSockets

Architecture:

* service-based
* async-first
* scalable APIs

---

## Database

Required:

* PostgreSQL
* Redis cache

Rules:

* normalized schema
* indexed queries
* no unnecessary duplication

---

# Code Quality Rules

## Required

* strict typing
* reusable functions
* modular services
* production-grade error handling
* logging everywhere
* validation everywhere
* environment variable usage
* async-safe architecture

---

## Forbidden

* hardcoded secrets
* giant files
* duplicated business logic
* inline massive SQL
* untyped APIs
* direct frontend DB access

---

# API Rules

All APIs must:

* be versioned
* include validation
* include error handling
* support rate limiting
* support retries

Use:

* RESTful conventions
* typed responses

---

# UI/UX Principles

The platform should feel:

* professional
* institutional-grade
* clean
* modern
* data-rich but understandable

Avoid:

* gambling-style UI
* hype design
* scammy visuals

Preferred:

* dashboards
* clean tables
* probability indicators
* explainable analysis cards

---

# Performance Rules

Must support:

* caching
* lazy loading
* optimized API usage
* websocket live updates
* scalable architecture

---

# Development Workflow

Build in phases.

Recommended order:

1. Foundation architecture
2. Authentication
3. Market data engine
4. Technical analysis engine
5. Fundamental analysis engine
6. Sentiment engine
7. AI reasoning engine
8. Portfolio intelligence
9. Alerts system
10. Backtesting
11. Optimization
12. Deployment

---

# Deployment Rules

Must support:

* Docker
* VPS deployment
* environment configs
* CI/CD
* monitoring
* production logging

---

# Final Principle

This platform is an AI-assisted investment intelligence system.

It is NOT:

* a guaranteed prediction system
* a gambling platform
* a fake AI hype app

Focus on:

* clarity
* explainability
* disciplined investing
* probability analysis
* intelligent decision support

 ---

# Platform Accessibility

The platform must be cloud-accessible and usable across multiple devices through browser access.

Users must be able to:
- access the platform remotely
- use desktop browsers
- use tablets
- use mobile devices
- access the platform outside local networks

The architecture must support:
- cloud deployment
- scalable APIs
- secure authentication
- multi-device sessions

---

# Progressive Web App (PWA)

The frontend should support Progressive Web App (PWA) capabilities.

Requirements:
- installable on desktop and mobile
- app-like experience
- responsive layouts
- offline-safe UI shell where possible
- fast loading
- mobile-friendly navigation

The application should feel like:
- institutional trading dashboard
- professional investment terminal
- modern fintech platform

---

# Charting & Market Visualization

The platform should include a dedicated chart analysis tab.

The chart system should:
- support multiple timeframes
- display price action clearly
- support crypto and Philippine stock assets
- support interactive charting
- support real-time updates where possible

Preferred implementation:
- TradingView integration or lightweight institutional-style chart system

Avoid:
- cluttered charts
- excessive indicators
- gambling-style visuals

---

# Institutional Signal Overlay System

The charting system should support intelligent signal overlays inspired by institutional analysis workflows.

Supported overlays:
- trend direction
- support/resistance zones
- bullish/bearish structure
- volatility zones
- momentum zones
- breakout detection
- liquidity sweep detection
- accumulation/distribution zones
- trend continuation probability

The system should prioritize:
- clarity
- explainability
- actionable insight

Avoid:
- fake hype signals
- guaranteed prediction language
- excessive visual noise

---

# AI Signal Explanation Engine

All major technical signals should include AI-generated explanations.

Example:
"Bullish continuation probability increased due to strong EMA alignment, increasing volume, and breakout confirmation above resistance."

The AI system should explain:
- WHY a signal exists
- WHAT indicators contributed
- WHAT risks remain
- WHAT scenarios are possible

The platform must emphasize:
- probability analysis
- disciplined investing
- explainable reasoning

---

# Long-Term Investment Intelligence

The long-term module should focus on:
- fundamentals
- accumulation opportunities
- growth potential
- macro trends
- valuation awareness
- portfolio allocation logic

Required long-term table fields:
- Current Price
- Buy Below Price
- Target Price
- Expected Growth
- Max Allocation %
- % From Target
- Recommendation
- Risk Level
- Confidence Score

Recommendations may include:
- Buy
- Accumulate
- Hold
- Stop Buying
- Reduce Exposure
- Take Profit

---

# Short-Term Trading Intelligence

The short-term module should focus on:
- technical structure
- support/resistance
- volatility
- swing opportunities
- momentum analysis
- risk management

Required short-term table fields:
- Current Price
- Support Level
- Resistance Level
- Break-even Price
- Average Recommendation
- Sell Recommendation
- Suggested Take Profit
- Fees-aware profitability
- Projection by timeframe

Supported projections:
- 4H
- 1D
- 1W
- 1M
- 1Y

The engine should consider:
- Binance fees
- Coins.ph fees
- slippage assumptions
- realistic execution logic

---

# Market Coverage

Supported markets:
- Crypto
- Philippine Stock Market

Supported exchanges and references:
- Binance
- Coins.ph
- CoinGecko
- TradingView-supported feeds
- Philippine market data providers

Prices should support:
- USDT
- PHP

---

# Best Picks Engine

The platform should include:
- long-term best picks
- short-term best picks
- risk-ranked opportunities
- confidence-ranked opportunities

The system should avoid:
- hype recommendations
- unrealistic projections

The ranking engine should combine:
- technical analysis
- fundamentals
- sentiment
- volatility
- liquidity
- AI reasoning

---

# Portfolio-Aware Intelligence

The platform should support user buying power inputs.

Supported buying power:
- USDT
- PHP

The AI system should:
- estimate position sizing
- suggest max exposure
- suggest averaging logic
- estimate realistic profitability
- estimate fees-aware break-even levels

The platform should support:
- multiple referenced exchanges
- exchange-aware calculations
- portfolio exposure analysis

---

# UI Philosophy

The UI should feel:
- institutional-grade
- modern
- minimal but information-rich
- professional
- trustworthy

Avoid:
- meme-style visuals
- gambling aesthetics
- cluttered dashboards
- excessive colors
- scam-like signal design

Focus on:
- clarity
- explainability
- confidence visualization
- clean tables
- readable analytics
- structured insights

---

# Trade History & Investment Journal System

The platform should include a comprehensive trade recording and investment journal system.

The system must support:

- manual trade recording

- exchange-based trade imports where possible

- crypto trades

- Philippine stock trades

- portfolio transaction history

Each trade record should support:

- asset name

- market type

- exchange used

- buy price

- sell price

- quantity

- position size

- fees paid

- entry timestamp

- exit timestamp

- profit/loss amount

- profit/loss percentage

- holding duration

- break-even calculation

- trade notes

- strategy tags

Supported exchanges:

- Binance

- Coins.ph

- future supported exchanges

---

# AI Trading Journal Intelligence

The AI system should analyze historical user trades.

The AI should identify:

- successful patterns

- repeated mistakes

- emotional trading behavior

- overexposure

- poor risk-reward setups

- strongest-performing strategies

- weakest-performing strategies

Example insights:

"Historically, your swing trades during high volatility conditions produced lower win rates."

"Your highest-performing trades occurred during bullish trend continuation setups."

The AI system should focus on:

- behavioral awareness

- disciplined investing

- risk management

- portfolio improvement

Avoid:

- insulting language

- overconfident conclusions

- unrealistic guarantees

---

# Trade Analytics Dashboard

The platform should include analytics dashboards for trade performance.

Metrics may include:

- total profit/loss

- win rate

- average trade return

- risk-reward ratio

- average holding duration

- best-performing assets

- worst-performing assets

- strategy performance

- monthly performance

- yearly performance

- fees paid

- portfolio growth

The dashboard should support:

- charts

- tables

- filtering

- timeframe selection

---

# Portfolio Timeline & Historical Tracking

The platform should maintain historical portfolio tracking.

The system should track:

- portfolio value over time

- realized profits

- unrealized profits

- historical allocation

- investment growth

- capital inflows/outflows

The platform should support:

- historical snapshots

- portfolio performance visualization

- timeline-based analytics

---

# Smart Trade Recommendations

The AI system may generate recommendations based on historical trading behavior.

Examples:

- recommended position sizing

- recommended take-profit zones

- risk exposure warnings

- overtrading warnings

- diversification suggestions

The system should prioritize:

- disciplined execution

- sustainable investing

- probability-based decision support  

---

# Authentication & Security

The platform must support secure authentication and account protection.

Required:

- JWT authentication
- refresh tokens
- encrypted credentials
- secure session handling
- role-based access preparation
- API key encryption
- environment secret protection

The platform must NEVER expose:
- exchange API keys
- database credentials
- secret environment variables

Preferred:
- OAuth-ready architecture
- 2FA-ready structure
- secure audit logging

---

# AI Usage & Cost Optimization

The AI system should optimize token usage and API costs.

Preferred behavior:
- summarize structured data before AI calls
- avoid unnecessary repeated prompts
- cache AI outputs where reasonable
- prioritize deterministic calculations before AI reasoning

AI should enhance:
- interpretation
- explainability
- probability analysis

AI should NOT replace:
- mathematical calculations
- technical indicator computation
- database filtering

---

# Monitoring & Observability

The platform should include production-grade monitoring.

Required:
- structured logging
- API error tracking
- backend monitoring
- websocket monitoring
- retry tracking
- performance metrics

Preferred:
- centralized logging
- uptime monitoring
- analytics dashboards
