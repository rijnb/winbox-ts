import WinBox from "./winBox"

(function() {

  let winbox: any;

  (window as any).examples = {

    "basic": function() {
      new WinBox({title: "Basic Window"})
    },
    "root": function() {
      new WinBox({
        title: "Custom Root",

        root: document.querySelector("main") ?? undefined
      })
    },
    "border": function() {
      new WinBox({
        title: "Custom Border",
        border: 5
      })
    },
    "color": function() {
      new WinBox({
        title: "Custom Color",
        background: "#ff005d",
        border: 4
      })
    },

    "icon": function() {
      new WinBox({
        title: "Custom Icon",
        icon: "demo/wikipedia.svg",
        background: "#252b4e"
      })
    },

    "viewport": function() {
      new WinBox({
        title: "Limit Viewport",
        top: 50,
        right: 50,
        bottom: 0,
        left: 50
      })
    },
    "splitscreen": function() {
      new WinBox({
        title: "Splitscreen (Left)",
        right: 300,
        max: true
      })
      new WinBox({
        title: "Splitscreen (Right)",
        left: 300,
        max: true
      })
    },
    "position": function() {
      new WinBox({
        title: "Custom Position / Size",
        x: 400,
        y: 200,
        width: 300,
        height: 200
      })
    },
    "modal": function() {
      new WinBox({
        title: "Modal Window",
        modal: true
      })
    },
    "innerhtml": function() {
      new WinBox({
        title: "Set innerHTML",
        html: "<h1>Lorem Ipsum</h1>"
      })
    },
    "mount-clone": function() {
      new WinBox({
        title: "Mount DOM",
        mount: document.getElementById("content")?.cloneNode(true) as HTMLElement
      })
    },
    "mount-auto": function() {
      new WinBox({
        title: "Mount DOM",
        mount: document.getElementById("content") ?? undefined
      })
    },
    "iframe": function() {
      new WinBox({
        title: "WinBox.js",
        url: "https://nextapps-de.github.io/winbox/",
        class: "iframe"
      })
    },
    "all-options": function() {
      new WinBox({
        // configuration:
        index: 1,
        id: "my-window",
        root: document.body,
        class: ["no-full", "no-max", "my-theme"],

        // appearance:
        title: "All Options",
        background: "#fff",
        border: 4,
        header: 45,
        icon: undefined,

        // initial state:
        modal: false,
        max: false,
        min: false,
        hidden: false,

        // dimension:
        width: 250,
        height: 200,
        minheight: 55,
        minwidth: 100,
        maxheight: 300,
        maxwidth: 500,
        autosize: true,

        // position:
        x: 400,
        y: 200,

        // viewport boundaries:
        top: 50,
        right: 50,
        bottom: 0,
        left: 50,

        // contents (choose from):
        url: undefined,
        mount: undefined,
        html: "width: 250, height: 200",

        // callbacks:
        oncreate: function(options: any) {
          options.icon = "demo/wikipedia.svg"
        },
        onshow: function() {
          console.log("Show:", this.id)
        },
        onhide: function() {
          console.log("Hide:", this.id)
        },
        onfocus: function() {
          (this as any as WinBox).setBackground("#fff")
        },
        onblur: function() {
          (this as any as WinBox).setBackground("#999")
        },
        onresize: function(w: number, h: number) {
          (this as any as WinBox).body.textContent =
            `width: ${w}, height: ${h}`
        },
        onmove: function(x: number, y: number) {
          (this as any as WinBox).body.textContent =
            `x: ${x}, y: ${y}`
        },
        onclose: function(force?: boolean) {
          return !confirm("Close window?")
        },
        onfullscreen: function() {
          console.log("Fullscreen:", this.id)
        },
        onmaximize: function() {
          console.log("Maximize:", this.id)
        },
        onminimize: function() {
          console.log("Minimize:", this.id)
        },
        onrestore: function() {
          console.log("Restore:", this.id)
        }
      })
    },
    "custom-css": function() {

      new WinBox({
        title: "Custom CSS",
        width: 350,
        height: 250,
        class: "custom",
        mount: document.getElementById("content")?.cloneNode(true) as HTMLElement
      })
    },
    "custom-class": function() {

      new WinBox({
        title: "Custom CSS (Class)",
        class: "my-theme",
        mount: document.getElementById("content")?.cloneNode(true) as HTMLElement
      })
    },
    "custom-control": function() {

      const winbox = new WinBox({title: "Custom Controls", class: "no-full", background: "#313646"})
      winbox.removeControl("wb-max").removeControl("wb-min")
      winbox.addControl({
        // the position index
        index: 0,
        // classname to apply styling
        class: "wb-like",
        // icon url when not specified via classname
        image: "demo/heart.svg",
        // click listener
        click: function(event: Event, winbox: any) {
          // the winbox instance will be passed as 2nd parameter
          console.log(winbox.id);
          // "this" refers to the button which was clicked:
          (this as HTMLElement).classList.toggle("active")
        }
      })
    },
    "custom-template": function() {

      const template = document.createElement("div")
      template.innerHTML = `
                    <div class=wb-header>
                        <div class=wb-control>
                            <span class=wb-custom></span>
                            <span class=wb-close></span>
                        </div>
                        <div class=wb-drag>
                            <div class=wb-title></div>
                        </div>
                    </div>
                    <div class=wb-body></div>
                `

      new WinBox({title: "Custom Template", template, background: "#313646"})
    },
    "theme-modern": function() {

      new WinBox({
        title: "Theme: Modern",
        class: "modern",
        mount: document.getElementById("content")?.cloneNode(true) as HTMLElement
      })
    },
    "controls": function() {

      winbox = new WinBox({
        title: "Controls",
        mount: document.getElementById("controls") as HTMLElement,
        border: 4,
        onclose: function(force?: boolean) {
          return !force && !confirm("Close window?")
        }
      })
    }
  };

  (window as any).buttons = {
    minimize: function() {
      winbox.minimize(!winbox.min)
    },
    maximize: function() {
      winbox.maximize(!winbox.max)
    },
    fullscreen: function() {
      winbox.fullscreen(!winbox.full)
    },
    center: function() {
      winbox.move("center", "center")
    },
    move: function() {
      winbox.move("right", "bottom")
    },
    resize: function() {
      winbox.resize("50%", "50%")
    },
    title: function() {
      winbox.setTitle("Title-" + Math.random())
    },
    color: function() {
      winbox.setBackground(
        "rgb(" + (Math.random() * 255 | 0) + "," +
        (Math.random() * 255 | 0) + "," +
        (Math.random() * 255 | 0) + ")"
      )
    },
    modal: function() {
      winbox.toggleClass("modal")
    },
    add: function() {
      winbox.addClass("my-theme")
    },
    remove: function() {
      winbox.removeClass("my-theme")
    },
    close: function() {
      winbox.close()
    },
    force_close: function() {
      winbox.close(true)
    }
  }
}())
