/**
 * WinBox.ts
 * Author and Copyright: Thomas Wilkerling
 * Licence: Apache-2.0
 * Hosted by Nextapps GmbH
 * https://github.com/nextapps-de/winbox
 */

// TODO: rename control amd state classes (min, max, modal, focus, ...) #62

import template from "./template"
import {
  addClass,
  addListener,
  getByClass,
  hasClass,
  preventEvent,
  removeClass,
  removeListener,
  setStyle,
  setText
} from "./helper"

//const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window["MSStream"];

const use_raf = false
const stack_min: WinBox[] = []
const stack_win: WinBox[] = []
// use passive for touch and mouse wheel
const eventOptions = {capture: true, passive: false} as const
const eventOptionsPassive = {capture: true, passive: true} as const
let body: HTMLElement
let id_counter = 0
let index_counter = 10
let is_fullscreen: WinBox | undefined
let prefix_request: keyof HTMLElement
let prefix_exit: string
let root_w: number, root_h: number
let window_clicked: boolean

export interface WinBoxParams {
  id?: string
  index?: number
  root?: HTMLElement
  template?: HTMLDivElement
  title?: string
  icon?: string
  mount?: HTMLElement
  html?: string
  url?: string
  width?: number
  height?: number
  minwidth?: number
  minheight?: number
  maxwidth?: number
  maxheight?: number
  autosize?: boolean
  overflow?: boolean
  x?: number
  y?: number
  top?: number
  left?: number
  bottom?: number
  right?: number
  min?: boolean
  max?: boolean
  hidden?: boolean
  modal?: boolean
  background?: string
  border?: number
  header?: number
  class?: string | string[]
  oncreate?: (params?: WinBoxParams) => void
  onclose?: (force?: boolean) => boolean
  onfocus?: () => void
  onblur?: () => void
  onmove?: (x: number, y: number) => void
  onresize?: (w: number, h: number) => void
  onfullscreen?: () => void
  onmaximize?: () => void
  onminimize?: () => void
  onrestore?: () => void
  onhide?: () => void
  onshow?: () => void
  onload?: () => void
}

class WinBox {
  dom: HTMLElement
  id: string = ""
  index: number = 0
  x: number = 0
  y: number = 0
  width: number = 0
  height: number = 0
  minwidth: number = 0
  minheight: number = 0
  maxwidth: number = 0
  maxheight: number = 0
  top: number = 0
  right: number = 0
  bottom: number = 0
  left: |number = 0
  overflow: boolean = false
  min: boolean = false
  max: boolean = false
  full: boolean = false
  hidden: boolean = true
  focused: boolean = false
  onclose?: (force?: boolean) => boolean
  onfocus?: () => void
  onblur?: () => void
  onmove?: (x: number, y: number) => void
  onresize?: (w: number, h: number) => void
  onfullscreen?: () => void
  onmaximize?: () => void
  onminimize?: () => void
  onrestore?: () => void
  onhide?: () => void
  onshow?: () => void
  body: HTMLElement
  header: number = 0
  title: string = ""

