class SPIntegration {
  /**
   * @param {PlainObject} editor svgedit handler
   */
  constructor(editor) {
    this.editor = editor;
  }

//return url enity param if exists
  getUrlEntity() {
    const windowUrl = window.location.search;
    const params = new URLSearchParams(windowUrl);
    if (params.has("entity_id")) {
      return params.get("entity_id"); 
    }
    return null;
  }

  getUrlReturn() {
    const windowUrl = window.location.search;
    const params = new URLSearchParams(windowUrl);
    if (params.has("returnUrl")) {
      return params.get("returnUrl");
    }
    return null;
  }

 
  /**
   *
   * @returns {Promise<void>} Resolves to `undefined`
   */
  async SPOpen () {
    try {
      //get entity_id from url parm
      var entity_id = this.getUrlEntity();
      var returnUrl = this.getUrlReturn();
      if (entity_id === null || returnUrl === null) return;
      

      var svgContent = "";
      var SvgName = ""
      await fetch(`https://${returnUrl}/api/EntityByIdForSVGEditor/${entity_id}`, {
        method: 'Get',
        credentials: 'include'
      })
        .then((res) => res.json())
        .then((data) => {
          console.log(data);
          if (data.length === 1) {//cannot be more than 1 item
            svgContent = atob(data[0].icon);
            SvgName = data[0].iconlabel + ".svg";
          }
        }).catch(err => {
          console.log(err);
          return;
        })

      if (svgContent !== "") {
        await this.editor.loadSvgString(svgContent)
        this.editor.updateCanvas()
        var blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
        blob.name = SvgName;
        this.editor.topPanel.updateTitle(blob.name)
        this.editor.svgCanvas.runExtensions('onOpenedDocument', {
          name: blob.name,
          lastModified: blob.lastModified,
          size: blob.size,
          type: blob.type
        })
        this.editor.zoomChanged(window, 'canvas')
      } else {
        alert("Could not find Entity_id!  Please contact support")
        this.editor.leftPanel.clickSelect()
        this.editor.svgCanvas.clear()
        this.editor.updateCanvas(true)
        this.editor.zoomChanged(window, 'canvas')
        this.editor.layersPanel.populateLayers()
        this.editor.topPanel.updateContextPanel()
        this.editor.topPanel.updateTitle('untitled.svg')
      }
      
      
    } catch (err) {
      if (err.name !== 'AbortError') {
        return console.error(err)
      }
    }
  }

}



export default SPIntegration
