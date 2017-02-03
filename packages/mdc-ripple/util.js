/**
 * Copyright 2016 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import MDCRippleAdapter from './adapter'; // eslint-disable-line no-unused-vars

/**
 * @param {!Window} windowObj
 * @return {boolean}
 */
export function supportsCssVariables(windowObj) {
  const supportsFunctionPresent = windowObj.CSS && typeof windowObj.CSS.supports === 'function';
  if (!supportsFunctionPresent) {
    return false;
  }

  const explicitlySupportsCssVars = windowObj.CSS.supports('--css-vars', 'yes');
  // See: https://bugs.webkit.org/show_bug.cgi?id=154669
  // See: README section on Safari
  const weAreFeatureDetectingSafari10plus = (
    windowObj.CSS.supports('(--css-vars: yes)') &&
    windowObj.CSS.supports('color', '#00000000')
  );
  return explicitlySupportsCssVars || weAreFeatureDetectingSafari10plus;
}

/**
 * @param {!Object} HTMLElementPrototype
 * @return {string}
 */
export function getMatchesProperty(HTMLElementPrototype) {
  return /** @type {string} */ ([
    'webkitMatchesSelector', 'msMatchesSelector', 'matches',
  ].filter((p) => p in HTMLElementPrototype).pop());
}

/**
 * @param {!MDCRippleAdapter} rippleAdapter
 * @param {string} cls
 * @param {string} endEvent
 * @return {function(): void}
 */
export function animateWithClass(rippleAdapter, cls, endEvent) {
  let cancelled = false;
  const cancel = () => {
    if (cancelled) {
      return;
    }
    cancelled = true;
    rippleAdapter.removeClass(cls);
    rippleAdapter.deregisterInteractionHandler(endEvent, cancel);
  };
  rippleAdapter.registerInteractionHandler(endEvent, cancel);
  rippleAdapter.addClass(cls);
  return cancel;
}

/**
 * @param {!Event} ev
 * @param {!{x: number, y: number}} pageOffset
 * @param {!ClientRect} clientRect
 * @return {!{left: number, top: number}}
 */
export function getNormalizedEventCoords(ev, pageOffset, clientRect) {
  const {x, y} = pageOffset;
  const documentLeft = x + clientRect.left;
  const documentTop = y + clientRect.top;

  let normalizedLeft;
  let normalizedTop;
  // Determine touch point relative to the ripple container.
  if (ev.type === 'touchend') {
    ev = /** @type {!TouchEvent} */ (ev);
    normalizedLeft = ev.changedTouches[0].pageX - documentLeft;
    normalizedTop = ev.changedTouches[0].pageY - documentTop;
  } else {
    ev = /** @type {!PointerEvent} */ (ev);
    normalizedLeft = ev.pageX - documentLeft;
    normalizedTop = ev.pageY - documentTop;
  }

  return {left: normalizedLeft, top: normalizedTop};
}
