// import eventController from "../controllers/eventController";
import utils from "../components/utils";
import TWEEN from "tween.js";

let SceneModel = Backbone.Model.extend({
  defaults: {
    "name": "Caesar_Salad",
    "mesh3d": null,
    "text3d": null,  // mesh
    "selected": false,
    "hover": false,
    "loading": false,
    "ready": false,
    "interactive": true,
    "animating": false,
    "power": null
  },
  initialize: function( options ) {
    this.addModelListeners();
  },
  addModelListeners: function () {
    this.on("change:selected", this.onChangeSelected);
    this.on("change:hover", this.onChangeHover);
    let self = this;
    this.once("change:mesh3d", ()=> {
        self.set("initPos", _.clone(self.get("mesh3d").position));
    });
  },
  removeModelListeners: function () {
    this.off("change:selected", this.onChangeSelected);
    this.off("change:hover", this.onChangeHover);
  },
  onChangeHover: function () {
    if ( this.get("selected") === true || this.get("animating" === true)) return;
    if (this.get("hover") === true ) {
      this.highlightMaterial();
    } else {
      this.unhighlightMaterial();
    }

    this.getTween(
      this.getMesh3d().position,
      { y: this.get("initPos").y + this.get("hover") ? 0.05 : 0 }
    )
    .start();
  },
  onChangeSelected: function () {
    // if (this.get("hover")) return;
    if ( this.get("selected") ) {
      this.animateBleed();
    } else {
      TWEEN.removeAll();
      this.unhighlightMaterial();
    }
  },
  resetImageTexture: function (context) {
    context.beginPath();
    context.clearRect(0, 0, 512,512);
    context.closePath();
    context.fillStyle = "#000000";
    context.fillRect(0,0,512,512);
    this.updateTextureMap();
    context.drawImage(this.getBorderImage(), 0, 0);
  },
  animateBleed: function () {
    let canvas = this.getTextureCanvas();
    let context = canvas.getContext( '2d' );
    let self = this;
    this.resetImageTexture(context);

    new TWEEN.Tween(0)
      // .easing(TWEEN.Easing.Circular.Out)
      .interpolation(TWEEN.Interpolation.Bezier)
      .to(1, 2000)
      .onUpdate(function (val) {
        context.fillStyle = self.getHighlightColor();
        context.arc(256, 256, 350 * val, 0, 2 * Math.PI, false);
        context.fill();
        context.drawImage(self.getBorderImage(), 0,0);
        self.updateTextureMap();
        console.log("sfsadf");
      })
      .onComplete(function () {
        self.set("animating", false);
      })
      .start();
  },
  getMesh3d: function () {
    return this.get("mesh3d");
  },
  getHighlightColor: function () {
    return this.get("power") === 0 ? utils.getColorPallete().ally : utils.getColorPallete().axis;
  },
  getTween: function (to, from) {
    let self = this;
    self.set("animating", true);
    return new TWEEN.Tween(to)
      .easing(TWEEN.Easing.Circular.Out)
      .interpolation(TWEEN.Interpolation.Bezier)
      .to(from, 500)
      .onComplete(function () {
        self.set("animating", false);
      });
  },
  getBorderImage: function () {
    return this.get("mesh3d").material.map.borderImage;
  },
  getTextureCanvas: function () {
    return this.get("mesh3d").material.map.image;
  },
  getCanvasContext: function () {
    return this.getTextureCanvas().getContext( '2d' );
  },
  updateTextureMap: function () {
    this.get("mesh3d").material.map.needsUpdate = true;
  },
  highlightHover: function () {

  },
  unhighlightHover: function () {

  },
  unhighlightMaterial: function () {
    let context = this.getCanvasContext();
    context.fillStyle = "#000000";
    context.fillRect(0,0,512,512);
    this.updateTextureMap();
    context.drawImage(this.getBorderImage(), 0,0);
  },
  highlightMaterial: function () {
    let context = this.getCanvasContext();
    context.fillStyle = this.getHighlightColor();
    context.fillRect(0,0,512,512);
    this.updateTextureMap();
    context.drawImage(this.getBorderImage(), 0,0);
  },
  reset: function (showHideBool) {
    this.set("selected", false);
    this.set("hover", false);
  },
  isReady: function () {
    return this.get("ready") && !this.get("loading");
  },
  showHide: function () { // show = true

  },
  getZoomPoint: function () {
    let mesh3d = this.get("mesh3d");
    return utils.getMeshCenterRadius(_.clone(mesh3d.position), _.clone(mesh3d.geometry.boundingSphere));
  },
  getSize: function (mesh) {
    mesh = mesh ? mesh : this.get("mesh3d");
    let bb = mesh.geometry.boundingBox;
    return {
      w: Math.abs(bb.max.x) + Math.abs(bb.min.x),
      h: Math.abs(bb.max.y) + Math.abs(bb.min.y),
      l: Math.abs(bb.max.z) + Math.abs(bb.min.z)
    };
  },
  setFadeInMaterial:function (mat) {
      mat.opacity = 0;
      mat.transparent = true;
  },
  setFadeOutMaterial: function (mat) {
      mat.transparent = true;
      mat.opacity = 1;
  },
  fadeMaterials: function (opacityEnd, materials) {
    let allMaterials = materials ? materials : this.getAllMaterials();

    allMaterials.forEach(function (mat) {
      this.fadeMaterial(mat, opacityEnd, utils.getAnimationSpeed().materialsFade);
    }, this);

  },
  fadeMaterial: function (mat, opacityEnd, tweenSpeed) {
    let newOpacityEnd = mat.opacityMax ? mat.opacityMax : opacityEnd;
    newOpacityEnd === 0 ? this.setFadeOutMaterial(mat) : this.setFadeInMaterial(mat);

    let tween = new TWEEN.Tween(mat)
        .easing(TWEEN.Easing.Circular.Out)
        .interpolation(TWEEN.Interpolation.Bezier)
        .to({ opacity: newOpacityEnd }, tweenSpeed)
        .onComplete(function () {
          if ( opacityEnd === 1  && !mat.alwaysTransparent ) {
            mat.transparent = false;
          } else if (opacityEnd === 0) {
            // self.set({ selected: false });
          }
        })
        .start();
  },
});

module.exports = SceneModel;
