import { getSyncedSceneOffset } from '../src/scrollSync';

describe('getSyncedSceneOffset', () => {
  it('matches a partially collapsed source scene', () => {
    expect(getSyncedSceneOffset(48, 0, 120)).toBe(48);
  });

  it('keeps the header collapsed when the target is near the top', () => {
    expect(getSyncedSceneOffset(240, 20, 120)).toBe(120);
  });

  it('preserves a target that is already scrolled beyond the header', () => {
    expect(getSyncedSceneOffset(240, 180, 120)).toBe(180);
  });

  it('normalizes negative offsets and collapse distances', () => {
    expect(getSyncedSceneOffset(-20, -10, -1)).toBe(0);
  });
});
