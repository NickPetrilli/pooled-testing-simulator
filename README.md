# Pooled Testing Simulator

A COVID-19 pooled testing simulator originally built in Java for an algorithms course at Marist College, later extended with a real-time 3D visualization built in React and Three.js.

---

## Background

During the COVID-19 pandemic, Marist College implemented a pooled testing strategy to screen large portions of the campus population efficiently. Rather than testing every individual one-by-one, samples from multiple people were combined into a single pool and tested together. If a pool came back negative, everyone in it was cleared with just one test. Only pools that tested positive required follow-up individual testing.

As a class project, we were tasked with implementing this strategy in code and analyzing how many tests it saves compared to testing everyone individually — particularly at low infection rates like the 2% baseline used on campus.

---

## How the Algorithm Works

The simulation uses a three-tier pooled testing strategy:

### Tier 1 — Pool of 8
The full population is divided into groups of 8. Each group is tested as a single pool (1 test).

- **Pool negative** → all 8 people are cleared. Done in 1 test.
- **Pool positive** → at least one person in the group is infected; advance to Tier 2.

### Tier 2 — Subgroups of 4
The pool of 8 is split into two subgroups of 4. Each subgroup is tested as a pool (1 test each, 2 tests total).

- **Subgroup negative** → all 4 people in that half are cleared.
- **Subgroup positive** → at least one person is infected; advance to Tier 3.

### Tier 3 — Individual Testing
Every person in the positive subgroup of 4 is tested individually (4 tests).

- Each person is confirmed positive or negative.

This means a fully clean group of 8 costs **1 test**. A worst-case group where both halves are infected costs at most **1 + 2 + 8 = 11 tests**. At low infection rates, the vast majority of pools clear cleanly, making the savings dramatic.

---

## Test Savings at 2% Infection Rate

Compared to testing every person individually, the pooled strategy saves roughly **74–75% of tests** at a 2% infection rate:

| Population | Tests Required (Pooled) | Tests Required (Individual) | Tests Saved |
|---|---|---|---|
| 1,000 | 255 | 1,000 | 745 (74.5%) |
| 10,000 | 2,560 | 10,000 | 7,440 (74.4%) |
| 100,000 | 25,686 | 100,000 | 74,314 (74.3%) |
| 1,000,000 | 256,206 | 1,000,000 | 743,794 (74.4%) |

The savings scale linearly with population — the ratio stays consistent because the strategy's efficiency depends on the infection rate, not the raw population size. At 2% infection, roughly 1 in 50 people is infected. With groups of 8, the probability that a given pool of 8 contains at least one infected person is approximately 15%, meaning about 85% of pools clear in a single test.

---

## Java Implementation

The original simulation is written in Java and lives in [`src/java/`](src/java/).

**`Person.java`** — Represents an individual. Holds a single `isSick` flag (0 = healthy, 1 = infected).

**`ListPeople.java`** — Manages the population list. Populates it with `Person` objects and applies the infection rate by iterating over the list and randomly infecting each person with the configured probability.

**`PooledTesting.java`** — Core simulation logic. Contains three key methods:
- `infect()` — seeds the population with the 2% infection rate
- `test()` — runs the three-tier pooled testing algorithm and counts total tests used
- `splitInGroups()` / `splitInTwo()` — utility methods for partitioning the list into pools and subpools

To run the original Java simulation:

```bash
cd src/java
javac PooledTesting.java
java PooledTesting
```

You will be prompted to enter a population size (1,000 / 10,000 / 100,000 / 1,000,000). The program outputs which individuals were infected and the total number of tests required.

---

## React / Three.js Visualization

After the original course project, the simulation was picked back up and given a real-time 3D visualization built with React, TypeScript, and Three.js. The visualization makes the pooled testing logic intuitive to watch:

- Each person is rendered as a sphere. Color indicates status: untested (gray), pooling (blue), testing (yellow), cleared (green), infected subgroup (red), confirmed infected (bright red).
- Pool boundary rings appear around each group, changing color as the pool result comes in.
- When a pool tests positive, you can see the group split into two subgroups of 4, then watch individual testing proceed.
- Controls let you configure population size, infection rate, and playback speed. An analytics overlay tracks tests used, infected count, cleared count, and efficiency in real time.

**Tech stack:** React 18, TypeScript, Vite, Three.js (`@react-three/fiber`), Zustand, Framer Motion, Tailwind CSS, Recharts.

```bash
npm install
npm run dev
```
