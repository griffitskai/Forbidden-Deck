import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const errors = [];
const KEY = 'forbidden_deck_relationship_v1';

async function freshPage() {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const page = await context.newPage();
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('http://127.0.0.1:8000/', { waitUntil: 'networkidle' });
  return page;
}

async function openCamp(page, enabled) {
  const stage = await page.evaluate(({ enabled, key }) => {
    ForbiddenDeckMenu.close();
    newRun('standard');
    ForbiddenTutorial.setEnabled(false);
    localStorage.setItem(key, JSON.stringify({
      schema: 1, seen: ['trust20'], choices: [{ scene: 'trust20', choice: 'right-side', at: '2026-10-01' }],
      stats: { scenes: 1, supportive: 1, pragmatic: 0 }, pendingBoon: null, roadSeen: false
    }));
    ForbiddenDeckRelationship.setRomanceEnabled(enabled);
    S.trust = 40; saveTrust();
    S.stage = currentAct().route.findIndex(row => row.some(node => node.type === 'camp'));
    renderMap();
    return S.stage;
  }, { enabled, key: KEY });
  assert(stage >= 0, 'Act I must contain a camp');
  await page.locator('.node.camp:not(.locked)').click();
  await page.locator('#modalBody .choice').filter({ hasText: 'Rozmowa' }).click();
  await page.waitForSelector('#campfireScene');
  return stage;
}

async function reachChoice(page) {
  await page.locator('#campfireNext').click();
  await page.locator('#campfireNext').click();
  await page.waitForSelector('[data-camp-choice="friendship"]');
}

async function finishChoice(page, choice) {
  await page.locator(`[data-camp-choice="${choice}"]`).click();
  await page.locator('#campfireNext').click();
  if(choice === 'romance') {
    const text = await page.locator('.campfire-line').textContent();
    assert(text.includes('Chcę.') && text.includes('Kael odpowiada'), 'The ending must express both characters choosing closeness');
  }
  await page.locator('#campfireNext').click();
  await page.waitForSelector('#mapScreen.active');
}

