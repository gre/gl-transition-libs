//@flow
export const transitions: Array<*> = window.GLTransitions || [];
export const transitionsByCreatedAt = transitions.sort((a, b) => {
  return new Date(b.createdAt) - new Date(a.createdAt);
});
export const transitionsByUpdatedAt = transitions.sort((a, b) => {
  return new Date(b.updatedAt) - new Date(a.updatedAt);
});
export const transitionsByName = {};
transitions.forEach(t => {
  transitionsByName[t.name] = t;
});