  constructor(params: WinBoxParams) {
    body || setup()

    let id, index, root, tpl, title, icon, mount, html, url
    let width, height, minwidth, minheight, maxwidth, maxheight, autosize, overflow
    let x, y
    let top, left, bottom, right
    let min, max, hidden, modal
    let background, border, header, classname
    let oncreate,
        onclose,
        onfocus,
        onblur,
        onmove,
        onresize,
        onfullscreen,
        onmaximize,
        onminimize,
        onrestore,
        onhide,
        onshow,
        onload

    title = params.title
    id = params.id
    index = params.index
    root = params.root
    tpl = params.template
    title = title || params.title
    icon = params.icon
    mount = params.mount
    html = params.html
    url = params.url

    width = params.width
    height = params.height
    minwidth = params.minwidth
    minheight = params.minheight
    maxwidth = params.maxwidth
    maxheight = params.maxheight
    autosize = params.autosize
    overflow = params.overflow

    min = params.min
    max = params.max
    hidden = params.hidden
    modal = params.modal

    x = params.x || (modal ? "center" : 0)
    y = params.y || (modal ? "center" : 0)

    top = params.top
    left = params.left
    bottom = params.bottom
    right = params.right

    background = params.background
    border = params.border
    header = params.header
    classname = params.class

    oncreate = params.oncreate
    onclose = params.onclose
    onfocus = params.onfocus
    onblur = params.onblur
    onmove = params.onmove
    onresize = params.onresize
    onfullscreen = params.onfullscreen
    onmaximize = params.onmaximize
    onminimize = params.onminimize
    onrestore = params.onrestore
    onhide = params.onhide
    onshow = params.onshow
    onload = params.onload

    this.dom = template(tpl)
    this.dom.id = this.id = id || "winbox-" + ++id_counter
    this.dom.className =
        "winbox" +
        (classname ? " " + (typeof classname === "string" ? classname : classname.join(" ")) : "") +
        (modal ? " modal" : "")
    ;(this.dom as any).winbox = this
    this.body = getByClass(this.dom, "wb-body") as HTMLElement
    this.header = header || 35

    stack_win.push(this)

    if (background) {
      this.setBackground(background)
    }

    if (border) {
      setStyle(this.body, "margin", border + (isNaN(border as number) ? "" : "px"))
    } else {
      border = 0
    }

    if (header) {
      const node = getByClass(this.dom, "wb-header") as HTMLElement
      setStyle(node, "height", header + "px")
      setStyle(node, "line-height", header + "px")
      setStyle(this.body, "top", header + "px")
    }

    if (title) {
      this.setTitle(title)
    }

    if (icon) {
      this.setIcon(icon)
    }

    if (mount) {
      this.mount(mount)
    } else if (html) {
      this.body.innerHTML = html
    } else if (url) {
      this.setUrl(url, onload)
    }

    top = top ? parse(top, root_h) : 0
    bottom = bottom ? parse(bottom, root_h) : 0
    left = left ? parse(left, root_w) : 0
    right = right ? parse(right, root_w) : 0

    const viewport_w = root_w - left - right
    const viewport_h = root_h - top - bottom

    maxwidth = maxwidth ? parse(maxwidth, viewport_w) : viewport_w
    maxheight = maxheight ? parse(maxheight, viewport_h) : viewport_h
    minwidth = minwidth ? parse(minwidth, maxwidth) : 150
    minheight = minheight ? parse(minheight, maxheight) : this.header

    if (autosize) {
      ;(root || body).appendChild(this.body)

      width = Math.max(Math.min(this.body.clientWidth + border * 2 + 1, maxwidth), minwidth)
      height = Math.max(Math.min(this.body.clientHeight + this.header + border + 1, maxheight), minheight)

      this.dom.appendChild(this.body)
    } else {
      width = width ? parse(width, maxwidth) : Math.max(maxwidth / 2, minwidth) | 0
      height = height ? parse(height, maxheight) : Math.max(maxheight / 2, minheight) | 0
    }

    x = x ? parse(x, viewport_w, width) : left
    y = y ? parse(y, viewport_h, height) : top

    this.x = x
    this.y = y
    this.width = width
    this.height = height
    this.minwidth = minwidth
    this.minheight = minheight
    this.maxwidth = maxwidth
    this.maxheight = maxheight
    this.top = top
    this.right = right
    this.bottom = bottom
    this.left = left
    this.index = index ?? 0
    this.overflow = overflow ?? false
    //this.border = border;
    this.min = false
    this.max = false
    this.full = false
    this.hidden = false
    this.focused = false

    this.onclose = onclose
    this.onfocus = onfocus
    this.onblur = onblur
    this.onmove = onmove
    this.onresize = onresize
    this.onfullscreen = onfullscreen
    this.onmaximize = onmaximize
    this.onminimize = onminimize
    this.onrestore = onrestore
    this.onhide = onhide
    this.onshow = onshow

    if (hidden) {
      this.hide()
    } else {
      this.focus()
    }

    if (index || index === 0) {
      this.index = index
      setStyle(this.dom, "z-index", index)
      if (index > index_counter) index_counter = index
    }

    if (max) {
      this.maximize()
    } else if (min) {
      this.minimize()
    } else {
      this.resize().move()
    }

    register(this)
    ;(root || body).appendChild(this.dom)
    oncreate && oncreate.call(this, params)
  }

  static new(params: WinBoxParams) {
    return new WinBox(params)
  }

  static stack() {
    return stack_win
  }

  mount(src: HTMLElement): WinBox {
    this.unmount()
    this.body.textContent = ""
    this.body.appendChild(src)
    return this
  }

