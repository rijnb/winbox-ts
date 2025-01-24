export function addListener(
  node: Window | Element,
  event: string,
  fn: EventListenerOrEventListenerObject,
  opt?: AddEventListenerOptions | boolean
): void {
  node && node.addEventListener(event, fn, opt || false)
}

export function removeListener(
  node: Window | Element,
  event: string,
  fn: EventListenerOrEventListenerObject,
  opt?: AddEventListenerOptions | boolean
): void {
  node && node.removeEventListener(event, fn, opt || false)
}

export function preventEvent(event: Event, prevent?: boolean): void {
  event.stopPropagation()
  prevent && event.preventDefault()
}

export function getByClass(root: Document | Element, name: string): Element | null {
  return root.getElementsByClassName(name)[0] || null
}

export function addClass(node: Element, classname: string): void {
  node.classList.add(classname)
}

export function hasClass(node: Element, classname: string): boolean {
  return node.classList.contains(classname)
}

export function removeClass(node: Element, classname: string): void {
  node.classList.remove(classname)
}

export function setStyle(node: HTMLElement, style: string, value: string | number): void {
  value = "" + value

  if ((node as any)["_s_" + style] !== value) {
    node.style.setProperty(style, value)
    ;(node as any)["_s_" + style] = value
  }
}

export function setAttribute(node: Element, key: string, value: string | number): void {
  value = "" + value

  if ((node as any)["_a_" + key] !== value) {
    node.setAttribute(key, value)
    ;(node as any)["_a_" + key] = value
  }
}

export function removeAttribute(node: Element, key: string): void {
  if ((node as any)["_a_" + key] !== null) {
    node.removeAttribute(key)
    ;(node as any)["_a_" + key] = null
  }
}

export function setText(node: Element, value: string): void {
  const textnode = node.firstChild
  textnode ? (textnode.nodeValue = value) : (node.textContent = value)
}
