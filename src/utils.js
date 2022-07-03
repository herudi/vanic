export const sto = setTimeout;

export const isFunc = (val) => typeof val === 'function';

export function filteredArray(arr1, arr2) {
  const newArr = Object.assign([], arr1);
  let i = 0;
  const len = arr2.length;
  while (i < len) {
    const idx = newArr.indexOf(arr2[i]);
    if (idx >= 0) newArr.splice(idx, 1);
    i++;
  }
  return newArr;
}

export function escHTML(unsafe) {
  return String(unsafe)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
function styleToString(style) {
  return Object.keys(style).reduce(
    (acc, key) =>
      acc +
      key
        .split(/(?=[A-Z])/)
        .join('-')
        .toLowerCase() +
      ':' +
      style[key] +
      ';',
    ''
  );
}

export function removeAttributes(fn, rep) {
  return (typeof fn === 'string' ? fn : fn()).replace(/ c-.*="\d+"/g, (a) => {
    const arr = (a || '').split(' ');
    let str = '';
    for (let i = 0; i < arr.length; i++) {
      const ret = rep[arr[i]];
      if (ret) {
        const { key, value } = ret;
        const type = typeof value;
        if (type === 'object' && key !== 'ref') {
          str += ` ${key}="${styleToString(value)}"`;
        }
        if (value === true) str += ` ${key}`;
      }
    }
    return str;
  });
}

export function hasChange(old, next) {
  return !old || next.some((dep, x) => dep !== old[x]);
}

function runCleanup(effect) {
  if (isFunc(effect.c)) effect.c();
}

export function findParent(elem) {
  if (elem.tagName === 'BODY' || !elem.parentNode) return null;
  const p = elem.parentNode;
  if (p && p.getAttribute) {
    const attr = p.getAttribute('c-comp');
    if (attr) return attr;
  }
  return findParent(p);
}

export function invoveEffect(effect, status, makeSto, force) {
  const hc = effect._d ? hasChange(effect.d, effect._d) : true;
  effect._d = effect.d;
  if (force || status || hc) {
    if (!status) {
      runCleanup(effect);
      effect.c = undefined;
    }
    if (isFunc(effect.v)) {
      if (makeSto) sto(() => (effect.c = effect.v()));
      else effect.c = effect.v();
    }
  }
}

export function cleanEffect(c) {
  if (c.hook) sto(() => c.hook.s.forEach(runCleanup));
}

export function runEffectFromStates(hook, status, makeSto, force) {
  const arr = hook.s,
    len = arr.length;
  let i = 0;
  if (len) {
    const effects = [];
    const layoutEffects = [];
    const makeEffect = (effect) => invoveEffect(effect, status, makeSto, force);
    while (i < len) {
      const s = arr[i];
      if (s.s === true) effects.push(s);
      else if (s.s === false) layoutEffects.push(s);
      i++;
    }
    if (effects.length) sto(() => effects.forEach(makeEffect));
    layoutEffects.forEach(makeEffect);
  }
}