  unmount(dest?: HTMLElement): WinBox {
    const node = this.body.firstChild
    if (node) {
      const root = dest || (node as any)._backstore
      root && root.appendChild(node)
      ;(node as any)._backstore = dest
    }
    return this
  }

  setTitle(title: string): WinBox {
    const node = getByClass(this.dom, "wb-title") as HTMLElement
    setText(node, (this.title = title))
    return this
  }

  setIcon(src: string): WinBox {
    const img = getByClass(this.dom, "wb-icon") as HTMLElement
    setStyle(img, "background-image", "url(" + src + ")")
    setStyle(img, "display", "inline-block")
    return this
  }

  setBackground(background: string): WinBox {
    setStyle(this.dom, "background", background)
    return this
  }

  setUrl(url: string, onload?: () => void): WinBox {
    const node = this.body.firstChild as HTMLIFrameElement
    if (node && node.tagName.toLowerCase() === "iframe") {
      node.src = url
    } else {
      this.body.innerHTML = "<iframe src=\"" + url + "\"></iframe>"
      if (onload) (this.body.firstChild as HTMLIFrameElement).onload = onload
    }
    return this
  }

  focus(state?: boolean): WinBox {
    if (state === false) {
      return this.blur()
    }

    if (!this.focused) {
      const stack_length = stack_win.length

      if (stack_length > 1) {
        for (let i = 1; i <= stack_length; i++) {
          const last_focus = stack_win[stack_length - i]
          if (last_focus.focused /*&& last_focus !== this*/) {
            last_focus.blur()
            stack_win.push(stack_win.splice(stack_win.indexOf(this), 1)[0])
            break
          }
        }
      }

      setStyle(this.dom, "z-index", ++index_counter)
      this.index = index_counter
      this.addClass("focus")
      this.focused = true
      this.onfocus && this.onfocus()
    }

    return this
  }

  blur(state?: boolean): WinBox {
    if (state === false) {
      return this.focus()
    }

    if (this.focused) {
      this.removeClass("focus")
      this.focused = false
      this.onblur && this.onblur()
    }

    return this
  }

  hide(state?: boolean): WinBox {
    if (state === false) {
      return this.show()
    }

    if (!this.hidden) {
      this.onhide && this.onhide()
      this.hidden = true
      return this.addClass("hide")
    }
    return this
  }

  show(state?: boolean): WinBox {
    if (state === false) {
      return this.hide()
    }

    if (this.hidden) {
      this.onshow && this.onshow()
      this.hidden = false
      return this.removeClass("hide")
    }
    return this
  }

  minimize(state?: boolean): WinBox {
    if (state === false) {
      return this.restore()
    }

    if (is_fullscreen) {
      cancel_fullscreen()
    }

    if (this.max) {
      this.removeClass("max")
      this.max = false
    }

    if (!this.min) {
      stack_min.push(this)
      update_min_stack()
      this.dom.title = this.title
      this.addClass("min")
      this.min = true

      if (this.focused) {
        this.blur()
        focus_next()
      }

      this.onminimize && this.onminimize()
    }

    return this
  }

  restore(): WinBox {
    if (is_fullscreen) {
      cancel_fullscreen()
    }

    if (this.min) {
      remove_min_stack(this)
      this.resize().move()
      this.onrestore && this.onrestore()
    }

    if (this.max) {
      this.max = false
      this.removeClass("max").resize().move()
      this.onrestore && this.onrestore()
    }

    return this
  }

  maximize(state?: boolean) {
    if (state === false) {
      return this.restore()
    }

    if (is_fullscreen) {
      cancel_fullscreen()
    }

    if (this.min) {
      remove_min_stack(this)
    }

    if (!this.max) {
      this.addClass("max")
          .resize(root_w - this.left - this.right, root_h - this.top - this.bottom /* - 1 */, true)
          .move(this.left, this.top, true)

      this.max = true
      this.onmaximize && this.onmaximize()
    }

    return this
  }

  close(force?: boolean): void {
    if (this.onclose && this.onclose(force)) {
      return
    }

    if (this.min) {
      remove_min_stack(this)
    }

    stack_win.splice(stack_win.indexOf(this), 1)

    this.unmount()
    this.dom.remove()
    this.dom.textContent = ""
    ;(this.dom as any).winbox = null
    this.focused && focus_next()
  }

