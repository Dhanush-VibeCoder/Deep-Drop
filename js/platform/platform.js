export function createPlatformAdapter({ playgama, y8 } = {}) {
  // Adapters are intentionally inert until a platform integration is explicitly added.
  const active = [playgama, y8].find(adapter => adapter && adapter.active) || null;
  return {
    name: active ? active.name : 'local',
    active: Boolean(active),
    initialize() {},
    save() {},
    load() { return null; }
  };
}
