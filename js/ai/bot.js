// Future-facing entity shape shared by local bots and future remote participants.
export function createBotInterface(overrides = {}) {
  return { kind: 'bot', id: null, position: null, health: 100, ...overrides };
}