  fullscreen(state?: boolean): WinBox {
    if (this.min) {
      remove_min_stack(this)
      this.resize().move()
    }

    if (!is_fullscreen || !cancel_fullscreen()) {
      const fn = this.body[prefix_request] as () => void
      fn?.()
      is_fullscreen = this
      this.full = true
      this.onfullscreen && this.onfullscreen()
    } else if (state === false) {
      return this.restore()
    }

    return this
  }

  move(x?: number | string, y?: number | string, _skip_update?: boolean): WinBox {
    if (!x && x !== 0) {
      x = this.x
      y = this.y
    } else if (!_skip_update) {
      this.x = x ? (x = parse(x, root_w - this.left - this.right, this.width)) : 0
      this.y = y ? (y = parse(y, root_h - this.top - this.bottom, this.height)) : 0
    }

    setStyle(this.dom, "left", x + "px")
    setStyle(this.dom, "top", y + "px")
    this.onmove && this.onmove(x as number, y as number)
    return this
  }

  resize(w?: number | string, h?: number | string, _skip_update?: boolean): WinBox {
    if (!w && w !== 0) {
      w = this.width
      h = this.height
    } else if (!_skip_update) {
      this.width = w ? (w = parse(w, this.maxwidth)) : 0
      this.height = h ? (h = parse(h, this.maxheight)) : 0

      w = Math.max(w as number, this.minwidth)
      h = Math.max(h as number, this.minheight)
    }

    setStyle(this.dom, "width", w + "px")
    setStyle(this.dom, "height", h + "px")

    this.onresize && this.onresize(w as number, h as number)
    return this
  }

  addControl(control: {
    class?: string
    image?: string
    click?: (event: MouseEvent, self: WinBox) => void
    index?: number
  }): WinBox {
    const classname = control.class
    const image = control.image
    const click = control.click
    const index = control.index
    const node = document.createElement("span")
    const icons = getByClass(this.dom, "wb-control") as HTMLElement
    const self = this

    if (classname) if (classname) node.className = classname
    if (image) setStyle(node, "background-image", "url(" + image + ")")
    if (click)
      node.onclick = function (event) {
        click.call(this, event, self)
      }

    icons.insertBefore(node, icons.childNodes[index || 0])

    return this
  }

  removeControl(control: string) {
    const controlElement = getByClass(this.dom, control)
    controlElement && controlElement.remove()
    return this
  }

  addClass(classname: string): WinBox {
    addClass(this.dom, classname)
    return this
  }

  removeClass(classname: string): WinBox {
    removeClass(this.dom, classname)
    return this
  }

  hasClass(classname: string) {
    return hasClass(this.dom, classname)
  }

  toggleClass(classname: string) {
    return this.hasClass(classname) ? this.removeClass(classname) : this.addClass(classname)
  }
}

/**
 * @param {number|string} num
 * @param {number} base
 * @param {number=} center
 * @return number
 */
function parse(num: number | string, base: number, center = 0): number {
  if (typeof num === "string") {
    if (num === "center") {
      num = ((base - center) / 2 + 0.5) | 0
    } else if (num === "right" || num === "bottom") {
      num = base - center
    } else {
      const value = parseFloat(num)
      const unit = "" + value !== num && num.substring(("" + value).length)
      if (unit === "%") {
        num = ((base / 100) * value + 0.5) | 0
      } else {
        num = value
      }
    }
  }
  return num as number
}

function setup() {
  body = document.body

  body[(prefix_request = "requestFullscreen")]
  // ||
  // body[prefix_request = "msRequestFullscreen"] ||
  // body[prefix_request = "webkitRequestFullscreen"] ||
  // body[prefix_request = "mozRequestFullscreen"] ||
  // (prefix_request = "");

  prefix_exit =
      prefix_request &&
      prefix_request.replace("request", "exit").replace("mozRequest", "mozCancel").replace("Request", "Exit")

  addListener(window, "resize", function () {
    init()
    update_min_stack()
  })

  addListener(
      body,
      "mousedown",
      function (event) {
        window_clicked = false
      },
      true
  )

  addListener(body, "mousedown", function (event) {
    if (!window_clicked) {
      const stack_length = stack_win.length
      if (stack_length) {
        for (let i = stack_length - 1; i >= 0; i--) {
          const last_focus = stack_win[i]
          if (last_focus.focused) {
            last_focus.blur()
            break
          }
        }
      }
    }
  })

  init()
}

