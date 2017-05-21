//@flow
export const transitions: Array<*> = window.GLTransitions || [];
export const transitionsByName = {};
transitions.forEach(t => {
  transitionsByName[t.name] = t;
});
