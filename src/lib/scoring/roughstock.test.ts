// Shared roughstock core, exercised through the saddle bronc wrapper.

import assert from 'node:assert/strict';
import { test } from 'node:test';

import type { JudgeScore, RulesProfile } from './types.ts';
import { scoreSaddleBroncRide } from './saddlebronc/index.ts';

const PRCA: RulesProfile = {
  ruleSetId: 'prca-2026',
  edition: 'PRCA 2026 Rule Book',
  associationCode: 'PRCA',
  values: { mark_out_treatment: 'disqualify', judge_count: 2, judge_component_max: 25 },
};

const IPRA: RulesProfile = {
  ruleSetId: 'ipra-2026',
  edition: 'IPRA 2026',
  associationCode: 'IPRA',
  // Changed in 2024: foot position at the moment the front feet touch down is
  // folded into the judges' marks instead of producing an automatic no score.
  values: { mark_out_treatment: 'scored', judge_count: 2, judge_component_max: 25 },
};

const CARD: JudgeScore[] = [
  { judgeId: 'j1', rider: 22, animal: 21 },
  { judgeId: 'j2', rider: 21, animal: 22 },
];

test('a qualified ride sums four component marks to a score out of 100', () => {
  const outcome = scoreSaddleBroncRide({
    qualifiedRide: true,
    markedOut: true,
    judgeScores: CARD,
    freeHandTouched: false,
    lostStirrup: false,
    lostRein: false,
    rulesProfile: PRCA,
  });
  assert.equal(outcome.status, 'clean');
  assert.equal(outcome.officialScore, 86);
});

test('a missed mark-out disqualifies under PRCA and is scored under IPRA', () => {
  const base = {
    qualifiedRide: true,
    markedOut: false,
    judgeScores: CARD,
    freeHandTouched: false,
    lostStirrup: false,
    lostRein: false,
  };

  const prca = scoreSaddleBroncRide({ ...base, rulesProfile: PRCA });
  assert.equal(prca.status, 'no_score');
  assert.equal(prca.appliedPenalties[0]?.code, 'MISSED_OUT');

  const ipra = scoreSaddleBroncRide({ ...base, rulesProfile: IPRA });
  assert.equal(ipra.status, 'clean');
  assert.equal(ipra.officialScore, 86);
  assert.match(ipra.explanation, /folded into the judges/);
});

test('bucking off before the whistle is a no score', () => {
  const outcome = scoreSaddleBroncRide({
    qualifiedRide: false,
    markedOut: true,
    judgeScores: CARD,
    freeHandTouched: false,
    lostStirrup: false,
    lostRein: false,
    rulesProfile: PRCA,
  });
  assert.equal(outcome.status, 'no_score');
  assert.equal(outcome.appliedPenalties[0]?.code, 'BUCKED_OFF');
});

test('saddle bronc disqualifications: free hand, stirrup, rein', () => {
  const base = {
    qualifiedRide: true,
    markedOut: true,
    judgeScores: CARD,
    freeHandTouched: false,
    lostStirrup: false,
    lostRein: false,
    rulesProfile: PRCA,
  };
  assert.equal(scoreSaddleBroncRide({ ...base, freeHandTouched: true }).status, 'no_score');
  assert.equal(scoreSaddleBroncRide({ ...base, lostStirrup: true }).status, 'no_score');
  assert.equal(scoreSaddleBroncRide({ ...base, lostRein: true }).status, 'no_score');
});

test('a reride offer leaves the score pending until the rider decides', () => {
  const outcome = scoreSaddleBroncRide({
    qualifiedRide: true,
    markedOut: true,
    judgeScores: CARD,
    freeHandTouched: false,
    lostStirrup: false,
    lostRein: false,
    reride: { offered: true, accepted: null },
    rulesProfile: PRCA,
  });
  assert.equal(outcome.status, 'reride_pending');
  assert.equal(outcome.officialScore, 86);
});

test('a partial judge card is refused rather than scored', () => {
  assert.throws(
    () =>
      scoreSaddleBroncRide({
        qualifiedRide: true,
        markedOut: true,
        judgeScores: [CARD[0] as JudgeScore],
        freeHandTouched: false,
        lostStirrup: false,
        lostRein: false,
        rulesProfile: PRCA,
      }),
    /Refusing to score a partial card/,
  );
});

test('a four-judge card is divided, not summed', () => {
  // PBR moved to four judges for 2026: eight marks, combined and divided by
  // two. Summing them records a 90-point ride as 180 — the defect migration
  // 0012 fixed in the database, which this engine then ignored.
  const fourJudge: RulesProfile = {
    ...PRCA,
    edition: 'Four-judge 2026',
    values: { ...PRCA.values, judge_count: 4, score_divisor: 2 },
  };

  const outcome = scoreSaddleBroncRide({
    qualifiedRide: true,
    markedOut: true,
    judgeScores: [
      { judgeId: 'j1', rider: 22, animal: 23 },
      { judgeId: 'j2', rider: 22, animal: 23 },
      { judgeId: 'j3', rider: 23, animal: 22 },
      { judgeId: 'j4', rider: 23, animal: 22 },
    ],
    freeHandTouched: false,
    lostStirrup: false,
    lostRein: false,
    rulesProfile: fourJudge,
  });
  assert.equal(outcome.officialScore, 90);
});

test('a judge count and divisor that would post an impossible score are refused', () => {
  const broken: RulesProfile = {
    ...PRCA,
    values: { ...PRCA.values, judge_count: 4, score_divisor: 1 },
  };
  assert.throws(
    () =>
      scoreSaddleBroncRide({
        qualifiedRide: true,
        markedOut: true,
        judgeScores: [
          { judgeId: 'j1', rider: 25, animal: 25 },
          { judgeId: 'j2', rider: 25, animal: 25 },
          { judgeId: 'j3', rider: 25, animal: 25 },
          { judgeId: 'j4', rider: 25, animal: 25 },
        ],
        freeHandTouched: false,
        lostStirrup: false,
        lostRein: false,
        rulesProfile: broken,
      }),
    /above the 100 maximum/,
  );
});
