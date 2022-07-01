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
  return (
    !old || old.length !== next.length || next.some((dep, x) => dep !== old[x])
  );
}

function runCleanup(effect) {
  if (isFunc(effect.clean)) effect.clean();
}

export function invoveEffect(effect, i) {
  if (typeof i !== 'boolean') {
    runCleanup(effect);
    effect.clean = undefined;
  }
  if (isFunc(effect.val)) {
    sto(() => (effect.clean = effect.val()));
  }
}

export function cleanEffect(c) {
  if (c.hook) sto(() => c.hook.s.forEach(runCleanup));
}

export function runEffectFromStates(arr, status) {
  if (arr.length) {
    const effects = arr.filter((el) => el.status === true);
    const layoutEffects = arr.filter((el) => el.status === false);
    if (effects.length)
      sto(() => effects.forEach((effect) => invoveEffect(effect, status)));
    if (layoutEffects.length)
      layoutEffects.forEach((effect) => invoveEffect(effect, status));
  }
}
