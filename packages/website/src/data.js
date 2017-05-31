//@flow
import { supplyDefaultSampler2DToTransition } from "./transform";
export const transitions: Array<*> = (window.GLTransitions || [])
  .map(supplyDefaultSampler2DToTransition);
export const transitionsOrderByCreatedAt = transitions.sort((a, b) => {
  return new Date(b.createdAt) - new Date(a.createdAt);
});
export const transitionsOrderByUpdatedAt = transitions.sort((a, b) => {
  return new Date(b.updatedAt) - new Date(a.updatedAt);
});
export const transitionsOrderByRandom = transitions.sort(
  () => 0.5 - Math.random()
);
export const transitionsByName = {};
transitions.forEach(t => {
  transitionsByName[t.name] = t;
});
