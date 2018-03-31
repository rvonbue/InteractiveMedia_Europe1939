import BaseAnimatedModel from "./BaseAnimatedModel";
import eventController from "../../controllers/eventController";
import TWEEN from "tween.js";

let MesserschmittModel = BaseAnimatedModel.extend({
  defaults: {
    "name":"messerschmitt",
    "baseUrl": "models3d/animatedModels/",
    "modelNames":["messerschmitt", "spitfirePropeller"],
    "power": "axis"
  },
  addListeners: function () {
    BaseAnimatedModel.prototype.addListeners.apply(this, arguments);
    this.setInitPivot();
  },
  modelReady: function () {

    this.getPivot().children.forEach( (mesh)=> {
      let clone = mesh.clone();
      eventController.trigger(eventController.ADD_MODEL_TO_SCENE, [clone]);
      clone.position.x += 1.5;
      clone.position.z += 1.5;
      this.getPivot().add(clone);
    });

  },
  setMesh3d: function (mesh3d) {
    BaseAnimatedModel.prototype.setMesh3d.apply(this, arguments);
    if ( mesh3d.name === "spitfirePropeller" ) this.translateInitPropeller(mesh3d);
  },
  createTween: function (from, to, duration) {
    let tween = new TWEEN.Tween( from, {override:true} )
        .to( to, duration )
        .yoyo( true );

    tween.timelineName = this.get("name");
    this.get("tweens").push(tween);
    return tween;
  },
  translateInitPropeller: function (mesh3d) {
    this.translateCenterPoint(mesh3d);
  },
  startAnimation: function () {
    this.initAnimationTweens();
    this.get("tweens").forEach( (tween)=> { tween.start(); });
  },
  stopAnimation: function () {
    this.get("tweens").forEach( (tween)=> { tween.stop(); });
    this.set("tweens", []);
  },
  getPropellerMesh: function () {
    return _.filter(this.getPivot().children, (mesh3d)=> { return mesh3d.name === "spitfirePropeller"; });
  },
  initAnimationTweens: function () {
    let propellerMesh3d = this.getPropellerMesh();

    propellerMesh3d.forEach( (mesh3d)=> {
      this.createTween(mesh3d.rotation,  { z: "+150" }, 5000);
    }, this);

    this.createTween(this.getPivot().rotation,  { z: -0.15 }, 500)    // setRandomFlightNoise
  },
  setInitPivot: function () {
    this.getPivot().rotation.set(0, Math.PI / -2, 0 );
    this.getPivot().scale.set(0.1,0.1,0.1 );
  },
  resetPosition: function () {
    let pos = this.get("startPosition");
    this.getPivot().position.set(pos.x, pos.y, pos.z);
  },
  translateCenterPoint: function (mesh3d) {
    let distX = 0.00097;  // Magic Number propeller THREEjs cannot computer center correctly
    let distY = 0.08204;
    let distZ = -0.43746;
    mesh3d.geometry.translate( -distX,-distY, -distZ );
    mesh3d.position.set(distX, distY, distZ);
  }
});

_.defaults(MesserschmittModel.prototype.defaults, BaseAnimatedModel.prototype.defaults);

module.exports = MesserschmittModel;