/**
 * @param {WinBox} self
 */
function register(self: WinBox) {
  addWindowListener(self, "drag")
  addWindowListener(self, "n")
  addWindowListener(self, "s")
  addWindowListener(self, "w")
  addWindowListener(self, "e")
  addWindowListener(self, "nw")
  addWindowListener(self, "ne")
  addWindowListener(self, "se")
  addWindowListener(self, "sw")

  addListener(getByClass(self.dom, "wb-min")!, "click", function (event) {
    preventEvent(event)
    self.min ? self.restore().focus() : self.minimize()
  })

  addListener(getByClass(self.dom, "wb-max")!, "click", function (event) {
    preventEvent(event)
    self.max ? self.restore().focus() : self.maximize().focus()
  })

  if (prefix_request) {
    addListener(getByClass(self.dom, "wb-full")!, "click", function (event) {
      preventEvent(event)
      self.fullscreen().focus()
    })
  } else {
    self.addClass("no-full")
  }

  addListener(getByClass(self.dom, "wb-close")!, "click", function (event) {
    preventEvent(event)
    self.close()
  })

  addListener(
      self.dom,
      "mousedown",
      function (event) {
        window_clicked = true
      },
      true
  )

  addListener(
      self.body,
      "mousedown",
      function (event) {
        self.focus()
      },
      true
  )
}

/**
 * @param {WinBox} self
 */
function remove_min_stack(self: WinBox) {
  stack_min.splice(stack_min.indexOf(self), 1)
  update_min_stack()
  self.removeClass("min")
  self.min = false
  self.dom.title = ""
}

function update_min_stack() {
  const length = stack_min.length
  const splitscreen_index: { [key: string]: number } = {}
  const splitscreen_length: { [key: string]: number } = {}

  for (let i = 0, self, key; i < length; i++) {
    self = stack_min[i]
    key = self.left + ":" + self.top

    if (splitscreen_length[key]) {
      splitscreen_length[key]++
    } else {
      splitscreen_index[key] = 0
      splitscreen_length[key] = 1
    }
  }

  for (let i = 0, self, key, width; i < length; i++) {
    self = stack_min[i]
    key = self.left + ":" + self.top
    width = Math.min((root_w - self.left - self.right) / splitscreen_length[key], 250)
    self
        .resize((width + 1) | 0, self.header, true)
        .move((self.left + splitscreen_index[key] * width) | 0, root_h - self.bottom - self.header, true)
    splitscreen_index[key]++
  }
}

/**
 * @param {WinBox} self
 * @param {string} dir
 */
