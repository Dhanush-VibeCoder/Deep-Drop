// Future-facing entity shape. The current local player remains the original P object.
export function createPlayerInterface(overrides = {}) {
  return { kind: 'local', id: null, position: null, health: 100, ...overrides };
}
