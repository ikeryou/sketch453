import { Object3D, Vector2 } from "three"
import Delaunator from "delaunator";
import { Canvas } from "../webgl/canvas"
import { Item } from "./item"
import { Func } from "../core/func"
import { Util } from "../libs/util"
import { MousePointer } from "../core/mousePointer";

export class Visual extends Canvas {

  private _con: Object3D
  private _item: Array<Item> = []

  constructor(opt:any) {
    super(opt)

    this._con = new Object3D()
    this.mainScene.add(this._con)

    const sw = 1
    const sh = 1

    const t:Array<Array<number>> = [];
    // t.push([-sw * 0.5, sh * 0.5]);
    // t.push([sw * 0.5, sh * 0.5]);
    // t.push([sw * 0.5, -sh * 0.5]);
    // t.push([-sw * 0.5, -sh * 0.5]);

    const triNum = 300;
    for(let l = 0; l < triNum; l++) {
      t.push([Util.random(-sw * 0.5, sw * 0.5), Util.random(-sh * 0.5, sh * 0.5)]);
    }
    const r = Delaunator.from(t);

    const tri = r.triangles
    let i = 0
    while(i < tri.length) {
      const a = tri[i + 0]
      const b = tri[i + 1]
      const c = tri[i + 2]
      const item = new Item(
        i / 3,
        new Vector2(t[a][0], t[a][1]),
        new Vector2(t[b][0], t[b][1]),
        new Vector2(t[c][0], t[c][1]),
      );
      this._con.add(item);
      this._item.push(item);
      i += 3
    }

    this._resize()
  }


  _update():void {
    super._update()

    const s = Math.min(Func.sw(), Func.sh()) * Func.val(1, 0.85)
    this._con.scale.set(s, s, 1)

    const mx = MousePointer.instance.easeNormal.x * -50
    const my = MousePointer.instance.easeNormal.y * 50

    this._con.position.x = mx
    this._con.position.y = my

    const kake = 0.5
    this._con.rotation.y = Util.radian(mx * -kake)
    this._con.rotation.x = Util.radian(my * kake)

    if(this.isNowRenderFrame()) {
      this._render()
    }
  }

  _render():void {
    this.renderer.setClearColor(0x000000, 1)
    this.renderer.render(this.mainScene, this.cameraPers)
  }

  isNowRenderFrame():boolean {
    return true
  }

  _resize():void {
    super._resize()

    const w = Func.sw()
    const h = Func.sh()

    this.renderSize.width = w
    this.renderSize.height = h

    this._updateOrthCamera(this.cameraOrth, w, h)
    this._updatePersCamera(this.cameraPers, w, h)

    let pixelRatio:number = window.devicePixelRatio || 1
    this.renderer.setPixelRatio(pixelRatio)
    this.renderer.setSize(w, h)
  }
}