function addWindowListener(self: WinBox, dir: string) {
  const node = getByClass(self.dom, "wb-" + dir)
  if (!node) return

  let touch: Touch, x: number, y: number
  let raf_timer: number, raf_move: boolean, raf_resize: boolean
  let dblclick_timer = 0

  addListener(node, "mousedown", mousedown as EventListener, eventOptions)
  addListener(node, "touchstart", mousedown as EventListener, eventOptions)

  function loop() {
    raf_timer = requestAnimationFrame(loop)

    if (raf_resize) {
      self.resize()
      raf_resize = false
    }

    if (raf_move) {
      self.move()
      raf_move = false
    }
  }

  function mousedown(event: MouseEvent | TouchEvent) {
    preventEvent(event, true)
    self.focus()

    if (dir === "drag") {
      if (self.min) {
        self.restore()
        return
      }

      if (!self.hasClass("no-max")) {
        const now = Date.now()
        const diff = now - dblclick_timer

        dblclick_timer = now

        if (diff < 300) {
          self.max ? self.restore() : self.maximize()
          return
        }
      }
    }

    if (!self.min) {
      addClass(body, "wb-lock")
      use_raf && loop()

      if (event instanceof TouchEvent && (touch = event.touches[0])) {
        addListener(window, "touchmove", handler_mousemove as EventListener, eventOptionsPassive)
        addListener(window, "touchend", handler_mouseup as EventListener, eventOptionsPassive)
      } else if (event instanceof MouseEvent) {
        addListener(window, "mousemove", handler_mousemove as EventListener, eventOptionsPassive)
        addListener(window, "mouseup", handler_mouseup as EventListener, eventOptionsPassive)
      }

      x = touch?.pageX ?? 0
      y = touch?.pageY ?? 0
    }
  }

  function handler_mousemove(event: MouseEvent | TouchEvent) {
    preventEvent(event)

    let touch
    event instanceof TouchEvent && (touch = event.touches[0])

    const pageX = touch?.pageX ?? 0
    const pageY = touch?.pageY ?? 0
    const offsetX = pageX - x
    const offsetY = pageY - y

    const old_w = self.width
    const old_h = self.height
    const old_x = self.x
    const old_y = self.y

    let resize_w, resize_h, move_x, move_y

    if (dir === "drag") {
      if (self.hasClass("no-move")) return

      self.x += offsetX
      self.y += offsetY
      move_x = move_y = 1
    } else {
      if (dir === "e" || dir === "se" || dir === "ne") {
        self.width += offsetX
        resize_w = 1
      } else if (dir === "w" || dir === "sw" || dir === "nw") {
        self.x += offsetX
        self.width -= offsetX
        resize_w = 1
        move_x = 1
      }

      if (dir === "s" || dir === "se" || dir === "sw") {
        self.height += offsetY
        resize_h = 1
      } else if (dir === "n" || dir === "ne" || dir === "nw") {
        self.y += offsetY
        self.height -= offsetY
        resize_h = 1
        move_y = 1
      }
    }

    if (resize_w) {
      self.width = Math.max(Math.min(self.width, self.maxwidth, root_w - self.x - self.right), self.minwidth)
      resize_w = self.width !== old_w
    }

    if (resize_h) {
      self.height = Math.max(Math.min(self.height, self.maxheight, root_h - self.y - self.bottom), self.minheight)
      resize_h = self.height !== old_h
    }

    if (resize_w || resize_h) {
      use_raf ? (raf_resize = true) : self.resize()
    }

    if (move_x) {
      if (self.max) {
        self.x =
            (pageX < root_w / 3
                ? self.left
                : pageX > (root_w / 3) * 2
                    ? root_w - self.width - self.right
                    : root_w / 2 - self.width / 2) + offsetX
      }
      self.x = Math.max(
          Math.min(self.x, self.overflow ? root_w - 30 : root_w - self.width - self.right),
          self.overflow ? 30 - self.width : self.left
      )
      move_x = self.x !== old_x
    }

    if (move_y) {
      if (self.max) {
        self.y = self.top + offsetY
      }
      self.y = Math.max(
          Math.min(self.y, self.overflow ? root_h - self.header : root_h - self.height - self.bottom),
          self.top
      )
      move_y = self.y !== old_y
    }

    if (move_x || move_y) {
      if (self.max) {
        self.restore()
      }
      use_raf ? (raf_move = true) : self.move()
    }

    if (resize_w || move_x) {
      x = pageX
    }

    if (resize_h || move_y) {
      y = pageY
    }
  }

  function handler_mouseup(event: MouseEvent | TouchEvent) {
    preventEvent(event)
    removeClass(body, "wb-lock")
    use_raf && cancelAnimationFrame(raf_timer)

    if (event instanceof TouchEvent) {
      removeListener(window, "touchmove", handler_mousemove as EventListener, eventOptionsPassive)
      removeListener(window, "touchend", handler_mouseup as EventListener, eventOptionsPassive)
    } else if (event instanceof MouseEvent) {
      removeListener(window, "mousemove", handler_mousemove as EventListener, eventOptionsPassive)
      removeListener(window, "mouseup", handler_mouseup as EventListener, eventOptionsPassive)
    }
  }
}

function focus_next(): void {
  const stack_length = stack_win.length

  if (stack_length) {
    for (let i = stack_length - 1; i >= 0; i--) {
      const last_focus = stack_win[i]

      if (!last_focus.min /*&& last_focus !== this*/) {
        last_focus.focus()
        break
      }
    }
  }
}

function cancel_fullscreen(): boolean {
  is_fullscreen!.full = false

  if (has_fullscreen()) {
    // exitFullscreen is executed as async and returns promise.
    // the important part is that the promise callback runs before the event "onresize" was fired!

    ;(document as any)[prefix_exit]()
    return true
  }

  return false
}

function has_fullscreen(): boolean {
  return (
      !!document.fullscreen || !!document.fullscreenElement
      // ||
      // !!document.webkitFullscreenElement ||
      // !!document.mozFullScreenElement
  )
}

function init() {
  const doc = document.documentElement
  root_w = doc.clientWidth
  root_h = doc.clientHeight
}

export default WinBox