try {
  const outcomes = [];
  for(const scenario of [
    { enabled: true, choice: 'friendship' },
    { enabled: true, choice: 'romance' },
    { enabled: false, choice: 'friendship' },
    { enabled: false, choice: 'skipped' }
  ]) {
    const page = await freshPage();
    assert.equal(await page.locator('#romanceToggle').isChecked(), false, 'Romance is opt-in');
    const stage = await openCamp(page, scenario.enabled);
    assert(await page.locator('.campfire-art img').evaluate(img => img.complete && img.naturalWidth > 0), 'Camp art must load');
    if(scenario.choice === 'skipped') {
      await page.locator('#campfireSkip').click();
    } else {
      await reachChoice(page);
      assert.equal(await page.locator('[data-camp-choice="romance"]').count(), scenario.enabled ? 1 : 0);
      if(scenario.choice === 'romance') {
        // Refresh in the middle of a conversation and continue the same run.
        await page.locator('[data-camp-choice="romance"]').click();
        await page.reload({ waitUntil: 'networkidle' });
        assert.equal(await page.locator('#romanceToggle').isChecked(), true);
        await page.locator('#menuContinue').click();
        await page.waitForSelector('#campfireScene');
        assert((await page.locator('.campfire-line').textContent()).includes('Jeśli nadal tego chcesz'));
        await page.locator('#campfireNext').click();
        await page.locator('#campfireNext').click();
      } else await finishChoice(page, scenario.choice);
    }
    const result = await page.evaluate(() => ({
      trust: S.trust, stage: S.stage, hp: [S.kaelHp, S.lyraHp],
      relation: ForbiddenDeckRelationship.load(), active: S.relationshipScene
    }));
    assert.equal(result.trust, 46);
    assert.equal(result.stage, stage + 1, 'Return must advance exactly once');
    assert.equal(result.active, null);
    assert.equal(result.relation.romance.campfireChoice, scenario.choice);
    assert.equal(result.relation.pendingBoon, 'tempo');
    assert.deepEqual(result.relation.seen, ['trust20', 'trust40']);
    outcomes.push({ trust: result.trust, hp: result.hp, boon: result.relation.pendingBoon });

    await page.reload({ waitUntil: 'networkidle' });
    assert.equal(await page.locator('#romanceToggle').isChecked(), scenario.enabled);
    assert.equal(await page.evaluate(() => ForbiddenDeckRelationship.load().romance.campfireChoice), scenario.choice);
    await page.locator('#menuContinue').click();
    const energies = await page.evaluate(() => {
      S.currentNode = { type: 'battle', label: 'Test premii' };
      startBattle([enemy('Manekin', '🎯', 30, 'bandit', 4)]);
      const first = S.energy;
      startBattle([enemy('Manekin', '🎯', 30, 'bandit', 4)]);
      return [first, S.energy, ForbiddenDeckRelationship.load().pendingBoon];
    });
    assert.deepEqual(energies, [4, 3, null], 'The shared reward applies to one battle');
    await page.context().close();
  }
  outcomes.forEach(outcome => assert.deepEqual(outcome, outcomes[0], 'Romance, friendship, disabled and skipped have equal mechanical benefits'));

  // Migrate a real old-style relationship payload without resetting other stores.
  const page = await freshPage();
  const legacy = {
    schema: 1, seen: ['trust20', 'trust40', 'trust60'],
    choices: [{ scene: 'trust40', choice: 'train', at: '2026-10-01' }],
    pendingBoon: 'tempo', roadSeen: true, stats: { scenes: 3, supportive: 2, pragmatic: 1 }
  };
  const before = await page.evaluate(({ key, legacy }) => {
    ForbiddenDeckMenu.close(); newRun('standard');
    S.trust = 88; saveTrust(); S.gold = 123; ForbiddenDeckSave.save('map');
    ForbiddenDeckHistory.recordBoss('Strażniczka Pogranicza');
    ForbiddenDeckHistory.recordRun(false);
    const oldRun = JSON.parse(localStorage.getItem('forbidden_deck_run_v1'));
    delete oldRun.state.relationshipScene;
    ForbiddenDeckSave.clear(); // Prevent beforeunload from rewriting the legacy fixture.
    localStorage.setItem('forbidden_deck_run_v1', JSON.stringify(oldRun));
    localStorage.setItem(key, JSON.stringify(legacy));
    return { run: oldRun, history: localStorage.getItem('forbidden_deck_history_v1'), meta: localStorage.getItem('forbidden_deck_meta_v1') };
  }, { key: KEY, legacy });
  await page.reload({ waitUntil: 'networkidle' });
  const migrated = await page.evaluate(() => ForbiddenDeckRelationship.load());
  assert.equal(migrated.schema, 2);
  for(const field of ['seen', 'choices', 'stats', 'pendingBoon', 'roadSeen']) assert.deepEqual(migrated[field], legacy[field], `Migration must preserve ${field}`);
  assert.equal(migrated.romance.campfireChoice, null, 'Legacy Trust/choices do not imply romantic consent');
  const after = await page.evaluate(() => ({ run: JSON.parse(localStorage.getItem('forbidden_deck_run_v1')), history: localStorage.getItem('forbidden_deck_history_v1'), meta: localStorage.getItem('forbidden_deck_meta_v1') }));
  assert.deepEqual(after, before, 'Migration must leave run, history and collection untouched');
  await page.locator('#menuContinue').click();
  assert.equal(await page.evaluate(() => S.gold), 123, 'Old run restores');
  await page.evaluate(() => ForbiddenDeckRelationship.open());
  await page.locator('#relationshipRomanceToggle').check();
  assert.equal(await page.locator('#romanceToggle').isChecked(), true, 'Both setting controls stay in sync');
  await page.locator('#replayCampfire').click();
  await reachChoice(page);
  await finishChoice(page, 'romance');
  const upgraded = await page.evaluate(() => ({ trust: S.trust, relation: ForbiddenDeckRelationship.load() }));
  assert.equal(upgraded.trust, 88, 'Legacy replay must not award Trust');
  assert.deepEqual(upgraded.relation.choices, legacy.choices);
  assert.deepEqual(upgraded.relation.stats, legacy.stats);
  assert.equal(upgraded.relation.pendingBoon, 'tempo');
  assert.equal(upgraded.relation.romance.campfireChoice, 'romance', 'An old player can explicitly choose the new scene');
  await page.locator('#replayCampfire').click();
  await reachChoice(page);
  await finishChoice(page, 'friendship');
  assert.equal(await page.evaluate(() => ForbiddenDeckRelationship.load().romance.campfireChoice), 'romance', 'Replays do not overwrite a completed choice');
  await page.context().close();

  // Missing artwork must never block the narrative or run.
  const fallback = await freshPage();
  await fallback.route('**/assets/**/*.webp', route => route.abort());
  await openCamp(fallback, false);
  await reachChoice(fallback);
  await finishChoice(fallback, 'friendship');
  assert.equal(await fallback.evaluate(() => S.trust), 46);
  await fallback.context().close();

  // Disabling the setting during an unfinished romantic branch returns to choice.
  const interrupted = await freshPage();
  await openCamp(interrupted, true); await reachChoice(interrupted);
  await interrupted.locator('[data-camp-choice="romance"]').click();
  await interrupted.evaluate(() => ForbiddenDeckRelationship.setRomanceEnabled(false));
  assert.equal(await interrupted.locator('[data-camp-choice="romance"]').count(), 0);
  await finishChoice(interrupted, 'friendship');
  assert.equal(await interrupted.evaluate(() => ForbiddenDeckRelationship.load().romance.campfireChoice), 'friendship');
  await interrupted.context().close();

  assert.deepEqual(errors, [], 'No critical JavaScript errors');
  console.log('Campfire OK: equal benefits across 4 paths, persistent opt-in, resumed dialogue, legacy migration, replay, missing art and disabled branch.');
} finally {
  await browser.close();
}
