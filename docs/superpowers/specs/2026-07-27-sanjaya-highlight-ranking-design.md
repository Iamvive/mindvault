# Project Sanjaya: Top 3 Highlights Multi-Factor Ranking Design Specification

## 1. Goal
Implement a multi-factor scoring model (Model 1: Balanced Life & Growth) in Project Sanjaya to dynamically evaluate, score, and select the **Top 3 Highlights of the Day** from wearable audio transcripts.

## 2. Multi-Factor Scoring Model (Model 1)

Every recorded conversation snippet is scored on 4 weighted sub-metrics (1 to 10 scale):
- **`impact_score` (40% Weight)**: Strategic decision value, key problem solving, work/life milestone.
- **`relational_score` (30% Weight)**: Emotional depth, Gottman connection bids, family warmth, active listening.
- **`actionability_score` (20% Weight)**: Density of action items, explicit promises made, follow-up commitments.
- **`substance_score` (10% Weight)**: Conversation duration relative to fluff/filler word ratio.

### Composite Score Formula
`composite_score = (impact_score * 0.4) + (relational_score * 0.3) + (actionability_score * 0.2) + (substance_score * 0.1)`

The top 3 conversations with the highest `composite_score` are selected for `key_memories`.

---

## 3. Fallback Heuristic Ranking

In fallback or test mode:
`heuristic_score = (summary_length * 0.4) + (emotions_count * 2.0) + (participants_count * 1.5)`
Raw memories are sorted descending by `heuristic_score` to select the top 3.

---

## 4. UI Dashboard Display

The **Top 3 Highlights of the Day** cards on the Darshana Dashboard will render:
- **Composite Score Badge**: (e.g. `⭐ 9.2 High Value`)
- **Environment Tag**: (`🏢 Office` vs `🏠 Personal`)
- **Highlight Context & Description**
